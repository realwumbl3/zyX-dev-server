import { html, debugHTML, css, LiveVar, LiveList } from "/shared/dep/zyx-library/index.js";
import io from "/shared/dep/socket.io.min.esm.js";

import AppHeaderComponent from "./app-header.js";
import { RoomModel, RoomListComponent, RoomViewComponent } from "./room-manager.js";
import { roomStateManager } from "./room-manager.js";
import UserSettingsComponent from "./user-settings.js";
import UserProfileComponent from "./user-profile.js";

class AppStateManager {
    constructor() {
        this.error = new LiveVar(null);
        this.isAuthenticated = new LiveVar(false);
        this.connected = new LiveVar(false);
    }
}

export const appState = new AppStateManager();

export default class MainApp {
    constructor() {
        this.socket = null;
        this.initAuth();
        this.initSocket();

        this.header = new AppHeaderComponent(this);

        this.roomList = new RoomListComponent(this);
        this.roomView = new RoomViewComponent();
        this.userSettings = new UserSettingsComponent();
        this.userProfile = new UserProfileComponent();

        // Render the component
        html`
            <div class="homepage-container">
                ${this.header}
                <div class="auth-prompt" zyx-if-not=${appState.isAuthenticated}>
                    <div class="action-card">
                        <h2>Welcome to BoilerPlate</h2>
                        <p>Please sign in with Google to create or join rooms.</p>
                    </div>
                </div>
                <div class="homepage-content-container" zyx-else>
                    <div class="homepage-content-selector">
                        <button class="btn btn-primary" zyx-radioview="pages.content.open">Rooms</button>
                        <button class="btn btn-primary" zyx-radioview="pages.profile.open">Profile</button>
                        <button class="btn btn-primary" zyx-radioview="pages.settings.open">Settings</button>
                    </div>
                    <main class="homepage-content" this="app_main" zyx-radioview="pages.content">
                        <div class="error-message" zyx-if=${appState.error}>${appState.error.interp((e) => e || "")}</div>
                        <div class="main-layout">
                            <aside class="sidebar">${this.roomList}</aside>
                            <div class="main-content">${this.roomView}</div>
                        </div>
                    </main>
                    <main class="homepage-content" this="app_main" zyx-radioview="pages.profile">${this.userProfile}</main>
                    <main class="homepage-content" this="app_main" zyx-radioview="pages.settings">
                        ${this.userSettings}
                    </main>
                </div>
                <footer class="homepage-footer">
                    <p>&copy; ${new Date().getFullYear()} BoilerPlate. Open Source.</p>
                </footer>
            </div>
        `.bind(this);
        /** zyXSense @type {HTMLElement} */
        this.app_main;
    }

    initAuth() {
        // Check for existing auth token
        const token = localStorage.getItem("auth_token");
        if (token) {
            appState.isAuthenticated.set(true);
            // TODO: Decode token to get user info if needed
        }
    }

    updateError(error) {
        if (error !== null) {
            console.error("Error:", error);
        }
        appState.error.set(error);
    }

    initSocket() {
        // Only initialize socket if authenticated
        if (!appState.isAuthenticated.get()) {
            return;
        }

        // If we're re-initializing, clean up the prior socket first
        try {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }
        } catch (e) {
            // Ignore cleanup issues; we'll create a fresh client below
            this.socket = null;
        }

        // Get token from localStorage
        const token = localStorage.getItem("auth_token");
        if (!token) {
            this.updateError("Authentication token missing");
            return;
        }

        // Initialize Socket.IO connection
        // Important: this deployment uses multiple Gunicorn workers by default.
        // Polling transport requires sticky sessions (or a message queue); websocket-only avoids "unknown sid" 400s.
        this.socket = io(window.location.origin, {
            transports: ["websocket"],
            path: "/socket.io",
            query: { token },
        });

        this.socket.on("connect", () => {
            appState.connected.set(true);
            this.updateError(null);
        });

        this.socket.on("disconnect", () => {
            appState.connected.set(false);
        });

        this.socket.on("connect_error", (err) => {
            appState.connected.set(false);
            this.updateError(err?.message || "Failed to connect to server");
        });

        this.socket.on("room.error", (data) => {
            this.updateError(data.error || "An error occurred");
        });

        this.socket.on("user.join.result", (data) => {
            if (data.ok) {
                const newRoom = new RoomModel(this, data.code);
                roomStateManager.connectedRooms.unshift(newRoom);
                newRoom.focus();
                this.updateError(null);
            }
        });
    }

    async createRoom() {
        if (!appState.isAuthenticated.get()) return this.updateError("Please sign in first");

        const token = localStorage.getItem("auth_token");
        if (!token) return this.updateError("Authentication token missing");

        try {
            const response = await fetch("/api/room.create", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return this.updateError(error.error || "Failed to create room");
            }

            const data = await response.json();
            if (data.code) return this.joinRoom(data.code); // Auto-join the created room
        } catch (error) {
            return this.updateError(error.message);
        }
    }

    joinRoom(code) {
        if (!appState.isAuthenticated.get()) return this.updateError("Please sign in first");

        if (!this.socket || !appState.connected.get()) return this.updateError("Not connected to server");

        if (!code || code.trim() === "") {
            return this.updateError("Please enter a room code");
        }

        this.socket.emit("room.join", {
            code: code.trim(),
            clientTimestamp: Date.now(),
        });
    }
}

export const MainAppNamespace = {
    MainApp,
    AppStateManager,
    appState,
};
