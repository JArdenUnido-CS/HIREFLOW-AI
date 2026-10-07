import { ObjectId } from "mongodb";

export interface Session {
  _id?: ObjectId;

  accountId: ObjectId;
  tokenHash: string;

  createdAt: Date;
  expiresAt: Date;
}