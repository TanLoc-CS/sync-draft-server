import Redis from "ioredis";

async function connectRedis() {
  try {
    const redis = new Redis({
      port: 6379, // Redis port
      host: process.env.REDIS_HOST || '', // Redis host
      username: "default", // needs Redis >= 6
      password: process.env.REDIS_PASSWORD || '',
      db: 0, // Defaults to 0
    });

    const health = await redis.ping();
    if (health === 'PONG') {
      console.log(`[Redis] Connected to redis: ${process.env.REDIS_HOST}`);
      return redis;
    }
    throw new Error('Failed to connect to redis');
  } catch (error) {
    console.error("[Redis] Error connecting to Redis:", error);
    process.exit();
  }
}

export default connectRedis;
