# Enable postponed annotations to avoid runtime import issues and allow future-style typing
from __future__ import annotations

# Import time to record timestamps for model defaults
import time
import secrets
# Provide Optional typing for clarity in relationships or lookups
from typing import Optional, TYPE_CHECKING

# SQLAlchemy typing helper for mapped attributes / relationships
from sqlalchemy.orm import Mapped

# Import the SQLAlchemy instance from the shared extensions module
from ...extensions import db

if TYPE_CHECKING:
    # Imported only for static type checking to avoid circular imports at runtime
    from ...models.auth.user import User


# A room represents a basic collaborative session identified by a short code
class Room(db.Model):
    # Surrogate primary key id
    id: Mapped[int] = db.Column(db.Integer, primary_key=True)
    # Unique room code string used by clients to join; indexed for queries
    code: Mapped[str] = db.Column(
        db.String(64), unique=True, index=True, default=lambda: secrets.token_hex(7)
    )
    # Owner (room author) user id
    owner_id: Mapped[Optional[int]] = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=True
    )
    # Epoch seconds when the room was created
    created_at: Mapped[int] = db.Column(db.Integer, default=lambda: int(time.time()))
    # Whether room is private (UI-level hint; not enforced here)
    is_private: Mapped[bool] = db.Column(db.Boolean, default=True)

    # ORM relationship to owner user
    owner: Mapped[Optional["User"]] = db.relationship("User", foreign_keys=[owner_id], lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "owner_id": self.owner_id,
            "created_at": self.created_at,
            "is_private": self.is_private,
        }

