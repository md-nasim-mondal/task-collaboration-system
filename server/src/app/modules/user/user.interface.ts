import { Types } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  PROJECT_MANAGER = "PROJECT_MANAGER",
  TEAM_MEMBER = "TEAM_MEMBER",
}

//auth providers
/**
 * email, password
 * google authentication
 */

export interface IAuthProvider {
  provider: "google" | "credentials"; // "Google", "Credential"
  providerId: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isDeleted: boolean;
  isActive: IsActive;
  isVerified: boolean;
  role: Role;
  auths: IAuthProvider[];
  verificationCode?: string;
  verificationCodeExpires?: Date;
  passwordResetCode?: string;
  passwordResetCodeExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
