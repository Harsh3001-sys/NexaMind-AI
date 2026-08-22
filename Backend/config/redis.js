import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://redis:6379"
});

redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Redis connected successfully");
    } catch (err) {
        console.error("Redis connection failed:", err);
    }
};

export { redisClient, connectRedis };