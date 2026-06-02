import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { IsActive, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) {
        throw new AppError(httpStatus.UNAUTHORIZED, "No token provided");
      }

      // Handle both "Bearer <token>" and raw token formats
      let token = authorizationHeader;
      if (authorizationHeader.startsWith("Bearer ")) {
        token = authorizationHeader.split(" ")[1];
      }

      let userPayload: JwtPayload;
      try {
        userPayload = verifyToken(token, envVars.JWT_ACCESS_SECRET) as JwtPayload;
      } catch (_err) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
      }

      if (!userPayload || !userPayload.userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
      }

      // Check if user exists and is active
      const isUserExist = await User.findById(userPayload.userId);

      if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "User is deleted");
      }

      if (isUserExist.isActive !== IsActive.ACTIVE) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `User account is ${isUserExist.isActive}`
        );
      }

      // Role authorization
      if (authRoles.length > 0 && !authRoles.includes(isUserExist.role as Role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You do not have permission to access this resource"
        );
      }

      // Attach user payload to request
      req.user = {
        userId: isUserExist._id?.toString() as string,
        email: isUserExist.email,
        role: isUserExist.role as Role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
