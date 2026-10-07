import {
  Request,
  Response,
  NextFunction
} from "express";

import { parse } from "cookie";

import { Account } from "../models/Account.js";

import {
  getAccountFromSession
} from "../services/authService.js";

declare global {
  namespace Express {
    interface Request {
      account?: Account;
      sessionToken?: string;
    }
  }
}

export async function requireAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cookies =
      parse(
        req.headers.cookie ?? ""
      );

    const sessionToken =
      cookies.sessionToken;

    if (!sessionToken) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required."
      });

      return;
    }

    const account =
      await getAccountFromSession(
        sessionToken
      );

    if (!account) {
      res.status(401).json({
        success: false,
        message:
          "Invalid or expired session."
      });

      return;
    }

    req.account = account;
    req.sessionToken =
      sessionToken;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Authentication failed."
    });
  }
}