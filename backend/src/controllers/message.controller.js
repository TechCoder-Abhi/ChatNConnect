import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;
    if (!mongoose.isValidObjectId(userToChatId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const conversation = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    };
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 50) : 30;
    const filter = { ...conversation };

    if (req.query.cursor) {
      if (!mongoose.isValidObjectId(req.query.cursor)) {
        return res.status(400).json({ message: "Invalid message cursor." });
      }

      const cursorMessage = await Message.findOne({ _id: req.query.cursor, ...conversation });
      if (!cursorMessage) {
        return res.status(400).json({ message: "Message cursor does not belong to this conversation." });
      }

      filter.$and = [
        conversation,
        {
          $or: [
            { createdAt: { $lt: cursorMessage.createdAt } },
            { createdAt: cursorMessage.createdAt, _id: { $lt: cursorMessage._id } },
          ],
        },
      ];
      delete filter.$or;
    }

    const page = await Message.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);
    const hasMore = page.length > limit;
    const messages = page.slice(0, limit).reverse();

    res.status(200).json({
      messages,
      hasMore,
      nextCursor: hasMore ? messages[0]._id : null,
    });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body || {};
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver ID." });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "Message text is required." });
    }
    if (text.trim().length > 2000) {
      return res.status(400).json({ message: "Message must be 2000 characters or fewer." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text.trim(),
    });

    await newMessage.save();

    const receiverSocketIds = getReceiverSocketId(receiverId);
    if (receiverSocketIds.length) {
      io.to(receiverSocketIds).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
      {
        $project: {
          partnerId: {
            $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"],
          },
          lastMessageAt: "$createdAt",
        },
      },
      { $group: { _id: "$partnerId", lastMessageAt: { $max: "$lastMessageAt" } } },
      { $sort: { lastMessageAt: -1 } },
    ]);

    const partnerIds = conversations.map((conversation) => conversation._id);
    const users = await User.find({ _id: { $in: partnerIds } }).select("-password");
    const usersById = new Map(users.map((user) => [user._id.toString(), user]));
    const chatPartners = partnerIds
      .map((partnerId) => usersById.get(partnerId.toString()))
      .filter(Boolean);

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUnreadCounts = async (req, res) => {
  try {
    const unreadCounts = await Message.aggregate([
      { $match: { receiverId: req.user._id, readAt: null } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json(unreadCounts.map(({ _id, count }) => ({ senderId: _id, count })));
  } catch (error) {
    console.error("Error getting unread counts:", error.message);
    res.status(500).json({ message: "Unable to load unread messages" });
  }
};

export const markConversationRead = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const readAt = new Date();
    const result = await Message.updateMany(
      { senderId: userId, receiverId: req.user._id, readAt: null },
      { $set: { readAt } }
    );

    const senderSocketIds = getReceiverSocketId(userId);
    if (senderSocketIds.length && result.modifiedCount > 0) {
      io.to(senderSocketIds).emit("messagesRead", {
        readerId: req.user._id.toString(),
        readAt,
      });
    }
    const readerSocketIds = getReceiverSocketId(req.user._id);
    if (readerSocketIds.length && result.modifiedCount > 0) {
      io.to(readerSocketIds).emit("conversationMarkedRead", { senderId: userId });
    }

    res.status(200).json({ readAt, markedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error marking conversation read:", error.message);
    res.status(500).json({ message: "Unable to mark conversation as read" });
  }
};

export const markAllMessagesRead = async (req, res) => {
  try {
    const readAt = new Date();
    const senderIds = await Message.distinct("senderId", {
      receiverId: req.user._id,
      readAt: null,
    });
    const result = await Message.updateMany(
      { receiverId: req.user._id, readAt: null },
      { $set: { readAt } }
    );

    for (const senderId of senderIds) {
      const senderSocketIds = getReceiverSocketId(senderId);
      if (senderSocketIds.length) {
        io.to(senderSocketIds).emit("messagesRead", {
          readerId: req.user._id.toString(),
          readAt,
        });
      }
    }
    const readerSocketIds = getReceiverSocketId(req.user._id);
    if (readerSocketIds.length) io.to(readerSocketIds).emit("allMessagesMarkedRead");

    res.status(200).json({ readAt, markedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error marking all messages read:", error.message);
    res.status(500).json({ message: "Unable to mark messages as read" });
  }
};
