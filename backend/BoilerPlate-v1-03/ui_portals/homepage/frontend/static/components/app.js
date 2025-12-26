import { html, LiveVar } from "/shared/dep/zyx-library/index.js";
import io from "/shared/dep/socket.io.min.esm.js";

export default class HomepageApp {
    constructor() {
        // State using LiveVar for reactivity
        this.connected = new LiveVar(false);
        this.currentRoom = new LiveVar(null);
        this.error = new LiveVar(null);
        this.roomCodeInput = new LiveVar("");

        // Authentication state
        this.isAuthenticated = new LiveVar(false);

        this.socket = null;
        this.initAuth();
        this.initSocket();

        // Render the component
        html`
            <div class="homepage-container">
                <header class="homepage-header">
                    <h1>BoilerPlate</h1>
                    <div class="header-controls">
                        <div
                            class="connection-status"
                            class:connected=${this.connected.interp((c) => c || null)}
                            class:disconnected=${this.connected.interp((c) => !c || null)}
                        >
                            <span class="status-dot"></span>
                            <span>${this.connected.interp((c) => (c ? "Connected" : "Disconnected"))}</span>
                        </div>

                        <div class="auth-controls" zyx-if=${[this.isAuthenticated, (auth) => !auth]}>
                            <button class="btn btn-google" zyx-click=${() => this.signInWithGoogle()}>
                                <span class="google-icon">G</span>
                                Sign in with Google
                            </button>
                        </div>

                        <div class="auth-controls" zyx-if=${[this.isAuthenticated, (auth) => auth]}>
                            <div class="user-info">
                                <span>Welcome!</span>
                                <button class="btn btn-secondary btn-small" zyx-click=${() => this.signOut()}>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main class="homepage-content">
                    <div class="error-message" zyx-if=${[this.error, (e) => !!e]}>
                        ${this.error.interp((e) => e || "")}
                    </div>

                    <div
                        class="three-condition-test"
                        zyx-if=${[
                            this.isAuthenticated,
                            this.currentRoom,
                            this.connected,
                            (auth, room, connected) => !!auth && !!room && !!connected,
                        ]}
                    >
                        <h2>Three condition test</h2>
                        <p>You are authenticated, in a room, and connected to the server.</p>
                    </div>

                    <div class="auth-prompt" zyx-if=${[this.isAuthenticated, (auth) => !auth]}>
                        <div class="action-card">
                            <h2>Welcome to BoilerPlate</h2>
                            <p>Please sign in with Google to create or join rooms.</p>
                        </div>
                    </div>

                    <div class="room-active" zyx-if=${[this.currentRoom, (r) => !!r]}>
                        <h2>Room: ${this.currentRoom.interp((r) => r)}</h2>
                        <p>You are currently in a room.</p>
                        <button class="btn btn-secondary" zyx-click=${() => this.leaveRoom()}>Leave Room</button>
                    </div>

                    <div
                        class="room-actions"
                        zyx-if=${[this.currentRoom, this.isAuthenticated, (r, auth) => !r && !!auth]}
                    >
                        <div class="action-card">
                            <h2>Create Room</h2>
                            <p>Create a new room and invite others to join.</p>
                            <button class="btn btn-primary" zyx-click=${() => this.createRoom()}>Create Room</button>
                        </div>

                        <div class="action-card">
                            <h2>Join Room</h2>
                            <p>Enter a room code to join an existing room.</p>
                            <div class="join-form">
                                <input
                                    type="text"
                                    this="room_code_input"
                                    placeholder="Enter room code"
                                    class="input-field"
                                    zyx-keypress=${(e) => {
                                        if (e.e.key === "Enter") {
                                            this.joinRoom(this.room_code_input.value);
                                        }
                                    }}
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
                </main>

                <footer class="homepage-footer">
                    <p>&copy; ${new Date().getFullYear()} BoilerPlate. Open Source.</p>
                </footer>
            </div>
        `.bind(this);
    }

    initAuth() {
        // Check for existing auth token
        const token = localStorage.getItem("auth_token");
        if (token) {
            this.isAuthenticated.set(true);
            // TODO: Decode token to get user info if needed
        }
    }

    async signInWithGoogle() {
        try {
            // Open Google OAuth popup
            window.open("/auth/google/start", "google-oauth", "width=500,height=600,scrollbars=yes,resizable=yes");

            // Listen for auth message from popup
            const handleAuthMessage = (event) => {
                console.log("Auth message received:", event.data);
                if (event.data.type === "newapp_auth" && event.data.token) {
                    // Store token
                    localStorage.setItem("auth_token", event.data.token);
                    this.isAuthenticated.set(true);
                    // Clear error and reinitialize socket
                    this.error.set(null);
                    this.initSocket();

                    // Remove event listener
                    window.removeEventListener("message", handleAuthMessage);
                }
            };

            window.addEventListener("message", handleAuthMessage);
        } catch (error) {
            this.updateError("Failed to open sign-in popup");
        }
    }

    signOut() {
        // Clear token
        localStorage.removeItem("auth_token");
        this.isAuthenticated.set(false);

        // Disconnect socket
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        // Reset connection status
        this.connected.set(false);
        this.currentRoom.set(null);
        this.error.set(null);
    }

    updateError(error) {
        if (error !== null) {
            console.error("Error:", error);
        }
        this.error.set(error);
    }

    initSocket() {
        // Only initialize socket if authenticated
        if (!this.isAuthenticated.get()) {
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
            this.connected.set(true);
            this.updateError(null);
        });

        this.socket.on("disconnect", () => {
            this.connected.set(false);
        });

        this.socket.on("connect_error", (err) => {
            this.connected.set(false);
            this.updateError(err?.message || "Failed to connect to server");
        });

        this.socket.on("room.error", (data) => {
            this.updateError(data.error || "An error occurred");
        });

        this.socket.on("user.join.result", (data) => {
            if (data.ok) {
                this.currentRoom.set(data.code);
                this.updateError(null);
            }
        });
    }

    async createRoom() {
        if (!this.isAuthenticated.get()) {
            this.updateError("Please sign in first");
            return;
        }

        const token = localStorage.getItem("auth_token");
        if (!token) {
            this.updateError("Authentication token missing");
            return;
        }

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
                throw new Error(error.error || "Failed to create room");
            }

            const data = await response.json();
            if (data.code) {
                // Auto-join the created room
                this.joinRoom(data.code);
            }
        } catch (error) {
            this.updateError(error.message);
        }
    }

    joinRoom(code) {
        if (!this.isAuthenticated.get()) {
            this.updateError("Please sign in first");
            return;
        }

        if (!this.socket || !this.connected.get()) {
            this.updateError("Not connected to server");
            return;
        }

        if (!code || code.trim() === "") {
            this.updateError("Please enter a room code");
            return;
        }

        this.socket.emit("room.join", {
            code: code.trim(),
            clientTimestamp: Date.now(),
        });
    }

    leaveRoom() {
        if (!this.socket || !this.currentRoom.get()) {
            return;
        }

        this.socket.emit("room.leave", {
            code: this.currentRoom.get(),
        });

        this.currentRoom.set(null);
    }
}
