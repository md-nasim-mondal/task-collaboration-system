import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { sendEmail } from "../../utils/sendEmail";
import { ms } from "../../utils/ms";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const verificationCodeExpires = new Date(Date.now() + ms(envVars.OTP_EXPIRES));

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    verificationCode,
    verificationCodeExpires,
    ...rest,
  });

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    templateName: "verifyEmail",
    templateData: {
      name: user.name,
      code: verificationCode,
    },
  });

  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (decodedToken.role === Role.TEAM_MEMBER) {
    if (userId !== decodedToken.userId) {
      throw new AppError(401, "You are not authorized!");
    }
  }

  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  /**
   * email - can not update
   * name, phone, password address
   * password - re hashing
   * only admin - role, isDeleted...
   */

  if (payload.role) {
    if (decodedToken.role !== Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role !== Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    data,
    meta,
  };
};

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user,
  };
};
const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const verifyEmail = async (email: string, code: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is already verified");
  }

  if (user.verificationCode !== code) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid verification code");
  }

  if (
    user.verificationCodeExpires &&
    new Date() > user.verificationCodeExpires
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Verification code expired");
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  return user;
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
  getSingleUser,
  getMe,
  verifyEmail,
};
