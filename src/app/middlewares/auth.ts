import { NextFunction, Request, Response } from "express";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";

import config from "../config";
import { JwtPayload, Secret } from "jsonwebtoken";
import { verifyToken } from "../helpers/jwtHelpers";
import { ENUM_USER_ROLE } from "../../enums/users";

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The storefront sends "Bearer <token>"; a bare token is accepted too.
      const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }

      let verifiedUser: JwtPayload;
      try {
        verifiedUser = verifyToken(token, config.jwt_access_secret as Secret);
      } catch {
        // Bad signature or expired: a 401, not the generic 500 it used to be.
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Your session has expired. Please sign in again."
        );
      }

      req.user = verifiedUser; // role, email, id

      // check user role and access the route
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
      }
      next();
    } catch (error) {
      next(error);
    }
  };

/** Throws unless the signed-in caller is an admin or owns `email`. */
export const assertSelfOrAdmin = (
  user: JwtPayload | null,
  email: string | undefined
): void => {
  if (user?.role === ENUM_USER_ROLE.ADMIN) return;
  if (!email || String(user?.email).toLowerCase() !== email.toLowerCase()) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
  }
};

export default auth;
