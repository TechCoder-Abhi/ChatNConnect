import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  getUnreadCounts,
  markAllMessagesRead,
  markConversationRead,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { apiRateLimit } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// Limit requests before checking authentication.
router.use(apiRateLimit, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/unread", getUnreadCounts);
router.patch("/read-all", markAllMessagesRead);
router.patch("/read/:userId", markConversationRead);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

export default router;
