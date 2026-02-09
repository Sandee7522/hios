import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default connectDB;
