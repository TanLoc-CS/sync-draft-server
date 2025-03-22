import mongoose from "mongoose";

async function connectDB(): Promise<typeof mongoose> {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    const db = await mongoose.connect(process.env.MONGODB_URI || '');
    console.log(`[DB] Connected to MongoDB: ${db.version}`);
    return db;
  } catch(error) {
    console.error("[DB] Error connecting to MongoDB:", error);
    process.exit();
  }
}

export default connectDB;