import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// A user can have multiple tabs/devices connected at the same time.
export function getReceiverSocketId(userId) {
  return [...(userSocketMap.get(userId.toString()) || [])];
}

const userSocketMap = new Map(); // userId -> Set<socketId>

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  const socketIds = userSocketMap.get(userId) || new Set();
  socketIds.add(socket.id);
  userSocketMap.set(userId, socketIds);

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", [...userSocketMap.keys()]);

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    socketIds.delete(socket.id);
    if (socketIds.size === 0) userSocketMap.delete(userId);
    io.emit("getOnlineUsers", [...userSocketMap.keys()]);
  });
});

export { io, app, server };
