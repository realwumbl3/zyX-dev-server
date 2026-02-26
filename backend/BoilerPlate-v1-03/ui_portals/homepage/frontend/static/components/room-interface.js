import { html } from "/shared/dep/zyx-library/index.js";

class RoomInterfaceComponent {
    constructor(room) {
        this.room = room;

        html`
            <div class="room-component" focused=${this.room.focused.interp((focused) => focused || null)}>
                <div class="room-header">
                    <div class="room-info">
                        <h2>Room: ${this.room.roomCode}</h2>
                        <div class="room-status">
                            <span class="status-indicator online"></span>
                            <span class="status-text">Connected</span>
                        </div>
                    </div>
                    <button class="room-leave-btn btn btn-secondary" zyx-click=${() => this.room.leaveRoom()}>
                        <span class="leave-icon">×</span>
                        Leave Room
                    </button>
                </div>

                <div class="room-layout">
                    <div class="room-content-area">
                        <main class="room-main-content">
                            <div class="chat-header">
                                <h3>General Chat</h3>
                                <div class="channel-info">
                                    <span class="member-count">0 members</span>
                                </div>
                            </div>
                            <div class="chat-messages" this="messages_container">
                                <p>placeholder</p>
                            </div>
                            <div class="chat-input-container">
                                <form
                                    class="chat-input-form"
                                    zyx-submit=${(ze) => {
                                        ze.e.preventDefault();
                                        this.room.sendMessage(ze.e.target.value);
                                    }}
                                >
                                    <input type="text" class="chat-input" placeholder="Type a message..." />
                                    <button type="submit" class="send-btn">Send</button>
                                </form>
                            </div>
                        </main>
                        <aside class="room-sidebar users-sidebar">
                            <div class="sidebar-header">
                                <h3>Online — 0</h3>
                            </div>
                            <div class="users-list">
                                <p>placeholder</p>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        `.bind(this);

        /** zyXSense @type {HTMLElement} */
        this.messages_container;
    }
}

export default RoomInterfaceComponent;