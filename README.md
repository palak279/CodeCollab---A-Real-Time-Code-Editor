# CodeCollab

A real-time collaborative code editor that lets multiple people write and edit code together in the same room, with live cursor tracking and presence indicators — similar in spirit to VS Code Live Share.

## Features

- **Real-time collaborative editing** — every keystroke syncs instantly across all connected users via WebSockets
- **Live cursor tracking** — see exactly where other users are typing, with colored markers and username labels
- **Presence indicators** — a live list of who's currently online in your room
- **Persistent rooms** — code is saved to a database, so it survives page refreshes and reconnects
- **Room-based sessions** — join any room by sharing a simple room code

## Tech Stack

**Frontend**
- React (via Vite)
- Monaco Editor (the same code editor engine that powers VS Code)
- STOMP over SockJS for WebSocket communication

**Backend**
- Java + Spring Boot
- Spring WebSocket (STOMP messaging) for real-time communication
- Spring Data JPA + PostgreSQL for persistence
- Docker (for running PostgreSQL locally)

## Architecture

Browser (React + Monaco)
│
│ WebSocket (STOMP over SockJS)
▼
Spring Boot Backend
│
├── REST API ──────► PostgreSQL (room content persistence)
│
└── WebSocket broadcast ──► All connected clients in the room


Each browser tab connects to the backend over a persistent WebSocket connection. When a user types, edits are broadcast instantly to everyone else in the same room via a publish-subscribe pattern (STOMP topics), while also being saved to PostgreSQL in the background for persistence.

## How It Works

1. A user enters a room code and joins.
2. The frontend fetches any existing saved content for that room from the backend via REST.
3. A WebSocket connection is established, and the client subscribes to three channels for that room: content edits, cursor positions, and presence.
4. As the user types, their changes are broadcast to everyone else in the room in real time, and separately persisted to the database.
5. Cursor movements are tracked and broadcast the same way, letting every user see where everyone else is working.
6. When a user joins or disconnects, the backend automatically updates and broadcasts the list of online users.

## Running Locally

### Backend

1. Make sure Docker is running, then start PostgreSQL:

docker start codecollab-postgres

2. From the `collab-backend` folder:

./mvnw spring-boot:run

   The backend runs on `http://localhost:8080`.

### Frontend

1. From the `collab-frontend` folder:

npm install
npm run dev

2. Open `http://localhost:5173` in your browser.

## Future Improvements

- Redis for faster in-memory state management at scale
- Syntax highlighting for additional languages via a language selector
- Authentication and private rooms
- Edit history / version timeline

## Author

Built by Palak Gupta as a portfolio project to demonstrate real-time systems, WebSocket architecture, and full-stack development with Java Spring Boot and React.
