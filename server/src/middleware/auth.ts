import type { NextFunction, Request, Response } from "express";

import { AppError } from "./error-handler";
import { verifyToken, type JwtPayload } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return next(new AppError(401, "Not authenticated"));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired session"));
  }
}

/**
 * Must run after `requireAuth` — relies on `req.user` already being set.
 * Trusts the role embedded in the JWT rather than re-querying the DB on
 * every request (stateless, keeps authorization checks cheap).
 */
export function requireRole(...roles: JwtPayload["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "You do not have permission to perform this action"));
    }

    next();
  };
}

export function protect(...roles: JwtPayload["role"][]) {
  return [requireAuth, requireRole(...roles)];
}
