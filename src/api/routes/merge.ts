import { Request, Response, Router } from "express";
import { createMerge, getMergesByDocId } from "../../controller/merge";
import { INTERNAL_SERVER_ERROR, OK } from "../status_code";

export const mergeRouter = (router: Router) => {
  router.route('/merges/:docId')
  .get(async (req: Request, res: Response): Promise<any> => {
    try {
      const { docId } = req.params;

      const merges = await getMergesByDocId(docId);

      return res.status(OK).json(merges);
    } catch (error) {
      console.error(`Error getting merges: ${req.params.docId}: ${error}`);
      
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error'
      });
    }
  })
  .post(async (req: Request, res: Response): Promise<any> => {
    try {
      const { docId } = req.params;
      const { before, after, description } = req.body
      const userId = req.auth.payload.sub;

      const newMerge = await createMerge({
        docId: docId,
        mergedBy: userId,
        before: before,
        after: after,
        description: description
      })

      return res.status(OK).json(newMerge);
    } catch (error) {
      console.error(`Error creating merge: ${req.auth.payload.sub}: ${error}`);

      return res.status(INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error'
      });
    }
  })
}

