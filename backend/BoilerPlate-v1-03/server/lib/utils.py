"""Utility functions for the BoilerPlate server."""

import time
import logging
from typing import Optional

try:
    import redis
except ImportError:
    redis = None


def now_ms() -> int:
    """Return the current time in milliseconds since epoch."""
    return int(time.time() * 1000)


def get_redis_client():
    """Get a Redis client instance."""
    if redis is None:
        return None

    try:
        # Connect to Redis (adjust host/port as needed)
        client = redis.Redis(host='127.0.0.1', port=6379, db=0, decode_responses=True)
        # Test the connection
        client.ping()
        return client
    except Exception as e:
        logging.warning(f"Failed to connect to Redis: {e}")
        return None
