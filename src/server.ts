import express, { Express, Request, Response } from "express";
import { DefaultEventsMap, Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import 'dotenv/config'

import connectDB from "./config/mongoose";
import api from "./api";

export class SyncServer {
  #server: any

  #app: Express

  #io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

  #db: any

  constructor() {
    // Connect to MongoDB
    connectDB();

    const PORT =
      process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3030;

    this.#app = express();
    this.#server = createServer(this.#app);
    this.#io = new Server(this.#server, {
      cors: {
        origin: [process.env.CLIENT_URL || 'http://localhost:5173']
      }
    })

    this.#app.use(cors());
    this.#app.use(express.urlencoded({ extended: true }));
    this.#app.use(express.json());

    api(this.#app);

    // load main doc
    const doc = ''

    this.#io.on('connection', (socket) => {
      // Create a snapshot of document
      // const mainDocSnapshot = automerge.clone(doc);
      console.log(`[Client:${socket.id}] Connected`)

      // Handle client disconnect
      socket.on('disconnect', () => {
        console.log(`[Client:${socket.id}] Disconnected`);
      });
    })

    this.#server.listen(PORT, () => {
      console.log(`[Server] Server is running at http://localhost:${3030}`);
    })
  }
}

