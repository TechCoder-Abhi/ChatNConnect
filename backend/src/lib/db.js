import mongoose from "mongoose";
import { ENV } from "./env.js";
import Message from "../models/Message.js";

export const connectDB = async () => {
  try {
    const { MONGO_URI } = ENV;
    if (!MONGO_URI) throw new Error("MONGO_URI is not set");

    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log("MONGODB CONNECTED:", conn.connection.host);

    // Messages created before read tracking was added are treated as already read.
    const migration = await Message.updateMany(
      { readAt: { $exists: false } },
      [{ $set: { readAt: "$createdAt" } }]
    );
    if (migration.modifiedCount > 0) {
      console.log(`Marked ${migration.modifiedCount} existing messages as read`);
    }
  } catch (error) {
    console.error("Error connection to MONGODB:", error);
    process.exit(1); // 1 status code means fail, 0 means success
  }
};
