import { html } from "/shared/dep/zyx-library/index.js";

class RoomIconComponent {
    constructor(room) {
        this.room = room;
        html`
            <div
                class="room-entry"
                focused=${this.room.focused.interp((focused) => focused || null)}
                zyx-click=${() => this.room.focus()}
            >
                <div class="room-circle">
                    ${this.room.roomCode.interp((code) => (code ? code.substring(0, 4).toUpperCase() : ""))}
                </div>
                <button
                    class="delete-room-btn"
                    zyx-click=${(ze) => {
                        ze.e.stopPropagation(); // event is ze.e DO NOT CHANGE THIS
                        this.room.leaveRoom();
                    }}
                >
                    <span class="delete-icon">×</span>
                </button>
            </div>
        `.bind(this);
    }
}

export default RoomIconComponent;