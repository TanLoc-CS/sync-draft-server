import { mongo, Types } from "mongoose";
import { Merge, MergeModel } from "../model";

export const getMergesByDocId = async (docId: Types.ObjectId | string): Promise<Merge[]> => {
  const merges = await MergeModel.find({ docId: docId }).exec();

  return merges;
}

export const createMerge = async (data: Merge): Promise<Merge> => {
  const newMerge = await (new MergeModel({
    _id: new mongo.ObjectId(),
    docId: data.docId,
    mergedBy: data.mergedBy,
    before: data.before,
    after: data.after,
    mergedAt: new Date(),
    description: data.description
  }))
  .save();

  return newMerge;
}