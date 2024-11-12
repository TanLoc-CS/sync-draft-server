import { Application, Request, Response, Router } from "express";
import Redis from "ioredis";

import { userRouter } from "./routes/user";
import { documentRouter } from "./routes/document";
import { mergeRouter } from "./routes/merge";
import { jwtMiddleware } from "../middleware/jwt";


export default async (app: Application, redis: Redis) => {
  const router = Router();
  
  app.get('/health', (req: Request, res: Response) => {
    res.send('👍 Sync Server is running...')
  })

  app.use('/api', router);

  router.use(jwtMiddleware);
  
  userRouter(router);
  documentRouter(router, redis);
  mergeRouter(router);
}