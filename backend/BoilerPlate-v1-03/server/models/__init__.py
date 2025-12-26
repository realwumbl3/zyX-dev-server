# Enable postponed annotations to avoid runtime import issues and allow future-style typing
from __future__ import annotations

# Import all models for backward compatibility from reorganized subdirectories
from .auth.user import User
from .room.room import Room

__all__ = [
    "User",
    "Room",
]

