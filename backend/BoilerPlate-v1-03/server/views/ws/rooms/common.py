from __future__ import annotations

from ....extensions import db, socketio
from ....models import Room


def emit_presence(room_id: int) -> None:
    """Emit a basic presence update for the room."""
    room = db.session.get(Room, room_id)
    if not room:
        return

    # Simplified presence - just emit room data
    payload = {
        "room": room.to_dict(),
    }
    socketio.emit("presence.update", payload, room=f"room:{room.code}")



