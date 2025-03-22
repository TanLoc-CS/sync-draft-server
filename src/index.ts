import { SyncServer } from "./server";
import * as dotenv from "dotenv";

dotenv.config();

try {
  const syncServer = new SyncServer();
  syncServer.start();
} catch (error) {
  console.error(error);
  process.exit();
}