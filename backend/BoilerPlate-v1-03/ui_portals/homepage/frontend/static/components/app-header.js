import { html } from "/shared/dep/zyx-library/index.js";

import { appState } from "./main-app.js";

export default class AppHeaderComponent {
    constructor(app) {
        this.app = app;
        html`
            <header class="homepage-header">
                <h1>BoilerPlate</h1>
                <div class="header-controls">
                    <div
                        class="connection-status"
                        class:connected=${appState.connected.interp((c) => c || null)}
                        class:disconnected=${appState.connected.interp((c) => !c || null)}
                    >
                        <span class="status-dot"></span>
                        <span>${appState.connected.interp((c) => (c ? "Connected" : "Disconnected"))}</span>
                    </div>

                    <div class="auth-controls" zyx-if-not=${appState.isAuthenticated}>
                        <button class="btn btn-google" zyx-click=${() => this.signInWithGoogle()}>
                            <span class="google-icon">G</span>
                            Sign in with Google
                        </button>
                    </div>

                    <div class="auth-controls" zyx-if=${appState.isAuthenticated}>
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
                    appState.isAuthenticated.set(true);
                    // Clear error and reinitialize socket
                    appState.error.set(null);
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
        appState.isAuthenticated.set(false);

        // Disconnect socket
        this.app.socket?.disconnect();

        // Reset connection status
        appState.connected.set(false);
        // TODO: Reset current room via room state manager
        appState.error.set(null);
    }
}

export const AppHeaderNamespace = {
    AppHeaderComponent,
};
