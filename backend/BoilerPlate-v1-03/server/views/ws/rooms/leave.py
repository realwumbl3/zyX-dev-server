from __future__ import annotations

import logging
import time

from flask import request
from flask_socketio import leave_room

from ....extensions import db, socketio
from ....models import Room, User
from ....helpers.ws import get_user_id_from_socket
from .common import emit_presence


def register() -> None:
    @socketio.on("room.leave")
    def _on_leave_room(data: dict):
        try:
            user_id = get_user_id_from_socket()
            if not user_id:
                return

            code = (data or {}).get("code")
            if not code:
                return

            room = Room.query.filter_by(code=code).first()
            if not room:
                return

            # Update user last seen
            user = db.session.get(User, user_id)
            if user:
                user.last_seen = int(time.time())
                db.session.commit()

            # Leave the Socket.IO room
            leave_room(f"room:{room.code}")
            
            # Emit presence update
            emit_presence(room.id)
        except Exception:
            logging.exception("room.leave handler error")

