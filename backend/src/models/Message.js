import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1, _id: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1, _id: -1 });
messageSchema.index({ receiverId: 1, readAt: 1, senderId: 1 });
messageSchema.index({ senderId: 1, receiverId: 1, readAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
