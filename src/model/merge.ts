import { Schema, model, Types } from 'mongoose';

export interface Merge {
  _id?: Types.ObjectId,
  docId: string,
  mergedBy: string,
  before: string,
  after: string,
  mergedAt?: Date,
  description: string,
}

export const MergeSchema = new Schema<Merge>({
  _id: Types.ObjectId,
  docId: String,
  mergedBy: String,
  before: String,
  after: String,
  mergedAt: { type: Date, default: Date.now },
  description: String
})

export const MergeModel = model<Merge>('merge', MergeSchema);