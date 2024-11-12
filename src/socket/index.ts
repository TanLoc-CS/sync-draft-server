import Redis from 'ioredis';
import { Server } from 'socket.io';
import { mongo } from 'mongoose';
import * as automerge from '@automerge/automerge';

import { Document, DocumentModel } from '../model';
import { updateDocument } from '../controller/document';

export default async (io: Server, redis: Redis) => {
  const docChangeStreams = new Map<string, mongo.ChangeStream<any, any>>();
  const pendingSyncs = new Map<string, NodeJS.Timeout>();

  io.on('connection', async (socket) => {
    console.log(`[Server] ${socket.id} connected`)

    // Scenario: user join a document
    socket.on('join-doc', async ({docId, userId} : {docId: string, userId: string}) => {
      try {
        socket.join(docId);
        console.log(`[Server] ${socket.id}: ${userId}|${`room_${docId}`}`);
  
        const existingUser = await redis.sismember(`room_${docId}`, userId);
  
        if (!existingUser) {
          redis.sadd(`room_${docId}`, userId);
          redis.lpush(socket.id, docId, userId);
        }
  
        const usersInDoc = await redis.smembers(`room_${docId}`);
        console.log(`[Server] Doc ${`room_${docId}`}: ${usersInDoc}`);
  
        //Send list of existing users editing the doc
        io.to(docId).emit('online-users', usersInDoc);
      } catch (error) {
        console.error(`[Error] join-doc | ${userId}: ${error}`);
      }
    })

    // Scenario: streaming the document changes to user
    // socket.on('watch-doc', async({ docId }) => {
    //   try {
    //     if (!docChangeStreams.get(docId)){
    //       const changeStream = DocumentModel.watch([{ $match: { _id: docId } }], { fullDocument: 'updateLookup'});
    //       docChangeStreams.set(docId, changeStream);
  
    //       changeStream.on('change', (change: mongo.ChangeStreamUpdateDocument<Document>) => {
    //         io.to(docId).emit('doc-changes', change.fullDocument);
    //       })

    //       changeStream.on('error', (error) => {
    //         throw new Error(error.message);
    //       })
    //     }
    //   } catch (error) {
    //     console.error(`[Error] watch-doc | ${docId}: ${error}`);
    //   }
    // })

    // Scenario: user edit document
    socket.on('edit-doc', async ({docId, content} : {docId: string, userId: string, content: string}) => {
      try {
        let curDoc: any = (await redis.get(docId)) || '';
        curDoc = automerge.from({ content: curDoc });
        const editedDoc = automerge.from({ content: content });
        const mergedDoc = automerge.merge(editedDoc, curDoc);

        await redis.set(docId, mergedDoc.content);

        // Send changed content to clients
        socket.broadcast.to(docId).emit('doc-change', mergedDoc.content);

        console.log(mergedDoc.content);
        // Throttle saving to MongoDB to avoid excessive database writes
        if (!pendingSyncs.has(docId)) {
          // Set up a timeout to sync to MongoDB after a short delay
          pendingSyncs.set(
            docId,
            setTimeout(async () => {
              try {
                await updateDocument(docId, mergedDoc.content);
                pendingSyncs.delete(docId);
              } catch (error) {
                console.log(`[Error] edit-doc | update doc[${docId}]: ${error}`)
              }
            }, 500)
          )
        }
      } catch (error) {
        console.error(`[Error] edit-doc | ${docId}: ${error}`);
      }
    })

    // Scenario: user disconnect with client
    socket.on('leave-doc', async ({docId, userId} : {docId: string, userId: string}) => {
      socket.leave(docId);
      console.log(`[Socket] User ${userId} leave ${`room_${docId}`}`)
      const leavingUser = await redis.srem(`room_${docId}`, userId);
      await redis.del(socket.id);

      if (leavingUser) {
        const usersInDoc = await redis.smembers(`room_${docId}`);
        socket.broadcast.to(docId).emit('online-users', usersInDoc);
        
        if (usersInDoc.length === 0 && docChangeStreams.has(docId)) {
          docChangeStreams.get(docId).close();
          docChangeStreams.delete(docId);
          console.log(`[Socket] Closed change stream for doc ${docId}`);
        }
      }

      console.log(`[Socket] ${socket.id} disconnected`);
    })

    socket.on('disconnect', async () => {
      try {
        const disconnectedUser = await redis.lrange(socket.id, 0, 1);
  
        if (disconnectedUser && disconnectedUser.length === 2) {
          const userId = disconnectedUser[0];
          const docId = disconnectedUser[1];          
          console.log(`[Socket] User ${userId} leave ${docId}`)
          const leavingUser = await redis.srem(`room_${docId}`, userId);
          await redis.del(socket.id);

          if (leavingUser) {
            const usersInDoc = await redis.smembers(`room_${docId}`);
            socket.broadcast.to(docId).emit('online-users', usersInDoc);
            
            if (usersInDoc.length === 0 && docChangeStreams.has(docId)) {
              docChangeStreams.get(docId).close();
              docChangeStreams.delete(docId);
              console.log(`[Socket] Closed change stream for doc ${docId}`);
            }
          }
        }

        console.log(`[Socket] ${socket.id} disconnected`);
      } catch (error) {
        console.error(`[Error] disconnect | ${socket.id}: ${error}`);
      }
    });
  })
}