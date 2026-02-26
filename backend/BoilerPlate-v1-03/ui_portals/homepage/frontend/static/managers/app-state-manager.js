import { LiveVar } from "/shared/dep/zyx-library/index.js";

class AppStateManager {
    constructor() {
        this.error = new LiveVar(null);
        this.isAuthenticated = new LiveVar(false);
        this.connected = new LiveVar(false);
    }
}

export const appState = new AppStateManager();

export const AppStateManagerNamespace = {
    AppStateManager,
    appState,
};