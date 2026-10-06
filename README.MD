# ChatNConnect

ChatNConnect is a full-stack, real-time messaging application for one-to-one conversations. It combines a React/Vite client with an Express, MongoDB, and Socket.IO backend.

## Highlights

- Secure account registration, login, logout, and session persistence with an HTTP-only JWT cookie
- Real-time text and image messages over Socket.IO
- Online presence updates across multiple browser tabs or devices
- Contact discovery and chat-partner lists
- Profile-picture uploads through Cloudinary
- Optional welcome emails through Resend
- API and authentication rate limiting
- Responsive interface built with Tailwind CSS and daisyUI

## Technology

### Frontend

- React 19
- Vite
- React Router
- Zustand
- Axios
- Socket.IO Client
- Tailwind CSS and daisyUI

### Backend

- Node.js 20.19 or newer
- Express
- MongoDB with Mongoose
- Socket.IO
- JSON Web Tokens and HTTP-only cookies
- Cloudinary
- Resend
- express-rate-limit

## Repository structure

```text
.
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── emails/         # Email providers and templates
│   │   ├── lib/            # Database, environment, socket, and utility modules
│   │   ├── middleware/     # Authentication and rate limiting
│   │   ├── models/         # Mongoose models
│   │   └── routes/         # HTTP route definitions
│   └── .env.example
├── frontend/
│   ├── public/             # Static images and notification sounds
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route-level screens
│       ├── store/          # Authentication and chat state
│       └── lib/            # Client utilities
├── package.json            # Root build and start commands
└── README.MD
```

## Requirements

- Node.js 20.19.0 or newer
- npm
- A MongoDB deployment (local MongoDB or MongoDB Atlas)
- Cloudinary credentials for image uploads
- Resend credentials only if welcome emails are enabled

## Local development

### 1. Configure the backend

Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item backend/.env.example backend/.env
```

Set at least `MONGO_URI` and a strong, unique `JWT_SECRET`. The default email mode is disabled, so email credentials are not required for local development.

### 2. Install dependencies

Install each workspace independently:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Start the application

Run the backend and frontend in separate terminals:

```bash
# Terminal 1
cd backend
npm run dev
```

```bash
# Terminal 2
cd frontend
npm run dev
```

Open the Vite URL shown in the frontend terminal, normally `http://localhost:5173`. The API and Socket.IO server run on `http://localhost:3000` by default.

If PowerShell blocks `npm` scripts on Windows, use `npm.cmd` instead.

## Environment configuration

All backend configuration is read from `backend/.env`. Never commit this file or real credentials.

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Backend port. Defaults to `3000`. |
| `NODE_ENV` | No | Use `development` locally and `production` when deployed. |
| `CLIENT_URL` | Yes | Frontend origin allowed by CORS, for example `http://localhost:5173`. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Long, random secret used to sign authentication cookies. |
| `CLOUDINARY_CLOUD_NAME` | For image uploads | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | For image uploads | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | For image uploads | Cloudinary API secret. |
| `EMAIL_PROVIDER` | No | `disabled` (default) or `resend`. |
| `RESEND_API_KEY` | When `EMAIL_PROVIDER=resend` | Resend API key. |
| `EMAIL_FROM` | When `EMAIL_PROVIDER=resend` | Sender address authorized by Resend. |
| `EMAIL_FROM_NAME` | No | Display name for welcome emails. |

When email delivery is disabled, signup still succeeds and no email provider is contacted. When it is enabled, configure a sender address or domain authorized by Resend. See the [Resend domain documentation](https://resend.com/changelog/new-domains-workflow).

## Available commands

### Root

| Command | Purpose |
| --- | --- |
| `npm run build` | Clean-install backend and frontend dependencies, then create the frontend production bundle. |
| `npm start` | Start the backend server. |

### Backend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the backend with Nodemon. |
| `npm start` | Start the backend with Node.js. |

### Frontend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create the production frontend bundle. |
| `npm run preview` | Serve the production bundle locally. |

## HTTP API

All API routes are prefixed with `/api`.

### Authentication

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Public | Create an account and issue a session cookie. |
| `POST` | `/auth/login` | Public | Authenticate an existing account. |
| `POST` | `/auth/logout` | Public | Clear the session cookie. |
| `GET` | `/auth/check` | Required | Return the current authenticated user. |
| `PUT` | `/auth/update-profile` | Required | Upload and save a profile picture. |

### Messages

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/messages/contacts` | Required | List all other users. |
| `GET` | `/messages/chats` | Required | List users with an existing conversation. |
| `GET` | `/messages/:userId` | Required | Load the conversation with a user. |
| `POST` | `/messages/send/:userId` | Required | Send a text message, image, or both. |

Socket.IO connections use the same JWT cookie for authentication. New messages are delivered through the `newMessage` event, and presence changes through `getOnlineUsers`.
