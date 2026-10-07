import { ObjectId } from "mongodb";

export interface Account {
  _id?: ObjectId;

  firstName: string;
  lastName: string;
  email: string;

  passwordHash: string;

  createdAt: Date;
  updatedAt: Date;
}