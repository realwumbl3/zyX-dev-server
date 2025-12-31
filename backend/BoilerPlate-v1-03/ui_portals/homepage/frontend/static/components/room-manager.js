import { html, LiveVar, LiveList } from "/shared/dep/zyx-library/index.js";

class RoomStateManager {
    constructor() {
        this.connectedRooms = new LiveList([]);
        this.currentRoom = new LiveVar(null);
        this.deleteMode = new LiveVar(false);
    }
}

export const roomStateManager = new RoomStateManager();

class RoomModel {
    constructor(app, roomCode) {
        this.app = app;
        this.roomCode = new LiveVar(roomCode);
        this.focused = new LiveVar(false);
        this.seconds = new LiveVar(0);
        this.interval = setInterval(() => this.seconds.set(this.seconds.get() + 1), 1000);
        this.users = new LiveList([]);
        this.messages = new LiveList([]);
    }

    focus() {
        const currentRoom = roomStateManager.currentRoom.get();
        if (currentRoom) currentRoom.unfocus();
        roomStateManager.currentRoom.set(this);
        this.focused.set(true);
    }

    unfocus() {
        if (roomStateManager.currentRoom.get() === this) roomStateManager.currentRoom.set(null);
        this.focused.set(false);
    }

    leaveRoom() {
        this.app.socket.emit("room.leave", {
            code: this.roomCode.get(),
        });
        roomStateManager.connectedRooms.remove(this);
        if (this.focused.get()) {
            const firstRoom = roomStateManager.connectedRooms.at(0);
            if (firstRoom) firstRoom.focus();
            else roomStateManager.currentRoom.set(null);
        }

        clearInterval(this.interval);
    }
}

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

export { RoomModel, RoomListComponent, RoomViewComponent, RoomInterfaceComponent };
