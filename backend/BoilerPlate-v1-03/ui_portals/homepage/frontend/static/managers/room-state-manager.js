import { LiveList, LiveVar } from "/shared/dep/zyx-library/index.js";

class RoomStateManager {
    constructor() {
        this.connectedRooms = new LiveList([]);
        this.currentRoom = new LiveVar(null);
        this.deleteMode = new LiveVar(false);
    }
}

export const roomStateManager = new RoomStateManager();

export const RoomStateManagerNamespace = {
    RoomStateManager,
    roomStateManager,
};