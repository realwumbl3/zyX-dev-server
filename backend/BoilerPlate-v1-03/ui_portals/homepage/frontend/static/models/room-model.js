import { LiveVar, LiveList } from "/shared/dep/zyx-library/index.js";
import { roomStateManager } from "../managers/room-state-manager.js";

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

    sendMessage(message) {
        if (!message || message.trim() === "") return;

        this.app.socket.emit("room.message", {
            code: this.roomCode.get(),
            message: message.trim(),
            clientTimestamp: Date.now(),
        });

        // Clear the input (this would be handled by the form reset in the component)
    }
}

export default RoomModel;