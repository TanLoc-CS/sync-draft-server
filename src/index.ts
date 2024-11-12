import { SyncServer } from "./server";

try {
  const syncServer = new SyncServer();
  syncServer.start();
} catch (error) {
  console.error(error);
  process.exit();
}