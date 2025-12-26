from __future__ import annotations

from typing import Callable, Optional, Any
from functools import wraps

from flask import request
from flask_socketio import rooms

from ..extensions import db    
from ..models import Room, User
from ..helpers.ws import get_user_id_from_socket
import logging


def require_room_by_code(handler: Callable) -> Callable:
    """
    Decorator for socket handlers that require a room identified by code from data.

    Extracts code from data, validates it, queries the room, and passes
    (room, user_id, data) to the handler. Returns early if code is missing or room not found.

    Usage:
        @socketio.on("room.control.pause")
        @require_room_by_code
        def _on_room_control_pause(room, user_id, data):
            # room and user_id are guaranteed to be valid here
            ...
    """
    @wraps(handler)
    def wrapper(data: Optional[dict]) -> None:
        user_id = get_user_id_from_socket()
        code = (data or {}).get("code")
        # Try to capture the socket event name if we are in a Socket.IO request context
        event_name = None
        try:
            if getattr(request, "event", None):
                event_name = request.event.get("message")
        except Exception:
            event_name = None

        if not code:
            logging.warning(
                "require_room_by_code: no code in data "
                "(handler=%s, event=%s, user_id=%s, data_keys=%s)",
                handler.__name__,
                event_name,
                user_id,
                list[Any]((data or {}).keys()),
            )
            return None, "require_room_by_code: no code"
        room = Room.query.filter_by(code=code).first()
        if not room:
            logging.warning(
                "require_room_by_code: no room found for code=%s "
                "(handler=%s, event=%s, user_id=%s, data_keys=%s)",
                code,
                handler.__name__,
                event_name,
                user_id,
                list[Any]((data or {}).keys()),
            )
            return None, "require_room_by_code: no room found"
        return handler(room, user_id, data)
    return wrapper



