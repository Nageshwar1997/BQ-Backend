import { RedisClientType } from "redis";
import { redisClient } from "../configs";

class RedisService {
  private client: RedisClientType | null = null;
  private isReady: boolean = false;

  constructor() {
    this.client = redisClient;

    this.client.on("error", (err) => {
      console.log("❌ Redis Error:", err);
      this.isReady = false;
    });

    this.client.on("connect", () => {
      console.log("👍 Redis Connected");
      this.isReady = true;
    });

    this.client.on("reconnecting", () => {
      console.log("⚠️ Redis Reconnecting");
      this.isReady = false;
    });

    this.client.on("end", () => {
      console.log("👋 Redis Connection Ended");
      this.isReady = false;
    });
  }

  public async connect() {
    try {
      await this.client?.connect();
    } catch (err) {
      console.log("❌ Redis connection failed:", err);
      this.isReady = false;
    }
  }

  public getClient(): RedisClientType | null {
    if (!this.isReady) return null;
    return this.client;
  }

  public isConnected(): boolean {
    return this.isReady;
  }
}

export const redisService = new RedisService();
