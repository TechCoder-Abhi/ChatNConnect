# ChatNConnect

ChatNConnect is a full-stack real-time messaging application for private, one-to-one conversations. It combines a responsive React interface with an Express API, MongoDB persistence, and Socket.IO events for live updates.

## Highlights

- Secure signup, login, logout, and session persistence using HTTP-only JWT cookies
- Real-time messaging and online presence across multiple browser tabs
- Contact search and conversation lists
- Cursor-based pagination for message history
- Unread message counts, notifications, mark-as-read actions, and read receipts
- Responsive chat interface with loading states and starter-message suggestions
- API and authentication rate limiting
- Production mode that serves the built frontend from the backend

## Technology

- **Frontend:** React 19, Vite, React Router, Zustand, Axios, Socket.IO Client, Tailwind CSS, daisyUI
- **Backend:** Node.js 20.19+, Express, MongoDB/Mongoose, Socket.IO, JSON Web Tokens, express-rate-limit
- **Quality checks:** GitHub Actions, ESLint, Node.js syntax checks, and a production frontend build

## Project structure

```text
backend/
  src/
    controllers/       Request handlers
    lib/               Database, environment, and Socket.IO setup
    middleware/        Authentication and rate limiting
    models/            Mongoose models
    routes/             API routes
frontend/
  src/
    components/        Reusable UI components
    pages/             Login, signup, and chat screens
    store/             Client state management
    lib/               Client utilities
  public/              Images and notification sounds
.github/workflows/     Continuous integration
```

## Requirements

- Node.js 20.19 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection

## Run locally

From the project root:

1. Create `backend/.env` from `backend/.env.example`.
2. Set `MONGO_URI` and replace `JWT_SECRET` with a long, random secret.
3. Install dependencies:

   ```powershell
   npm ci --prefix backend
   npm ci --prefix frontend
   ```

4. Start the backend and frontend in separate terminals:

   ```powershell
   npm run dev --prefix backend
   npm run dev --prefix frontend
   ```

5. Open [http://localhost:5173](http://localhost:5173).

### Environment variables

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Backend and Socket.IO port | `3000` |
| `NODE_ENV` | Runtime mode | `development` |
| `CLIENT_URL` | Frontend origin allowed by CORS and Socket.IO | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/chatnconnect` |
| `JWT_SECRET` | Secret used to sign session tokens | Long random value |

## Useful commands

Run these commands from the project root unless noted otherwise.

| Command | Purpose |
| --- | --- |
| `npm run check` | Check backend syntax and lint the frontend |
| `npm run build` | Install locked dependencies and build the frontend |
| `npm start` | Start the backend |
| `npm run dev --prefix backend` | Start the backend with Nodemon |
| `npm run dev --prefix frontend` | Start the Vite development server |
| `npm run lint --prefix frontend` | Run frontend ESLint |

When `NODE_ENV=production`, `npm start` serves the frontend build from `frontend/dist`. Build it first with `npm run build`.

## API overview

All API routes use the `/api` prefix. Message routes and `GET /auth/check` require the authenticated JWT cookie.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create an account and session |
| `POST` | `/auth/login` | Start a session |
| `POST` | `/auth/logout` | Clear the session cookie |
| `GET` | `/auth/check` | Return the current user |
| `GET` | `/health` | Report API and database readiness |
| `GET` | `/messages/contacts` | List available contacts |
| `GET` | `/messages/chats` | List conversation partners |
| `GET` | `/messages/unread` | Return unread counts by sender |
| `PATCH` | `/messages/read/:userId` | Mark one conversation as read |
| `PATCH` | `/messages/read-all` | Mark all incoming messages as read |
| `GET` | `/messages/:userId` | Load a conversation; supports `limit` and `cursor` |
| `POST` | `/messages/send/:userId` | Send a text message |

Message history returns `messages`, `hasMore`, and `nextCursor`. Socket.IO uses the same session cookie and publishes online-user, new-message, and read-state updates.
