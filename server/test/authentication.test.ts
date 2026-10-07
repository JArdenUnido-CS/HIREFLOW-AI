import {
  describe,
  it,
  before,
  after
} from "node:test";

import assert from "node:assert/strict";

import express from "express";
import http from "node:http";

import {
  connectDatabase,
  getAccountsCollection,
  closeDatabase
} from "../src/config/database.js";

import {
  createAccount
} from "../src/services/authService.js";

import {
  requireAuthentication
} from "../src/middleware/authentication.js";

describe("Authentication Middleware", () => {
  let server: http.Server;
  let baseUrl: string;

  const testEmails: string[] = [];

  before(async () => {
    await connectDatabase();

    const app =
      express();

    app.get(
      "/protected",
      requireAuthentication,
      (req, res) => {
        res.status(200).json({
          success: true,
          account: {
            id:
              req.account?._id?.toString(),
            firstName:
              req.account?.firstName,
            lastName:
              req.account?.lastName,
            email:
              req.account?.email
          }
        });
      }
    );

    server =
      await new Promise(
        (resolve) => {
          const createdServer =
            app.listen(
              0,
              () => {
                resolve(
                  createdServer
                );
              }
            );
        }
      );

    const address =
      server.address();

    if (
      !address ||
      typeof address ===
        "string"
    ) {
      throw new Error(
        "Unable to determine test server address."
      );
    }

    baseUrl =
      `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    const accounts =
      getAccountsCollection();

    if (testEmails.length > 0) {
      await accounts.deleteMany({
        email: {
          $in: testEmails
        }
      });
    }

    await new Promise<void>(
      (resolve, reject) => {
        server.close(
          (error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          }
        );
      }
    );

    await closeDatabase();
  });

  it("rejects requests without a session cookie", async () => {
    const response =
      await fetch(
        `${baseUrl}/protected`
      );

    assert.equal(
      response.status,
      401
    );

    const body =
      await response.json();

    assert.equal(
      body.success,
      false
    );

    assert.equal(
      body.message,
      "Authentication required."
    );
  });

  it("rejects an invalid session cookie", async () => {
    const response =
      await fetch(
        `${baseUrl}/protected`,
        {
          headers: {
            Cookie:
              "sessionToken=invalid-session-token"
          }
        }
      );

    assert.equal(
      response.status,
      401
    );

    const body =
      await response.json();

    assert.equal(
      body.success,
      false
    );

    assert.equal(
      body.message,
      "Invalid or expired session."
    );
  });

  it("allows access with a valid session cookie", async () => {
    const email =
      `middleware-${Date.now()}@example.com`;

    testEmails.push(email);

    const result =
      await createAccount({
        firstName: "Middleware",
        lastName: "User",
        email,
        password: "password123"
      });

    const response =
      await fetch(
        `${baseUrl}/protected`,
        {
          headers: {
            Cookie:
              `sessionToken=${result.sessionToken}`
          }
        }
      );

    assert.equal(
      response.status,
      200
    );

    const body =
      await response.json();

    assert.equal(
      body.success,
      true
    );

    assert.equal(
      body.account.email,
      email
    );

    assert.equal(
      body.account.firstName,
      "Middleware"
    );

    assert.equal(
      body.account.lastName,
      "User"
    );
  });
});