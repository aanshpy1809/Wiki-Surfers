import Redis from "ioredis"
import dotenv from 'dotenv'

dotenv.config();
const REDIS_URI=process.env.REDIS_URI
export const redis = new Redis(REDIS_URI);
