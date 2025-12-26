# BoilerPlate v1-00

**BoilerPlate** is a minimal Flask + Socket.IO boilerplate application for building real-time collaborative applications. It provides basic room creation, user authentication via Google OAuth, and WebSocket communication.

## Architecture Overview

BoilerPlate consists of two main components:

### 1. Python Flask Backend
A real-time web server using Flask + Socket.IO for WebSocket communication, handling room coordination and user management.

### 2. Web UI Portal
A public homepage interface for room creation and joining.

## Key Features

- **Room Management**: Create and join rooms with unique codes
- **User Authentication**: Google OAuth integration with JWT tokens
- **Real-time Communication**: WebSocket support via Socket.IO
- **Simple API**: RESTful endpoints for room creation and stats

## Technology Stack

### Backend
- **Python 3.8+** with **Flask** web framework
- **Flask-SocketIO** for real-time WebSocket communication
- **SQLAlchemy** ORM with SQLite database
- **Gunicorn** WSGI server with gevent workers
- **JWT** authentication with Google OAuth support

### Frontend
- **Vanilla JavaScript** with **zyX** reactive framework
- **Socket.IO** client for real-time communication
- **CSS3** with custom styling

## Project Structure

```
BoilerPlate-v1-00/
├── server/                      # Python Flask backend
│   ├── models/                  # Database models
│   │   ├── auth/               # User authentication models
│   │   └── room/              # Room models
│   ├── views/                   # API endpoints and WebSocket handlers
│   │   ├── api/                # REST API endpoints
│   │   └── ws/                 # WebSocket message handlers
│   ├── lib/                    # Utility libraries
│   └── config.py               # Application configuration
├── ui_portals/                 # Web UI applications
│   └── homepage/               # Public landing page
├── shared/                     # Shared frontend assets
│   ├── dep/                    # Dependencies (zyX, Socket.IO)
│   └── components/             # Shared components
└── requirements.txt            # Python dependencies
```

## Database Models

### Core Entities
- **User**: User accounts with Google OAuth integration
- **Room**: Basic room entities with unique codes and ownership

## Configuration

BoilerPlate supports configuration via environment variables:

### Core Settings
- `SECRET_KEY`: Flask application secret key
- `VERSION`: Application version identifier (default: "v1-00")
- `APP_NAME`: Application name (default: "BoilerPlate")

### Database
- `DATABASE_URL`: SQLAlchemy database URL (defaults to SQLite)
- `SQLALCHEMY_ECHO`: Enable SQL debugging (default: false)

### Authentication
- `JWT_SECRET`: JWT signing secret
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `ACCESS_TOKEN_EXPIRES_SECONDS`: JWT token expiry (default: 14 days)

### Networking
- `BACKEND_BASE_URL`: Public backend URL for OAuth redirects (default: "http://localhost:5000")
- `CORS_ORIGINS`: Allowed CORS origins (default: "*")
- `SOCKETIO_MESSAGE_QUEUE`: Optional Redis URL for multi-process message queue
- `SOCKETIO_ASYNC_MODE`: Socket.IO async mode (default: gevent)

### Development
- `DEBUG`: Enable Flask debug mode
- `TEMPLATES_AUTO_RELOAD`: Enable template auto-reload
- `LOG_LEVEL`: Logging level (default: INFO)

## Setup and Development

### Prerequisites
- Python 3.8+
- Google OAuth credentials (for authentication)

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd /home/wumbl3wsl/zyX-dev-server/Server/backend/BoilerPlate-v1-00
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file with required configuration:
   ```bash
   SECRET_KEY=your-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   BACKEND_BASE_URL=http://localhost:5000
   ```

### Running Locally

For development with auto-reload:

```bash
export DEBUG=true
export TEMPLATES_AUTO_RELOAD=true
export LOG_LEVEL=DEBUG
flask run
```

Or with Gunicorn:

```bash
gunicorn -k gevent -w 4 --bind 0.0.0.0:5000 "server:app"
```

## API Reference

### REST Endpoints

#### Authentication
- `GET /auth/google/start` - Start Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler

#### Room Management
- `POST /api/room.create` - Create a new room (requires authentication)
- `GET /api/time` - Server time sync endpoint

#### Statistics
- `GET /api/stats` - Public statistics (room counts)
- `GET /api/health` - Health check endpoint

### WebSocket Events

#### Room Management
- `room.join` - Join a room by code
  - Payload: `{ code: string, clientTimestamp?: number }`
  - Response: `user.join.result` with room data
- `room.leave` - Leave the current room
  - Payload: `{ code: string }`

#### Presence
- `presence.update` - Broadcast when users join/leave rooms

## UI Portal

### Homepage (`/`)
Public landing page featuring:
- Room creation interface
- Room joining interface
- Connection status display
- Public statistics

## Deployment

### Production Setup

1. **Set environment variables** for production:
   ```bash
   export SECRET_KEY=your-production-secret-key
   export GOOGLE_CLIENT_ID=your-production-client-id
   export GOOGLE_CLIENT_SECRET=your-production-client-secret
   export BACKEND_BASE_URL=https://your-domain.com
   ```

2. **Run with Gunicorn**:
   ```bash
   gunicorn -k gevent -w 4 --bind 0.0.0.0:5000 "server:app"
   ```

3. **Configure reverse proxy** (Nginx recommended) for production

### Scaling Considerations

- **Horizontal Scaling**: Use Redis message queue (`SOCKETIO_MESSAGE_QUEUE`) for multi-server deployments
- **Database**: Consider PostgreSQL for production workloads
- **Load Balancing**: Nginx handles load balancing across Gunicorn workers

## Contributing

### Development Workflow

1. **Code Style**: Follow existing patterns and use type hints
2. **Database**: Changes require migration scripts in `server/migrations.py`
3. **Documentation**: Update this README for significant changes

### Backend Development

- Use SQLAlchemy ORM for database operations
- Implement WebSocket handlers in `server/views/ws/`
- Add REST endpoints in `server/views/api/`
- Update models in `server/models/` with proper relationships

## Troubleshooting

### Common Issues

**WebSocket connection fails**: Check CORS settings and Socket.IO configuration

**Database errors**: Verify SQLite file permissions and WAL mode configuration

**OAuth not working**: Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly

### Logs

Application logs are written to stdout/stderr. Use your process manager (systemd, supervisor, etc.) to capture logs.

## License

[Specify license here]

## Support

For support and questions:
- Check the logs for error messages
- Review configuration settings
- Test WebSocket connection status in browser developer tools

---

**BoilerPlate v1-00** - A minimal real-time collaboration boilerplate.
