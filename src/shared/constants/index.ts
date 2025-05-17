import { Types } from "..";

// Default connection options
export const MONGO_OPTIONS: Types.IMongoOptions = {
  serverSelectionTimeoutMS: 5000, // 5 seconds connection timeout
  socketTimeoutMS: 45000, // 45 seconds query timeout
  maxPoolSize: 10, // Max connections in pool
  minPoolSize: 2, // Min connections to maintain
};
