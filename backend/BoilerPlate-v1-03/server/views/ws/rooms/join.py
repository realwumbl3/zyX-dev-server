from __future__ import annotations

import logging
import time

from flask import request
from flask_socketio import join_room

from ....extensions import db, socketio
from ....models import Room, User
from ....helpers.ws import get_user_id_from_socket
from ....lib.utils import now_ms

from .common import emit_presence


def register() -> None:
    @socketio.on("connect")
    def _on_connect():
        try:
            user_id = get_user_id_from_socket()
            if not user_id:
                logging.warning("connect: no valid token provided")
                return False  # Reject connection

            # Track the socket connection for this user
            from ....helpers.redis import track_socket_connection
            track_socket_connection(user_id, request.sid)
            logging.info(f"connect: user {user_id} connected with socket {request.sid}")
            return True
        except Exception:
            logging.exception("connect: failed to authenticate user")
            return False  # Reject connection

    @socketio.on("disconnect")
    def _on_disconnect():
        try:
            user_id = get_user_id_from_socket()
            if user_id:
                # Remove the socket connection tracking
                from ....helpers.redis import remove_socket_connection
                remove_socket_connection(user_id, request.sid)
                logging.info(f"disconnect: user {user_id} disconnected socket {request.sid}")
        except Exception:
            logging.exception("disconnect: failed to clean up connection")

    @socketio.on("room.join")
    def _on_join_room(data: dict):
        try:
            client_timestamp = (data or {}).get("clientTimestamp")

            user_id = get_user_id_from_socket()
            if not user_id:
                socketio.emit("room.error", {"error": "Authentication required"}, to=request.sid)
                return

            code = (data or {}).get("code")
            if not code:
                socketio.emit("room.error", {"error": "Room code required"}, to=request.sid)
                return

            room = Room.query.filter_by(code=code).first()
            if not room:
                socketio.emit("room.error", {"error": "Room not found"}, to=request.sid)
                return

            # Update user last seen
            user = db.session.get(User, user_id)
            if user:
                user.last_seen = int(time.time())
                user.active = True
                db.session.commit()

            # Join the Socket.IO room
            join_room(f"room:{room.code}")
            
            # Emit presence update
            emit_presence(room.id)
            
            # Return room data to the client
            socketio.emit(
                "user.join.result",
                {
                    "ok": True,
                    "code": room.code,
                    "snapshot": room.to_dict(),
                    "serverNowMs": now_ms(),
                    "clientTimestamp": client_timestamp,
                },
                to=request.sid,
            )
        except Exception:
            logging.exception("room.join handler error")
            socketio.emit("room.error", {"error": "Failed to join room"}, to=request.sid)

