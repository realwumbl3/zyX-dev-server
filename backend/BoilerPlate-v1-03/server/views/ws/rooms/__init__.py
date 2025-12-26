from __future__ import annotations

import time

from flask import Blueprint, jsonify, request

from .common import emit_presence
from .... import get_user_id_from_auth_header
from ....extensions import db
from ....lib.utils import now_ms
from ....models import Room, User

rooms_bp = Blueprint("rooms", __name__, url_prefix="/api")


@rooms_bp.route("/room.create", methods=["POST", "OPTIONS"])
def room_create():
    if request.method == "OPTIONS":
        # Handle CORS preflight request
        return "", 200

    user_id = get_user_id_from_auth_header()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "user_not_found"}), 404
    
    # Create room
    room = Room(owner_id=user_id)
    db.session.add(room)
    
    # Update user last seen
    user.last_seen = int(time.time())
    user.active = True
    
    db.session.commit()
    return jsonify({"code": room.code})


@rooms_bp.route("/time", methods=["GET", "OPTIONS"])
def time_now():
    """Minimal time sync endpoint (no auth).

    Returns server time in ms and echoes clientTimestamp (query param) so clients can compute
    RTT/offset NTP-style.
    """
    if request.method == "OPTIONS":
        return "", 200

    client_timestamp = request.args.get("clientTimestamp", default=None, type=int)
    return jsonify({"serverNowMs": now_ms(), "clientTimestamp": client_timestamp})


from .join import register as register_room_join
from .leave import register as register_room_leave

__all__ = [
    "rooms_bp",
    "register_socket_handlers",
    "emit_presence",
]


def register_socket_handlers() -> None:
    register_room_join()
    register_room_leave()

