import { html, debugHTML, css, LiveVar, LiveList } from "/shared/dep/zyx-library/index.js";
import io from "/shared/dep/socket.io.min.esm.js";

import HeaderComponent from "./header.js";

export const state = {
    connectedRooms: new LiveList([]),
    currentRoom: new LiveVar(null),
    error: new LiveVar(null),
    isAuthenticated: new LiveVar(false),
    connected: new LiveVar(false),
};

class RoomModel {
    constructor(app, roomCode) {
        this.app = app;
        this.roomCode = new LiveVar(roomCode);
        this.seconds = new LiveVar(0);
        this.interval = setInterval(() => this.seconds.set(this.seconds.get() + 1), 1000);
    }

    focus() {
        state.currentRoom.set(this);
    }

    leaveRoom() {
        this.app.socket.emit("room.leave", {
            code: this.roomCode.get(),
        });
        state.connectedRooms.remove(this);
        if (state.currentRoom.get() === this) state.currentRoom.set(state.connectedRooms.at(0) || null);
        clearInterval(this.interval);
    }
}

class RoomSidebarComponent {
    constructor(room) {
        this.room = room;
        this.expanded = new LiveVar(false);
        html`
            <div
                class="room-component"
                expanded=${this.expanded.interp((expanded) => expanded || null)}
                focused=${state.currentRoom.interp((currentRoom) => currentRoom === room || null)}
                zyx-click=${(e) => {
                    // Don't focus if clicking inside room-actions
                    if (e.target.closest(".room-actions")) return;
                    this.room.focus();
                }}
            >
                <h2>
                    Room: ${this.room.roomCode}
                </h2>
                <div class="room-actions">
                    <button class="btn btn-secondary" zyx-click=${() => this.room.leaveRoom()}>Leave Room</button>
                </div>
            </div>
        `.bind(this);
    }
}

class RoomListComponent {
    constructor() {
        html`
            <div class="room-list-sidebar" zyx-if=${[state.connectedRooms, (rooms) => rooms.length > 0]}>
                <h2>Connected Rooms</h2>
                <div
                    class="room-list-items"
                    zyx-live-list=${{
                        list: state.connectedRooms,
                        compose: RoomSidebarComponent,
                    }}
                ></div>
            </div>
        `.bind(this);
    }
}

class FocusedRoomComponent {
    constructor() {
        html`
            <div class="focused-room">
                <div class="focused-room-header" zyx-if=${state.currentRoom}>
                    <h2>Focused Room</h2>
                </div>
                <div class="focused-room-content" zyx-if=${state.currentRoom}>
                    ${state.currentRoom.contentInterp((room) => (room ? new RoomComponent(room) : null))}
                </div>
                <div class="focused-room-empty" zyx-if-not=${state.currentRoom}>
                    <div class="empty-state">
                        <h2>No Room Focused</h2>
                        <p>Select a room from the sidebar to focus on it, or create/join a new room.</p>
                    </div>
                </div>
            </div>
        `.bind(this);
    }
}

class RoomComponent {
    constructor(room) {
        this.room = room;
        this.expanded = new LiveVar(false);
        html`
            <div
                class="room-component"
                expanded=${this.expanded.interp((expanded) => expanded || null)}
                focused=${state.currentRoom.interp((currentRoom) => currentRoom === room || null)}
                zyx-click=${(e) => {
                    // Don't focus if clicking inside room-actions
                    if (e.target.closest(".room-actions")) return;
                    this.room.focus();
                }}
            >
                <h2>
                    Room: ${this.room.roomCode}
                </h2>
                <div class="room-actions">
                    <button class="btn btn-secondary" zyx-click=${() => this.room.leaveRoom()}>Leave Room</button>
                </div>
            </div>
        `.bind(this);
    }
}

export default class HomepageApp {
    constructor() {
        this.socket = null;
        this.initAuth();
        this.initSocket();

        this.header = new HeaderComponent(this);

        this.roomList = new RoomListComponent();
        this.focusedRoom = new FocusedRoomComponent();

        // Render the component
        html`
            <div class="homepage-container">
                ${this.header}
                <div class="auth-prompt" zyx-if-not=${state.isAuthenticated}>
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
                        <div class="error-message" zyx-if=${state.error}>${state.error.interp((e) => e || "")}</div>
                        <div class="main-layout">
                            <aside class="sidebar">
                                ${this.roomList}
                                <div class="room-actions">
                                    <div class="action-card">
                                        <h2>Create Room</h2>
                                        <p>Create a new room and invite others to join.</p>
                                        <button class="btn btn-primary btn-full" zyx-click=${() => this.createRoom()}>
                                            Create Room
                                        </button>

                                        <div class="join-room-section">
                                            <h3>Join Existing Room</h3>
                                            <div class="join-form">
                                                <input
                                                    type="text"
                                                    this="room_code_input"
                                                    placeholder="Enter room code"
                                                    class="input-field"
                                                    zyx-keypress=${(e) =>
                                                        e.e.key === "Enter" &&
                                                        this.joinRoom(this.room_code_input.value)}
                                                />
                                                <button
                                                    class="btn btn-primary"
                                                    zyx-click=${() => this.joinRoom(this.room_code_input.value)}
                                                >
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                            <div class="main-content">${this.focusedRoom}</div>
                        </div>
                    </main>
                    <main class="homepage-content" this="app_main" zyx-radioview="pages.profile">
                        <div class="profile-content">
                            <h2>Profile</h2>
                            <p>Welcome to your profile.</p>
                        </div>
                    </main>
                    <main class="homepage-content" this="app_main" zyx-radioview="pages.settings">
                        <div class="settings-content">
                            <h2>Settings</h2>
                            <p>Welcome to your settings.</p>
                        </div>
                    </main>
                </div>
                <footer class="homepage-footer">
                    <p>&copy; ${new Date().getFullYear()} BoilerPlate. Open Source.</p>
                </footer>
            </div>
        `.bind(this);
        /** zyXSense @type {HTMLElement} */
        this.app_main;
        /** zyXSense @type {HTMLInputElement} */
        this.room_code_input;
    }

    initAuth() {
        // Check for existing auth token
        const token = localStorage.getItem("auth_token");
        if (token) {
            state.isAuthenticated.set(true);
            // TODO: Decode token to get user info if needed
        }
    }

    updateError(error) {
        if (error !== null) {
            console.error("Error:", error);
        }
        state.error.set(error);
    }

    initSocket() {
        // Only initialize socket if authenticated
        if (!state.isAuthenticated.get()) {
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
            state.connected.set(true);
            this.updateError(null);
        });

        this.socket.on("disconnect", () => {
            state.connected.set(false);
        });

        this.socket.on("connect_error", (err) => {
            state.connected.set(false);
            this.updateError(err?.message || "Failed to connect to server");
        });

        this.socket.on("room.error", (data) => {
            this.updateError(data.error || "An error occurred");
        });

        this.socket.on("user.join.result", (data) => {
            if (data.ok) {
                const newRoom = new RoomModel(this, data.code);
                state.currentRoom.set(newRoom);
                state.connectedRooms.push(newRoom);
                this.updateError(null);
            }
        });
    }

    async createRoom() {
        if (!state.isAuthenticated.get()) return this.updateError("Please sign in first");

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
        if (!state.isAuthenticated.get()) return this.updateError("Please sign in first");

        if (!this.socket || !state.connected.get()) return this.updateError("Not connected to server");

        if (!code || code.trim() === "") {
            return this.updateError("Please enter a room code");
        }

        this.socket.emit("room.join", {
            code: code.trim(),
            clientTimestamp: Date.now(),
        });
    }
}
