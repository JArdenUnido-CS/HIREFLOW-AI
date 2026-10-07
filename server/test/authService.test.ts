import {
  describe,
  it,
  before,
  after
} from "node:test";

import assert from "node:assert/strict";

import {
  connectDatabase,
  getAccountsCollection,
  getSessionsCollection,
  closeDatabase
} from "../src/config/database.js";

import {
  createAccount,
  login,
  createSession,
  getAccountFromSession,
  deleteSession,
  deleteAllAccountSessions
} from "../src/services/authService.js";

import { ObjectId } from "mongodb";

describe("Authentication Service", () => {
  const testEmails: string[] = [];

  before(async () => {
    await connectDatabase();
  });

  after(async () => {
    const accounts =
      getAccountsCollection();

    const sessions =
      getSessionsCollection();

    if (testEmails.length > 0) {
      await accounts.deleteMany({
        email: {
          $in: testEmails
        }
      });
    }

    await sessions.deleteMany({});

    await closeDatabase();
  });

  describe("Account Creation", () => {
    it("creates a new account successfully", async () => {
      const email =
        `signup-${Date.now()}@example.com`;

      testEmails.push(email);

      const result =
        await createAccount({
          firstName: "John",
          lastName: "Doe",
          email,
          password: "password123"
        });

      assert.ok(
        result.account.id
      );

      assert.equal(
        result.account.firstName,
        "John"
      );

      assert.equal(
        result.account.lastName,
        "Doe"
      );

      assert.equal(
        result.account.email,
        email
      );

      assert.ok(
        result.sessionToken
      );

      assert.ok(
        result.sessionToken.length > 0
      );
    });

    it("trims first and last names", async () => {
      const email =
        `trim-${Date.now()}@example.com`;

      testEmails.push(email);

      const result =
        await createAccount({
          firstName: "  John  ",
          lastName: "  Doe  ",
          email,
          password: "password123"
        });

      assert.equal(
        result.account.firstName,
        "John"
      );

      assert.equal(
        result.account.lastName,
        "Doe"
      );
    });

    it("normalizes email to lowercase", async () => {
      const email =
        `lowercase-${Date.now()}@example.com`;

      testEmails.push(
        email.toLowerCase()
      );

      const result =
        await createAccount({
          firstName: "John",
          lastName: "Doe",
          email:
            email.toUpperCase(),
          password: "password123"
        });

      assert.equal(
        result.account.email,
        email.toLowerCase()
      );
    });

    it("does not store the plain-text password", async () => {
      const email =
        `hash-${Date.now()}@example.com`;

      testEmails.push(email);

      await createAccount({
        firstName: "John",
        lastName: "Doe",
        email,
        password: "password123"
      });

      const accounts =
        getAccountsCollection();

      const account =
        await accounts.findOne({
          email
        });

      assert.ok(account);

      assert.notEqual(
        account.passwordHash,
        "password123"
      );

      assert.ok(
        account.passwordHash.length > 0
      );
    });

    it("creates a database session after registration", async () => {
      const email =
        `session-signup-${Date.now()}@example.com`;

      testEmails.push(email);

      const result =
        await createAccount({
          firstName: "John",
          lastName: "Doe",
          email,
          password: "password123"
        });

      const accounts =
        getAccountsCollection();

      const account =
        await accounts.findOne({
          email
        });

      assert.ok(account);
      assert.ok(account._id);

      const sessions =
        getSessionsCollection();

      const session =
        await sessions.findOne({
          accountId:
            account._id
        });

      assert.ok(session);

      assert.equal(
        session?.accountId.toString(),
        account._id.toString()
      );
    });

    it("rejects duplicate email addresses", async () => {
      const email =
        `duplicate-${Date.now()}@example.com`;

      testEmails.push(email);

      await createAccount({
        firstName: "John",
        lastName: "Doe",
        email,
        password: "password123"
      });

      await assert.rejects(
        async () => {
          await createAccount({
            firstName: "Jane",
            lastName: "Doe",
            email,
            password: "different123"
          });
        },
        {
          message:
            "An account with this email already exists."
        }
      );
    });

    it("treats uppercase and lowercase emails as the same account", async () => {
      const email =
        `duplicate-case-${Date.now()}@example.com`;

      testEmails.push(email);

      await createAccount({
        firstName: "John",
        lastName: "Doe",
        email,
        password: "password123"
      });

      await assert.rejects(
        async () => {
          await createAccount({
            firstName: "Jane",
            lastName: "Doe",
            email:
              email.toUpperCase(),
            password: "password123"
          });
        },
        {
          message:
            "An account with this email already exists."
        }
      );
    });
  });

  describe("Login", () => {
    it("logs in using correct credentials", async () => {
      const email =
        `login-${Date.now()}@example.com`;

      testEmails.push(email);

      await createAccount({
        firstName: "Login",
        lastName: "User",
        email,
        password: "password123"
      });

      const result =
        await login(
          email,
          "password123"
        );

      assert.equal(
        result.account.email,
        email
      );

      assert.equal(
        result.account.firstName,
        "Login"
      );

      assert.equal(
        result.account.lastName,
        "User"
      );

      assert.ok(
        result.sessionToken
      );
    });

    it("rejects an incorrect password", async () => {
      const email =
        `wrong-password-${Date.now()}@example.com`;

      testEmails.push(email);

      await createAccount({
        firstName: "Wrong",
        lastName: "Password",
        email,
        password: "correct123"
      });

      await assert.rejects(
        async () => {
          await login(
            email,
            "wrong123"
          );
        },
        {
          message:
            "Invalid email or password."
        }
      );
    });

    it("rejects an unknown email", async () => {
      const email =
        `unknown-${Date.now()}@example.com`;

      await assert.rejects(
        async () => {
          await login(
            email,
            "password123"
          );
        },
        {
          message:
            "Invalid email or password."
        }
      );
    });

    it("allows login with uppercase email", async () => {
      const email =
        `uppercase-login-${Date.now()}@example.com`;

      testEmails.push(email);

      await createAccount({
        firstName: "Upper",
        lastName: "Case",
        email,
        password: "password123"
      });

      const result =
        await login(
          email.toUpperCase(),
          "password123"
        );

      assert.equal(
        result.account.email,
        email
      );
    });

    it("creates a new session for every successful login", async () => {
      const email =
        `multiple-session-${Date.now()}@example.com`;

      testEmails.push(email);

      const registration =
        await createAccount({
          firstName: "Multiple",
          lastName: "Session",
          email,
          password: "password123"
        });

      const loginResult =
        await login(
          email,
          "password123"
        );

      assert.notEqual(
        registration.sessionToken,
        loginResult.sessionToken
      );

      const accounts =
        getAccountsCollection();

      const account =
        await accounts.findOne({
          email
        });

      assert.ok(account);
      assert.ok(account._id);

      const sessions =
        getSessionsCollection();

      const sessionsForAccount =
        await sessions
          .find({
            accountId:
              account._id
          })
          .toArray();

      assert.ok(
        sessionsForAccount.length >= 2
      );
    });
  });

  describe("Login Sessions", () => {
    it("creates a session with a valid token", async () => {
      const email =
        `valid-session-${Date.now()}@example.com`;

      testEmails.push(email);

      const registration =
        await createAccount({
          firstName: "Session",
          lastName: "User",
          email,
          password: "password123"
        });

      const account =
        await getAccountsCollection()
          .findOne({
            email
          });

      assert.ok(account);
      assert.ok(account._id);

      const foundAccount =
        await getAccountFromSession(
          registration.sessionToken
        );

      assert.ok(foundAccount);

      assert.equal(
        foundAccount.email,
        email
      );

      assert.equal(
        foundAccount.firstName,
        "Session"
      );
    });

    it("rejects an invalid session token", async () => {
      const result =
        await getAccountFromSession(
          "invalid-session-token"
        );

      assert.equal(
        result,
        null
      );
    });

    it("deletes a session successfully", async () => {
      const email =
        `delete-session-${Date.now()}@example.com`;

      testEmails.push(email);

      const result =
        await createAccount({
          firstName: "Delete",
          lastName: "Session",
          email,
          password: "password123"
        });

      const beforeDelete =
        await getAccountFromSession(
          result.sessionToken
        );

      assert.ok(
        beforeDelete
      );

      await deleteSession(
        result.sessionToken
      );

      const afterDelete =
        await getAccountFromSession(
          result.sessionToken
        );

      assert.equal(
        afterDelete,
        null
      );
    });

    it("deletes all sessions belonging to an account", async () => {
      const email =
        `delete-all-${Date.now()}@example.com`;

      testEmails.push(email);

      const registration =
        await createAccount({
          firstName: "Delete",
          lastName: "All",
          email,
          password: "password123"
        });

      const loginResult =
        await login(
          email,
          "password123"
        );

      const account =
        await getAccountsCollection()
          .findOne({
            email
          });

      assert.ok(account);
      assert.ok(account._id);

      await deleteAllAccountSessions(
        account._id
      );

      const firstSession =
        await getAccountFromSession(
          registration.sessionToken
        );

      const secondSession =
        await getAccountFromSession(
          loginResult.sessionToken
        );

      assert.equal(
        firstSession,
        null
      );

      assert.equal(
        secondSession,
        null
      );
    });

    it("stores only a hashed session token", async () => {
      const email =
        `hashed-session-${Date.now()}@example.com`;

      testEmails.push(email);

      const result =
        await createAccount({
          firstName: "Hashed",
          lastName: "Session",
          email,
          password: "password123"
        });

      const sessions =
        getSessionsCollection();

      const account =
        await getAccountsCollection()
          .findOne({
            email
          });

      assert.ok(account);
      assert.ok(account._id);

      const session =
        await sessions.findOne({
          accountId:
            account._id
        });

      assert.ok(session);

      assert.notEqual(
        session.tokenHash,
        result.sessionToken
      );

      assert.equal(
        session.tokenHash.length,
        64
      );
    });
  });
});