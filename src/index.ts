import { SyncServer } from "./server";

try {
  new SyncServer();
} catch (error) {
  console.error(error);
  process.exit();
}