import { html } from "/shared/dep/zyx-library/index.js";

import { state } from "./app.js";

export default class HeaderComponent {
    constructor(app) {
        this.app = app;
        html`
            <header class="homepage-header">
                <h1>BoilerPlate</h1>
                <div class="header-controls">
                    <div
                        class="connection-status"
                        class:connected=${state.connected.interp((c) => c || null)}
                        class:disconnected=${state.connected.interp((c) => !c || null)}
                    >
                        <span class="status-dot"></span>
                        <span>${state.connected.interp((c) => (c ? "Connected" : "Disconnected"))}</span>
                    </div>

                    <div class="auth-controls" zyx-if-not=${state.isAuthenticated}>
                        <button class="btn btn-google" zyx-click=${() => this.signInWithGoogle()}>
                            <span class="google-icon">G</span>
                            Sign in with Google
                        </button>
                    </div>

                    <div class="auth-controls" zyx-if=${state.isAuthenticated}>
                        <div class="user-info">
                            <span>Welcome!</span>
                            <button class="btn btn-secondary btn-small" zyx-click=${() => this.signOut()}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `.bind(this);
    }

    async signInWithGoogle() {
        try {
            // Open Google OAuth popup
            window.open("/auth/google/start", "google-oauth", "width=500,height=600,scrollbars=yes,resizable=yes");
            // Listen for auth message from popup
            const handleAuthMessage = (event) => {
                if (event.data.type === "newapp_auth" && event.data.token) {
                    // Store token
                    localStorage.setItem("auth_token", event.data.token);
                    state.isAuthenticated.set(true);
                    // Clear error and reinitialize socket
                    state.error.set(null);
                    this.app.initSocket();
                    // Remove event listener
                    window.removeEventListener("message", handleAuthMessage);
                }
            };
            window.addEventListener("message", handleAuthMessage);
        } catch (error) {
            this.app.updateError("Failed to open sign-in popup");
        }
    }

    signOut() {
        // Clear token
        localStorage.removeItem("auth_token");
        state.isAuthenticated.set(false);

        // Disconnect socket
        this.app.socket?.disconnect();

        // Reset connection status
        state.connected.set(false);
        state.currentRoom.set(null);
        state.error.set(null);
    }
}
