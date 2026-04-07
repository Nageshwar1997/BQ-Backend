import { Types } from "mongoose";
import { RedisClientType } from "redis";
import { UserModule } from "../Modules";
import { constants } from "../constants";
import { PARSE_DATA, STRINGIFY_DATA } from "../utils";
import { configs } from "../configs";

export class Redis {
  private client: RedisClientType | null = null;
  private isReady: boolean = false;

  constructor() {
    this.client = configs.Redis;

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

  /* ---------------- CONNECTION ---------------- */

  public async connect() {
    try {
      await this.client?.connect();
    } catch (err) {
      console.log("❌ Redis connection failed:", err);
      this.isReady = false;
    }
  }

  public getClient(): RedisClientType | null {
    if (!this.isReady || !this.client) return null;
    return this.client;
  }

  public isConnected(): boolean {
    return this.isReady;
  }

  /* ---------------- USER CACHE ---------------- */

  // DB fetch helper
  private getDbUser = async (userId: string | Types.ObjectId) => {
    return await UserModule.Services.getUserById({
      id: userId,
      lean: true,
      password: false,
    });
  };

  // Set user in Redis
  public async setCachedUser(user: UserModule.Types.UserProps) {
    const client = this.getClient();
    if (!client || !user) return;

    const { password: _, ...restUser } =
      typeof user.toObject === "function" ? user.toObject() : user;

    await client.setEx(
      `user:${user._id}`,
      constants.common.MINUTE * constants.common.MINUTE,
      STRINGIFY_DATA(restUser),
    );
  }

  // Get user (Redis fallback → DB → Redis set)
  public async getCachedUser(
    userId: string | Types.ObjectId,
  ): Promise<UserModule.Types.UserProps | null> {
    const client = this.getClient();

    // Redis unavailable → direct DB
    if (!client) {
      const user = await this.getDbUser(userId);
      return user;
    }

    const cachedUser = await client.get(`user:${userId}`);

    if (cachedUser) {
      try {
        return PARSE_DATA(cachedUser);
      } catch {
        return await this.getDbUser(userId);
      }
    }

    // Cache miss or corrupted → fetch from DB
    const user = await this.getDbUser(userId);

    // Set in Redis if user exists
    if (user) {
      await this.setCachedUser(user);
    }

    return user;
  }

  /* ---------------- INVALIDATION / WRITE-THROUGH ---------------- */

  // Write-through: update Redis after DB update
  public async updateCachedUser(user: UserModule.Types.UserProps) {
    const client = this.getClient();
    if (!client || !user) return;

    await this.setCachedUser(user);
  }

  // Delete / logout
  public async deleteCachedUser(userId: string | Types.ObjectId) {
    const client = this.getClient();
    if (!client) return;

    await client.del(`user:${userId}`);
  }
}
