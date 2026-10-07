import {
  MongoClient,
  Db,
  Collection
} from "mongodb";

import dotenv from "dotenv";

import { Account } from "../models/Account.js";
import { Session } from "../models/Session.js";

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error(
    "MONGODB_URI is not defined in the .env file."
  );
}

const databaseName =
  process.env.MONGODB_DATABASE ??
  "hireflow_ai";

const client = new MongoClient(mongoUri);

let database: Db | null = null;

export async function connectDatabase(): Promise<void> {
  await client.connect();

  database = client.db(databaseName);

  await database.command({
    ping: 1
  });

  console.log(
    `Connected to MongoDB database: ${databaseName}`
  );

  await createIndexes();
}

export function getDatabase(): Db {
  if (!database) {
    throw new Error(
      "Database has not been initialized."
    );
  }

  return database;
}

export function getAccountsCollection(): Collection<Account> {
  return getDatabase().collection<Account>(
    "accounts"
  );
}

export function getSessionsCollection(): Collection<Session> {
  return getDatabase().collection<Session>(
    "sessions"
  );
}

async function createIndexes(): Promise<void> {
  const accounts =
    getAccountsCollection();

  const sessions =
    getSessionsCollection();

  await accounts.createIndex(
    {
      email: 1
    },
    {
      unique: true
    }
  );

  await sessions.createIndex(
    {
      tokenHash: 1
    },
    {
      unique: true
    }
  );

  await sessions.createIndex(
    {
      expiresAt: 1
    },
    {
      expireAfterSeconds: 0
    }
  );
}

export async function closeDatabase(): Promise<void> {
  await client.close();

  database = null;
}