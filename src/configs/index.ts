import { chatbotConfigs } from "./chatbot.config";
import { databaseConfig } from "./database.config";
import { oAuthConfig } from "./oAuth.config";
import { razorpayConfig } from "./razorpay.config";
import { redisConfig } from "./redis.config";
import { socketConfigs } from "./socket.config";

export const configs = {
  chatbot: chatbotConfigs,
  connectDB: databaseConfig,
  oAuth: oAuthConfig,
  razorpay: razorpayConfig,
  redis: redisConfig,
  socket: socketConfigs,
};
