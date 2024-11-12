import { Request, Response, Router } from "express";
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../status_code";
import { createUser, getUserById } from "../../controller/user";

export const userRouter = (router: Router) => {
  router.route('/users')
  .get(async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.auth.payload.sub;

      const user = await getUserById(userId);

      if (!user) {
        return res.status(NOT_FOUND).json(null);
      }

      return res.status(OK).json(user);
    } catch (error) {
      console.error(`[Error] GET | /users: ${req.params.userId}: ${error}`);
      
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error'
      });
    }
  })
  .post(async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, userId } = req.body;

      const newUser = await createUser(email, userId);

      console.log(`[DB] Inserted: ${newUser}`)

      return res.status(OK).json(newUser);      
    } catch (error) {
      console.error(`[Error] POST | /users: ${req.body.email}: ${error}`);

      return res.status(INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error'
      });
    }
  })
}