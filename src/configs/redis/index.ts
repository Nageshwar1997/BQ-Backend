import { createClient, RedisClientType } from "redis";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "../../envs";

const MAX_RECONNECT_ATTEMPTS = 5;

export const redisClient: RedisClientType = createClient({
  socket: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
    reconnectStrategy: (retries: number): number | false => {
      if (retries >= MAX_RECONNECT_ATTEMPTS) {
        console.error("❌ Max Redis reconnection attempts reached");
        return false;
      }
      const delay = Math.min(retries * 1000, 10000); //10s
      console.log(
        `🔄 Redis reconnecting in ${delay}ms (attempt ${retries + 1})`
      );
      return delay;
    },
  },
  password: REDIS_PASSWORD,
});
