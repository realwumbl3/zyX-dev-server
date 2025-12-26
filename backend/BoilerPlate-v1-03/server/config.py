# Import the standard library module used for environment variables and filesystem paths
import os
import logging
from flask import Flask
# Import timedelta to compute durations in seconds for token expiry
from datetime import timedelta

# Define a configuration holder class for the Flask application
class Config:
    # Secret key used by Flask and extensions (sessions, CSRF, etc.); falls back to a dev value
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")

    VERSION = os.getenv("VERSION", "v1-00")
    APP_NAME = os.getenv("APP_NAME", "BoilerPlate")

    # JWT signing secret; defaults to SECRET_KEY if not explicitly provided
    JWT_SECRET = os.getenv("JWT_SECRET", SECRET_KEY)
    # Prefer absolute DB path under instance/ directory at repo root for SQLite
    _ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, os.pardir, os.pardir))
    # Default SQLAlchemy URI pointing to a sqlite database stored in instance/VERSION/APP_NAME.db
    _DB_DEFAULT = (
        f"sqlite:///{os.path.join(_ROOT, 'instance', VERSION, f'{APP_NAME}.db')}"
    )

    # Database URL taken from env when present, otherwise fallback to default
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", _DB_DEFAULT)
    # When true, echo SQL statements to logs for debugging
    SQLALCHEMY_ECHO = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"
    # Public base URL where this backend is reachable (used for OAuth redirects)
    BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:5000")

    # Google OAuth client identifier (optional; required for Google login)
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    # Google OAuth client secret (optional; required for Google login)
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

    # Access token expiry in seconds; defaults to 14 days if not overridden
    ACCESS_TOKEN_EXPIRES = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRES_SECONDS", str(int(timedelta(days=14).total_seconds()))
        )
    )

    # Comma-separated list of CORS origins; '*' means allow all
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")


    # Socket.IO message queue DSN (e.g., Redis) for multi-process broadcast support (optional)
    SOCKETIO_MESSAGE_QUEUE = os.getenv("SOCKETIO_MESSAGE_QUEUE", "")
    # Socket.IO async mode override (e.g., 'gevent', 'eventlet'); empty means default
    SOCKETIO_ASYNC_MODE = os.getenv("SOCKETIO_ASYNC_MODE", "")

    # Development toggles controlling Flask/Jinja template auto-reload and debug behavior
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    TEMPLATES_AUTO_RELOAD = os.getenv("TEMPLATES_AUTO_RELOAD", "true").lower() == "true"

    # Global logging level
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

    # Pong timeout in seconds for user health checks (users inactive longer than this will be considered disconnected)
    PONG_TIMEOUT_SECONDS = int(os.getenv("PONG_TIMEOUT_SECONDS", "20"))


def START_DEBUG_CONFIG_DUMP(logger: logging.Logger, app: Flask):
    # Log all environment variables and configuration for debugging
    logger.info("=== ENVIRONMENT VARIABLES ===")
    for key, value in sorted(os.environ.items()):
        # Mask sensitive values
        if any(sensitive in key.upper() for sensitive in ['SECRET', 'KEY', 'TOKEN', 'PASSWORD', 'CREDENTIAL']):
            logger.info(f"{key}=***MASKED***")
        else:
            logger.info(f"{key}={value}")

    logger.info("=== FLASK APP CONFIGURATION ===")
    for key, value in sorted(app.config.items()):
        # Mask sensitive values
        if any(sensitive in key.upper() for sensitive in ['SECRET', 'KEY', 'TOKEN', 'PASSWORD', 'CREDENTIAL']):
            logger.info(f"{key}=***MASKED***")
        else:
            logger.info(f"{key}={value}")
