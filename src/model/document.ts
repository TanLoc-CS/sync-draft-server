import { Schema, model, Types } from 'mongoose';

export interface Document {
  _id?: Types.ObjectId,
  ownerId: string,
  title: string,
  content: string,
  createdAt: Date,
  updatedAt: Date,
  merges: Types.ObjectId[]
}

export const DocumentSchema = new Schema<Document>({
  _id: Types.ObjectId,
  ownerId: String,
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  merges: [Types.ObjectId]
})

export const DocumentModel = model<Document>('document', DocumentSchema);