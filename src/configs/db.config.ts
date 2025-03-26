import mongoose from "mongoose";

let cachedConnection: typeof mongoose | null = null;
const connectDB = async () => {
  if (cachedConnection) {
    console.log("Cached server used to connect to MongoDB");
    return cachedConnection;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }
  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = connection;
    console.log("New server connected to MongoDB");
    return connection;
  } catch (error: any) {
    console.error(error);
    throw new Error(`${error.message} - unable to connect to the database`);
  }
};

export default connectDB;
