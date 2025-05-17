import mongoose from "mongoose";
import { Constants, Envs } from "../..";

// TypeScript global augmentation
declare global {
  var mongooseConn: typeof mongoose | null;
}

// Connection cache
let cachedConnection: typeof mongoose | null = global.mongooseConn || null;

export const connect = async (): Promise<typeof mongoose> => {
  if (cachedConnection) {
    console.log("🚀 Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    if (!Envs.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable not defined");
    }

    console.log("🔌 Establishing new MongoDB connection...");

    const newConnection = await mongoose.connect(Envs.MONGODB_URI, {
      ...Constants.MONGO_OPTIONS,
      ...(Envs.NODE_ENV === "development" && {
        maxPoolSize: 5, // Smaller pool for dev
        minPoolSize: 1,
      }),
    });

    // Store in global variable for dev hot-reload
    if (Envs.NODE_ENV === "development") {
      global.mongooseConn = newConnection;
    }

    cachedConnection = newConnection;
    console.log("✅ MongoDB connected successfully");

    // Connection event handlers
    newConnection.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      cachedConnection = null;
    });

    newConnection.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
      cachedConnection = null;
    });

    return newConnection;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    cachedConnection = null;
    throw error;
  }
};
