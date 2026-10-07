import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import {
  getAccountsCollection,
  getSessionsCollection
} from "../config/database.js";

import { Account } from "../models/Account.js";
import { Session } from "../models/Session.js";

const SESSION_DURATION_DAYS =
  Number(
    process.env.SESSION_DURATION_DAYS ?? 7
  );

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthenticatedAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginResult {
  account: AuthenticatedAccount;
  sessionToken: string;
}

function normalizeEmail(
  email: string
): string {
  return email.trim().toLowerCase();
}

function generateSessionToken(): string {
  return crypto
    .randomBytes(32)
    .toString("hex");
}

function hashSessionToken(
  token: string
): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function getSessionExpiration(): Date {
  const expiration = new Date();

  expiration.setDate(
    expiration.getDate() +
      SESSION_DURATION_DAYS
  );

  return expiration;
}

function accountResponse(
  account: Account
): AuthenticatedAccount {
  if (!account._id) {
    throw new Error(
      "Account does not have a valid ID."
    );
  }

  return {
    id: account._id.toString(),
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email
  };
}

export async function createAccount(
  data: SignUpData
): Promise<LoginResult> {
  const accounts =
    getAccountsCollection();

  const email =
    normalizeEmail(data.email);

  const existingAccount =
    await accounts.findOne({
      email
    });

  if (existingAccount) {
    throw new Error(
      "An account with this email already exists."
    );
  }

  const passwordHash =
    await bcrypt.hash(
      data.password,
      12
    );

  const now = new Date();

  const account: Account = {
    firstName:
      data.firstName.trim(),

    lastName:
      data.lastName.trim(),

    email,

    passwordHash,

    createdAt: now,
    updatedAt: now
  };

  const result =
    await accounts.insertOne(
      account
    );

  const sessionToken =
    await createSession(
      result.insertedId
    );

  return {
    account:
      accountResponse({
        ...account,
        _id: result.insertedId
      }),

    sessionToken
  };
}

export async function login(
  emailInput: string,
  password: string
): Promise<LoginResult> {
  const accounts =
    getAccountsCollection();

  const email =
    normalizeEmail(emailInput);

  const account =
    await accounts.findOne({
      email
    });

  if (!account) {
    throw new Error(
      "Invalid email or password."
    );
  }

  const passwordMatches =
    await bcrypt.compare(
      password,
      account.passwordHash
    );

  if (!passwordMatches) {
    throw new Error(
      "Invalid email or password."
    );
  }

  if (!account._id) {
    throw new Error(
      "Account does not have a valid ID."
    );
  }

  const sessionToken =
    await createSession(
      account._id
    );

  return {
    account:
      accountResponse(account),

    sessionToken
  };
}

export async function createSession(
  accountId: ObjectId
): Promise<string> {
  const sessions =
    getSessionsCollection();

  const sessionToken =
    generateSessionToken();

  const tokenHash =
    hashSessionToken(
      sessionToken
    );

  const now = new Date();

  const session: Session = {
    accountId,
    tokenHash,
    createdAt: now,
    expiresAt:
      getSessionExpiration()
  };

  await sessions.insertOne(
    session
  );

  return sessionToken;
}

export async function getAccountFromSession(
  sessionToken: string
): Promise<Account | null> {
  const sessions =
    getSessionsCollection();

  const accounts =
    getAccountsCollection();

  const tokenHash =
    hashSessionToken(
      sessionToken
    );

  const session =
    await sessions.findOne({
      tokenHash
    });

  if (!session) {
    return null;
  }

  if (
    session.expiresAt <=
    new Date()
  ) {
    await sessions.deleteOne({
      _id: session._id
    });

    return null;
  }

  return accounts.findOne({
    _id: session.accountId
  });
}

export async function deleteSession(
  sessionToken: string
): Promise<void> {
  const sessions =
    getSessionsCollection();

  const tokenHash =
    hashSessionToken(
      sessionToken
    );

  await sessions.deleteOne({
    tokenHash
  });
}

export async function deleteAllAccountSessions(
  accountId: ObjectId
): Promise<void> {
  const sessions =
    getSessionsCollection();

  await sessions.deleteMany({
    accountId
  });
}