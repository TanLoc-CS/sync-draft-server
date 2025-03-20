import { mongo } from "mongoose";
import { User, UserModel } from "../model";

export const getUserById = async (userId: string): Promise<User>  => {
  const user = await UserModel.findOne({ userId: userId}).exec();

  return user;
}


export const createUser = async (email: string, userId: string): Promise<User> => {
  const user = await getUserById(userId);

  if (!user) {
    console.log('creating user: ', userId, email)

    const newUser = await (new UserModel({
      _id: new mongo.ObjectId(),
      userId: userId,
      email: email,
      createdAt: new Date(),
      documents: [],
      shared: []
    }))
    .save();

    return newUser;
  }

  throw new Error('User already exists');  
}

export const addSharedIdToProfile = async (userId: string, docId: string) => {
  const addedNewShared = await UserModel.findOneAndUpdate(
    {
      userId: userId
    },
    {
      $addToSet: { shared: docId }
    },
    { new: true }
  )

  return addedNewShared;
}

export const removeSharedIdFromProfile = async (userId: string, docId: string) => {
  const removedShared = await UserModel.findOneAndUpdate(
    {
      userId: userId
    },
    {
      $pull: { shared: docId }
    },
    { new: true }
  );

  return removedShared;
};