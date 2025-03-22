import { Request, Response, Router } from "express";
import Redis from "ioredis";

import { createDocument, deleteDocumentById, getDocumentById, getDocumentsbyUserId, updateDocumentTitle } from "../../controller/document";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../status_code";
import { addSharedIdToProfile, getUserById, removeSharedIdFromProfile } from "../../controller/user";

export const documentRouter = (router: Router, redis: Redis) => {
  router.route('/documents')
  .get(async (req: Request, res: Response): Promise<any> => {
    try {
      const { q } = req.query;
      const userId = req.auth.payload.sub;

      if (q === 'mine') {
        const myDocs = await getDocumentsbyUserId(userId);
        
        return res.status(OK).json(myDocs);
      } else if (q == 'shared') {
        const user = await getUserById(userId);

        if (!user) {
          return res.status(NOT_FOUND).json(null);
        }

        const sharedDocs = await Promise.all(user.shared.map(docId => getDocumentById(userId, docId)));

        return res.status(OK).json(sharedDocs);
      }

      return res.status(BAD_REQUEST).json({
        error: 'Invalid query params'
      })
    } catch (error) {
      console.error(`[Error] GET | /documents: ${req.params.userId}: ${error}`);
      
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error'
      });
    }
  })

  router.route('/documents/:docId')
  .get(async (req: Request, res: Response): Promise<any> => {
    try {
      const { docId } = req.params;
      const userId = req.auth.payload.sub;

      const doc = await getDocumentById(userId, docId);

      if (!doc) {
        return res.status(NOT_FOUND).json(null)
      }

      if (userId !== doc.ownerId) {
        await addSharedIdToProfile(userId, docId);
        console.log(`[Server] ${userId} added ${docId} to shared`)
      }

      return res.status(OK).json(doc);
    } catch (error) {
      console.error(`[Error] GET | /documents/:docId: ${req.params.docId}: ${error}`);
      
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error'
      });
    }
  })
  
  router.route('/documents')
  .post(async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.auth.payload.sub;

      const newDoc = await createDocument(userId);
      
      if (newDoc) {
        await redis.set(newDoc._id.toString(), '');
      }

      return res.status(OK).json(newDoc);
    } catch (error) {
      console.error(`[Error] POST | /documents: ${req.auth.payload.sub}: ${error}`);
      
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error'
      });
    }
  })

  router.route('/documents/:docId')
  .put(async (req: Request, res: Response): Promise<any> => {
    try {
      const { docId } = req.params;
      const { newTitle } = req.body;

      const updatedDocument = await updateDocumentTitle(docId, newTitle);

      return res.status(OK).json(updatedDocument);
    } catch (error) {
      console.error(`[Error] PUT | /documents/:docId: ${req.params.docId}: ${error}`);
      
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error'
      });
    }
  })

  router.route('/documents/:docId')
  .delete(async (req: Request, res: Response): Promise<any> => {
    try {
      const { docId } = req.params;
      const userId = req.auth.payload.sub;

      await deleteDocumentById(userId, docId);

      await redis.del(`room_${docId}`, docId)

      return res.status(OK).json({ message: "success" });
    } catch (error) {
      console.error(`[Error] DELETE | /documents/:docId: ${req.params.docId}: ${error}`);
      
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error'
      });
    }
  })
}