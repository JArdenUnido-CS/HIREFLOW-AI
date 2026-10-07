import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  validateSignUp,
  validateLogin
} from "../src/validators/authValidator.js";

describe("Authentication Validators", () => {
  describe("validateSignUp", () => {
    it("accepts valid registration data", () => {
      const result =
        validateSignUp(
          "John",
          "Doe",
          "john@example.com",
          "password123"
        );

      assert.equal(
        result.valid,
        true
      );

      assert.equal(
        result.message,
        undefined
      );
    });

    it("rejects missing first name", () => {
      const result =
        validateSignUp(
          "",
          "Doe",
          "john@example.com",
          "password123"
        );

      assert.equal(
        result.valid,
        false
      );

      assert.equal(
        result.message,
        "First name is required."
      );
    });

    it("rejects whitespace-only first name", () => {
      const result =
        validateSignUp(
          "   ",
          "Doe",
          "john@example.com",
          "password123"
        );

      assert.equal(
        result.valid,
        false
      );
    });

    it("rejects missing last name", () => {
      const result =
        validateSignUp(
          "John",
          "",
          "john@example.com",
          "password123"
        );

      assert.equal(
        result.valid,
        false
      );

      assert.equal(
        result.message,
        "Last name is required."
      );
    });

    it("rejects whitespace-only last name", () => {
      const result =
        validateSignUp(
          "John",
          "   ",
          "john@example.com",
          "password123"
        );

      assert.equal(
        result.valid,
        false
      );
    });

    it("rejects missing email", () => {
      const result =
        validateSignUp(
          "John",
          "Doe",
          "",
          "password123"
        );

      assert.equal(
        result.valid,
        false
      );

      assert.equal(
        result.message,
        "Email is required."
      );
    });

    it("rejects invalid email format", () => {
      const result =
        validateSignUp(
          "John",
          "Doe",
          "not-an-email",
          "password123"
        );

      assert.equal(
        result.valid,
        false
      );

      assert.equal(
        result.message,
        "Invalid email address."
      );
    });

    it("accepts uppercase email addresses", () => {
      const result =
        validateSignUp(
          "John",
          "Doe",
          "JOHN@EXAMPLE.COM",
          "password123"
        );

      assert.equal(
        result.valid,
        true
      );
    });

    it("rejects missing password", () => {
      const result =
        validateSignUp(
          "John",
          "Doe",
          "john@example.com",
          ""
        );

      assert.equal(
        result.valid,
        false
      );

      assert.equal(
        result.message,
        "Password is required."
      );
    });

    it("rejects password shorter than 8 characters", () => {
      const result =
        validateSignUp(
          "John",
          "Doe",
          "john@example.com",
          "1234567"
        );

      assert.equal(
        result.valid,
        false
      );

      assert.equal(
        result.message,
        "Password must be at least 8 characters."
      );
    });

    it("accepts an 8-character password", () => {
      const result =
        validateSignUp(
          "John",
          "Doe",
          "john@example.com",
          "12345678"
        );

      assert.equal(
        result.valid,
        true
      );
    });
  });

  describe("validateLogin", () => {
    it("accepts valid login data", () => {
      const result =
        validateLogin(
          "john@example.com",
          "password123"
        );

      assert.equal(
        result.valid,
        true
      );

      assert.equal(
        result.message,
        undefined
      );
    });

    it("rejects missing email", () => {
      const result =
        validateLogin(
          "",
          "password123"
        );

      assert.equal(
        result.valid,
        false
      );

      assert.equal(
        result.message,
        "Email is required."
      );
    });

    it("rejects invalid email", () => {
      const result =
        validateLogin(
          "invalid-email",
          "password123"
        );

      assert.equal(
        result.valid,
        false
      );

      assert.equal(
        result.message,
        "Invalid email address."
      );
    });

    it("rejects missing password", () => {
      const result =
        validateLogin(
          "john@example.com",
          ""
        );

      assert.equal(
        result.valid,
        false
      );

      assert.equal(
        result.message,
        "Password is required."
      );
    });

    it("accepts password regardless of length during login validation", () => {
      const result =
        validateLogin(
          "john@example.com",
          "short"
        );

      assert.equal(
        result.valid,
        true
      );
    });
  });
});