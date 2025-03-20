import { Document, DocumentModel, UserModel } from "../model";
import { mongo, Types } from "mongoose";

export const getDocumentsbyUserId = async (userId: string): Promise<Document[]> => {
  const documents = await DocumentModel.find({ ownerId: userId }).exec();

  return documents;
};

export const getDocumentById = async (docId: Types.ObjectId | string): Promise<Document> => {
  const document = await DocumentModel.findById(docId).exec();
  
  if (!document) {
    throw new Error('Document not found!');
  }

  return document;
};

export const createDocument = async (userId: string): Promise<Document> => {
  const date = new Date();

  const newDoc = await (new DocumentModel({
    _id: new mongo.ObjectId(),
    ownerId: userId,
    title: 'Untitled',
    content: null,
    createdAt: date,
    updatedAt: date,
    merges: []
  }))
  .save();

  // Add docId to their profile
  await UserModel.findOneAndUpdate(
    {
      userId : userId
    },
    {
      $addToSet: { documents: newDoc._id }
    },
    { new: true }
  )

  return newDoc;
}

export const deleteDocumentById = async (docId: Types.ObjectId | string): Promise<void> => {
  const result = await DocumentModel.findByIdAndDelete(docId);

  if (!result) {
    throw new Error('Document not found!')
  }
}

export const updateDocument= async (docId: Types.ObjectId | string, content: string): Promise<Document> => {
  const updatedDoc = await DocumentModel.findByIdAndUpdate(
    docId,
    {
      content: content,
      updatedAt: new Date()
    },
    { new: true }
  ).exec();

  if (!updatedDoc) {
    throw new Error('Document not found!');
  }

  return updatedDoc;
}

export const updateDocumentTitle = async (docId: Types.ObjectId | string, newTitle: string): Promise<Document> => {
  const updatedDoc = await DocumentModel.findByIdAndUpdate(
    docId,
    {
      title: newTitle,
      updatedAt: new Date()
    },
    { new: true }
  ).exec();

  if (!updatedDoc) {
    throw new Error('Document not found!');
  }

  return updatedDoc;
}


export const addMergeId = async (docId: Types.ObjectId | string, mergeId: Types.ObjectId | string): Promise<Document> => {
  const addedDoc = await DocumentModel.findByIdAndUpdate(
    docId,
    {
      $addToSet: { merges: docId },
      updatedAt: new Date()
    },
    { new: true }
  ).exec();

  if (!addedDoc) {
    throw new Error('Document not found!');
  }

  return addedDoc;
}