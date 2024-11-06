import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function connectDB() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    const db = await mongoose.connect(MONGODB_URI);
    console.log(`[DB] Connected to MongoDB: ${db.version}`);
  } catch(error) {
    console.error("[DB] Error connecting to MongoDB:", error);
    process.exit();
  }
}

export default connectDB;