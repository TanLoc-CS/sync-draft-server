import { Schema, model, Types } from 'mongoose';

export interface User {
  _id?: Types.ObjectId,
  userId: string,
  email: string,
  createdAt: string,
  documents: string[],
  shared: string[]
}

export const UserSchema = new Schema<User>({
  _id: Types.ObjectId,
  userId: String,
  email: String,
  createdAt: String,
  documents: [String],
  shared: [String]
})

export const UserModel = model<User>('user', UserSchema);