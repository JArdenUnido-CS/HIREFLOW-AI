import {
  Router,
  Request,
  Response
} from "express";

import {
  createAccount,
  login,
  deleteSession
} from "../services/authService.js";

import {
  validateSignUp,
  validateLogin
} from "../validators/authValidator.js";

import { serialize } from "cookie";

const router = Router();

const SESSION_COOKIE_NAME =
  "sessionToken";

const SESSION_DURATION_DAYS =
  Number(
    process.env.SESSION_DURATION_DAYS ?? 7
  );

const SESSION_MAX_AGE =
  SESSION_DURATION_DAYS *
  24 *
  60 *
  60;

function setSessionCookie(
  res: Response,
  sessionToken: string
): void {
  res.setHeader(
    "Set-Cookie",
    serialize(
      SESSION_COOKIE_NAME,
      sessionToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/"
      }
    )
  );
}

function clearSessionCookie(
  res: Response
): void {
  res.setHeader(
    "Set-Cookie",
    serialize(
      SESSION_COOKIE_NAME,
      "",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/"
      }
    )
  );
}

/*
 * SIGN UP
 *
 * Creates a new account and
 * automatically creates a session.
 */
router.post(
  "/register",
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        firstName,
        lastName,
        email,
        password
      } = req.body;

      const validation =
        validateSignUp(
          firstName,
          lastName,
          email,
          password
        );

      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message:
            validation.message
        });

        return;
      }

      const result =
        await createAccount({
          firstName,
          lastName,
          email,
          password
        });

      setSessionCookie(
        res,
        result.sessionToken
      );

      res.status(201).json({
        success: true,
        message:
          "Account created successfully.",
        account:
          result.account
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "An account with this email already exists."
      ) {
        res.status(409).json({
          success: false,
          message:
            error.message
        });

        return;
      }

      res.status(500).json({
        success: false,
        message:
          "Unable to create account."
      });
    }
  }
);

/*
 * LOGIN
 *
 * Validates credentials and
 * creates a new login session.
 */
router.post(
  "/login",
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        email,
        password
      } = req.body;

      const validation =
        validateLogin(
          email,
          password
        );

      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message:
            validation.message
        });

        return;
      }

      const result =
        await login(
          email,
          password
        );

      setSessionCookie(
        res,
        result.sessionToken
      );

      res.status(200).json({
        success: true,
        message:
          "Login successful.",
        account:
          result.account
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "Invalid email or password."
      ) {
        res.status(401).json({
          success: false,
          message:
            "Invalid email or password."
        });

        return;
      }

      res.status(500).json({
        success: false,
        message:
          "Unable to log in."
      });
    }
  }
);

/*
 * LOGOUT
 *
 * Deletes the current session
 * from MongoDB.
 */
router.post(
  "/logout",
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const cookieHeader =
        req.headers.cookie ?? "";

      const sessionCookie =
        cookieHeader
          .split(";")
          .map(
            (cookie) =>
              cookie.trim()
          )
          .find(
            (cookie) =>
              cookie.startsWith(
                `${SESSION_COOKIE_NAME}=`
              )
          );

      if (sessionCookie) {
        const sessionToken =
          sessionCookie.substring(
            SESSION_COOKIE_NAME
              .length + 1
          );

        if (sessionToken) {
          await deleteSession(
            sessionToken
          );
        }
      }

      clearSessionCookie(res);

      res.status(200).json({
        success: true,
        message:
          "Logged out successfully."
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to log out."
      });
    }
  }
);

export {
  router as authRouter
};