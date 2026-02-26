import { html } from "/shared/dep/zyx-library/index.js";
import { roomStateManager } from "../managers/room-state-manager.js";
import RoomInterfaceComponent from "./room-interface.js";

class RoomViewComponent {
    constructor() {
        html`
            <div class="focused-room">
                <div class="focused-room-content" zyx-if=${roomStateManager.currentRoom}>
                    ${roomStateManager.currentRoom.contentInterp((room) =>
                        room ? new RoomInterfaceComponent(room) : null
                    )}
                </div>
                <div class="focused-room-empty" zyx-if-not=${roomStateManager.currentRoom}>
                    <div class="empty-state">
                        <h2>No Room Focused</h2>
                        <p>
                            Select a room from the sidebar to focus on it<br />
                            or create a new room.
                        </p>
                    </div>
                </div>
            </div>
        `.bind(this);
    }
}

export default RoomViewComponent;