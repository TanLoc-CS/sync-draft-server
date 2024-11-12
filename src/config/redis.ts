import Redis from "ioredis";
import * as dotenv from "dotenv";

dotenv.config();

async function connectRedis() {
  try {
    const redis = new Redis({
      port: 6379, // Redis port
      host: "127.0.0.1", // Redis host
      username: "default", // needs Redis >= 6
      password: process.env.REDIS_PASSWORD || '',
      db: 0, // Defaults to 0
    });

    const check = await redis.get("test");
    if (check === 'OKAY') {
      console.log('[Redis] Connected to local redis: 127.0.0.1:6379');
      return redis;
    }
    throw new Error('Failed to connect to redis');
  } catch (error) {
    console.error("[Redis] Error connecting to Redis:", error);
    process.exit();
  }
}

export default connectRedis;
