import { html } from "/shared/dep/zyx-library/index.js";
import { roomStateManager } from "../managers/room-state-manager.js";
import RoomIconComponent from "./room-icon.js";

class RoomListComponent {
    constructor(app) {
        this.app = app;
        html`
            <div
                class="unified-room-list"
                delete-mode=${roomStateManager.deleteMode.interp((deleteMode) => deleteMode || null)}
            >
                <div class="room-entry create-room-entry" zyx-click=${() => this.app.createRoom()}>
                    <div class="room-circle create-room-circle">
                        <span class="circle-icon">+</span>
                    </div>
                </div>
                <div
                    class="room-list-items"
                    zyx-live-list=${{
                        list: roomStateManager.connectedRooms,
                        compose: RoomIconComponent,
                    }}
                ></div>
                <div
                    class="room-entry delete-mode-entry"
                    zyx-click=${() => roomStateManager.deleteMode.set(!roomStateManager.deleteMode.get())}
                >
                    <div class="room-circle delete-mode-circle">
                        <span class="circle-icon delete-icon">🗑️</span>
                    </div>
                </div>
            </div>
        `.bind(this);
    }
}

export default RoomListComponent;