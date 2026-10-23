# Floyd Technology Hub — Real-Time Multiplayer Tic-Tac-Toe

![Brand: Floyd Technology Hub](https://img.shields.io/badge/Brand-Floyd%20Technology%20Hub-00f0ff?style=for-the-badge)
![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-10b981?style=for-the-badge)
![Architecture: Full Stack MERN + Socket.IO](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20MongoDB%20%7C%20Socket.IO-8b5cf6?style=for-the-badge)

A premium, competitive, real-time multiplayer Tic-Tac-Toe web application engineered for **Floyd Technology Hub**. Featuring high-performance server-authoritative game logic, dark glassmorphism visual design, instant guest identity with cryptographic session recovery, real-time isolated room chat, global leaderboards, match archives, and step-by-step interactive game replays.

---

## 🌟 Key Highlights

- **Branded Presentation**: Distinctive **Floyd Technology Hub** visual identity with custom geometric X/O logo motif, responsive navbar, and dark gaming atmosphere.
- **Dark Glassmorphism Design System**: Layered frosted glass panels (`backdrop-filter: blur`), subtle neon cyan (`#00f0ff`) and magenta (`#f43f5e`) accents, and responsive touch controls (exceeding 44×44px standards).
- **Server-Authoritative Game Engine**: Moves, turn switching, win checks across all 8 combinations, draw evaluations, and rematch sequences are strictly validated and processed by the Node.js backend.
- **Real-Time Multiplayer (Socket.IO)**: Low-latency two-way synchronization with sequence versioning (`stateVersion`), reconnection grace period (45 seconds), and automatic forfeit handling for disconnects.
- **Guest Identity & Zero-Registration**: Cryptographically generated guest profiles and session JWTs allow users to jump into matches instantly while retaining personal records, streaks, and ratings.
- **In-Match Encrypted & Isolated Chat**: Live messaging isolated to match participants with rate limiting, XSS sanitization, and quick emoji reactions (👍, 🔥, 😎, 😮, 👏, 🧠, ⚔️, 🤝).
- **Global Leaderboard & Match Archives**: Authoritative statistics (wins, losses, draws, win percentage, win streaks) persisted in MongoDB Atlas, complete with an interactive move-by-move replay viewer.
- **Web Audio API Synthesizer**: High-fidelity sound effects generated dynamically in the browser (move pop, game start chimes, victory fanfare, chat notifications) with zero external audio assets to eliminate 404s.

---

## 🏗️ Architecture & Project Structure

```
Tic-Tac-Toe Game/
  ├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
  │   ├── src/
  │   │   ├── components/         # Reusable glassmorphic UI elements
  │   │   │   └── common/         # Navbar, Footer, Logo, GlassCard, Button, Modal, SoundToggle
  │   │   ├── context/            # AuthContext (Guest session) & SoundContext (Synthesizer)
  │   │   ├── features/
  │   │   │   ├── auth/           # Guest identity pill & NicknameModal
  │   │   │   ├── chat/           # Live chat box, message bubbles, emoji reaction bar
  │   │   │   ├── game/           # GameBoard, GameCell, PlayerCard, WinningLine, GameControls
  │   │   │   ├── history/        # Match history list & interactive ReplayModal player
  │   │   │   ├── leaderboard/    # Global ranking table with podium highlights
  │   │   │   └── lobby/          # Hero view, CreateRoomCard, JoinRoomCard, WaitingRoom
  │   │   ├── services/           # REST API client, Socket.IO client, Web Audio Synthesizer
  │   │   ├── test/               # Vitest component test suite
  │   │   ├── App.jsx             # Main application orchestrator
  │   │   ├── index.css           # Glassmorphism utilities, glow effects, neon styles
  │   │   └── main.jsx
  │   ├── index.html
  │   ├── tailwind.config.js
  │   └── vite.config.js
  │
  ├── server/                     # Backend Application (Node.js + Express + Socket.IO + MongoDB)
  │   ├── src/
  │   │   ├── config/             # Environment, Database (MongoDB Atlas / in-memory fallback), Logger
  │   │   ├── controllers/        # Auth, Game Rooms, Leaderboards, Match History
  │   │   ├── middleware/         # JWT Bearer auth, Rate limiting, Zod validation, Error handling
  │   │   ├── models/             # Mongoose schemas: GuestPlayer, GameRoom, GameRound, ChatMessage
  │   │   ├── routes/             # REST endpoints (/health, /guest, /rooms, /leaderboard, /history)
  │   │   ├── services/           # Authoritative gameEngine, roomService, statsService
  │   │   ├── sockets/            # Socket.IO connection lifecycle, move sync, rematch, chat
  │   │   ├── utils/              # Room code generator, JWT helpers
  │   │   ├── app.js              # Express app with Helmet, CORS, and Rate Limiting
  │   │   └── server.js           # Server bootstrapper & graceful shutdown handler
  │   ├── tests/                  # Backend unit, integration, and multiplayer socket test suites
  │   │   ├── gameEngine.test.js  # All 8 winning combos, draws, move validations
  │   │   ├── api.test.js         # REST endpoints, auth, and room lifecycle
  │   │   └── multiplayer.test.js # Two real Socket.IO clients playing a full match
  │   └── package.json
  │
  ├── package.json                # Root package orchestration scripts
  ├── README.md
  └── .env.example
```

---

## ⚡ Socket.IO Real-Time Protocol Specification

### Client to Server Events

| Event | Payload | Description |
|---|---|---|
| `room:create` | `{}` | Creates a new private room. Creator is assigned mark `X`. |
| `room:join` | `{ roomCode: string }` | Joins a room. Opponent is assigned mark `O`. Recovers seat if reconnecting. |
| `game:move` | `{ roomCode: string, cellIndex: number, stateVersion: number }` | Submits a move on an empty cell (0–8). Validated authoritatively. |
| `game:sync-request` | `{ roomCode: string }` | Requests full authoritative state snapshot for resynchronization. |
| `game:rematch-request` | `{ roomCode: string }` | Requests or accepts a rematch after a completed round. |
| `chat:send` | `{ roomCode: string, text: string }` | Sends an in-game message (sanitized, max 300 characters). |
| `room:leave` | `{ roomCode: string }` | Gracefully leaves room. Active round results in forfeit. |

### Server to Client Events

| Event | Payload | Description |
|---|---|---|
| `room:created` | `{ roomCode, room, mark }` | Acknowledges room creation to the host. |
| `room:joined` | `{ roomCode, room, mark, isRejoin }` | Acknowledges room joining or seat recovery. |
| `room:player-joined` | `{ room, player, isRejoin }` | Notifies room members that opponent has connected. |
| `game:started` | `{ room, currentTurn, roundNumber }` | Emitted when both players are seated and match begins. |
| `game:move-accepted` | `{ cellIndex, mark, playerId, nextTurn, stateVersion, board, lastMove }` | Broadcast to both players when a valid move is placed. |
| `game:move-rejected` | `{ cellIndex, code, error, expectedVersion }` | Sent to the moving client if move is invalid or stale. |
| `game:round-finished` | `{ winnerMark, winnerId, isDraw, winningLine, scores, finalBoard }` | Emitted when 3 marks align or board is drawn. |
| `game:rematch-status` | `{ rematchRequests, requestedBy }` | Broadcast when a player has requested a rematch. |
| `game:rematch-started` | `{ room, roundNumber, currentTurn, scores }` | Emitted when both players agree; board resets with alternating mark. |
| `chat:message` | `{ messageId, roomCode, senderId, senderNickname, senderMark, text, timestamp }` | Broadcast to both room participants. |
| `player:connection-status` | `{ playerId, connected, gracePeriodMs }` | Alerts opponent of temporary connection drops. |
| `server:error` | `{ message, code, event }` | Error notification. |

---

## 📡 REST API Reference

All endpoints are versioned at `/api/v1`.

### Authentication & Guest Sessions
- `POST /api/v1/guest/session`: Create or recover guest session `{ nickname, existingPlayerId? }`.
- `GET /api/v1/guest/me`: Retrieve current guest player profile, stats, and rankings.
- `PATCH /api/v1/guest/nickname`: Update player display nickname.

### Game Rooms
- `POST /api/v1/rooms`: Create a new private room.
- `POST /api/v1/rooms/join`: Validate code and join room.
- `GET /api/v1/rooms/:roomCode`: Fetch authoritative room snapshot.

### Leaderboard & Stats
- `GET /api/v1/leaderboard?page=1&limit=20`: Ranked players sorted by wins, win rate, and total games.
- `GET /api/v1/players/:playerId/stats`: Personal statistics and global ranking position.

### Match History & Replays
- `GET /api/v1/history?page=1&limit=15`: Retrieve past matches for authenticated guest.
- `GET /api/v1/history/:roundId`: Detailed round record with chronological move sequence for playback.

### Health & Readiness
- `GET /api/v1/health`: Server health check, uptime, and database connectivity.
- `GET /api/v1/ready`: Readiness probe for Kubernetes / cloud orchestrators.

---

## 🚀 Quickstart & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- Optional: MongoDB Atlas cluster URI (If no URI is provided, the backend automatically boots an in-memory MongoDB instance for seamless instant zero-config development).

### 1. Installation
Clone the repository and install all dependencies:

```bash
# Install root, server, and client dependencies
npm run install:all
```

Or install manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables
Copy `.env.example` in both `server/` and `client/`:

```bash
# In server directory
cp server/.env.example server/.env

# In client directory
cp client/.env.example client/.env
```

### 3. Start Development Servers
Start both the backend server and frontend client concurrently:

```bash
# Terminal 1 - Start Backend (Runs on http://localhost:5000)
npm run dev:server

# Terminal 2 - Start Frontend (Runs on http://localhost:5173)
npm run dev:client
```

Open your browser at `http://localhost:5173`. Open an incognito window or another browser tab to simulate the second player!

---

## 🧪 Testing Suite

The codebase comes equipped with comprehensive automated test suites covering unit rules, REST APIs, and full real-time Socket.IO match simulations.

### Run All Tests:
```bash
npm test
```

### Run Server Tests Only:
```bash
npm run test:server
```
Covers:
- All 8 winning combinations (3 rows, 3 columns, 2 diagonals)
- Draw condition evaluation
- Turn validation, occupied cell rejection, stale version rejection
- Guest session issuance and JWT validation
- Room creation, joining, seat recovery, and capacity limits
- Real-time Socket.IO full match simulation: Room creation -> Join -> In-game Chat -> 5 Moves played -> Victory detection -> Rematch sequence.

### Run Frontend Tests Only:
```bash
npm run test:client
```
Covers:
- Floyd Technology Hub branding and logo presentation
- 3×3 GameBoard rendering 9 accessible grid cells and click handlers
- PlayerCard presentation with marks, status, and turn indicators

---

## 🚢 Production Deployment Guide

### Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. Connect repository to [Vercel](https://vercel.com).
3. Set **Root Directory** to `client`.
4. Configure Environment Variables in Vercel project settings:
   - `VITE_API_BASE_URL`: `https://your-backend-domain.com/api/v1`
   - `VITE_SOCKET_URL`: `https://your-backend-domain.com`
5. Deploy.

### Backend Deployment (Render / Railway / DigitalOcean)
1. Connect repository to [Render](https://render.com) or your persistent Node.js hosting provider.
2. Set **Root Directory** to `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: platform provided (e.g. `5000` or `$PORT`)
   - `CLIENT_ORIGINS`: `https://your-frontend-domain.vercel.app`
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/floyd_tictactoe?retryWrites=true&w=majority`
   - `SESSION_SECRET`: `[32+ character cryptographically random string]`
   - `ROOM_CODE_SECRET`: `[32+ character cryptographically random string]`
   - `ROOM_INACTIVITY_TIMEOUT_MS`: `1800000` (30 minutes)
   - `RECONNECTION_GRACE_PERIOD_MS`: `45000` (45 seconds)
6. Ensure persistent WebSocket support is enabled on the hosting provider.

---

## 🔒 Security & Anti-Cheat Measures

- **Zero Trust Client**: The server calculates all game states, turn progression, winners, and draws. No client-submitted boards, scores, or winning claims are ever accepted.
- **State Versioning**: Every move requires a `stateVersion`. Out-of-order or duplicate submissions are immediately detected and rejected.
- **Seat Protection**: Reconnection to an active player seat requires the signed guest JWT issued at session start. Guessing room codes or nicknames cannot hijack another player's seat.
- **Rate Limiting**: Express rate limiters protect session creation (60/15min), room creation (30/5min), and global API requests (300/15min). Socket chat messages are throttled to prevent spamming.
- **Input Sanitization**: User nicknames and chat messages are validated using Zod and sanitized against XSS and HTML injection.
- **Security Headers**: Helmet configured with restrictive cross-origin resource and opener policies.

---

## 📄 License & Attribution

Branded and developed for **Floyd Technology Hub**.
Licensed under the [MIT License](LICENSE).
