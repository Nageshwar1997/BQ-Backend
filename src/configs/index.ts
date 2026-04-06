import { ChatbotConfigs } from "./Chatbot.Config";
import { DatabaseConfig } from "./Database.Config";
import { OAuthConfig } from "./O-Auth.Config";
import { RazorpayConfig } from "./Razorpay.Config";
import { RedisConfig } from "./Redis.Config";
import { SocketConfigs } from "./Socket.Config";

export const Configs = {
  Chatbot: ChatbotConfigs,
  ConnectDB: DatabaseConfig,
  OAuth: OAuthConfig,
  Razorpay: RazorpayConfig,
  Redis: RedisConfig,
  Socket: SocketConfigs,
};
