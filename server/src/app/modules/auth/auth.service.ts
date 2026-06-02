import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { sendEmail } from "../../utils/sendEmail";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";
import { ms } from "../../utils/ms";
import { IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User with this email does not exist");
  }

  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted");
  }

  if (isUserExist.isActive !== IsActive.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, `This user is ${isUserExist.isActive}`);
  }

  if (!isUserExist.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This account was created using social login. Please login with Google or set a password first."
    );
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const userTokens = createUserTokens(isUserExist);

  const user = isUserExist.toObject();
  const { password: _, ...userWithoutPassword } = user;

  return {
    ...userTokens,
    user: userWithoutPassword,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);
  if (!user || !user.password) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found or password not set");
  }

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user.password
  );
  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not match");
  }

  user.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  await user.save();
};

const resetPassword = async (
  payload: Record<string, unknown>,
  decodedToken: JwtPayload
) => {
  if (payload.id !== decodedToken.userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You cannot reset this password!");
  }
  const isUserExist = await User.findById(decodedToken.userId);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
  }

  if (payload.code !== isUserExist.passwordResetCode) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid reset code");
  }

  if (
    isUserExist.passwordResetCodeExpires &&
    new Date() > isUserExist.passwordResetCodeExpires
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Reset code expired");
  }

  isUserExist.password = await bcryptjs.hash(
    payload.newPassword as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  isUserExist.passwordResetCode = undefined;
  isUserExist.passwordResetCodeExpires = undefined;

  await isUserExist.save();
};

const setPassword = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (user.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password already set. Please use change password instead."
    );
  }

  user.password = await bcryptjs.hash(
    plainPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  await user.save();
};

const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }

  if (isUserExist.isDeleted || isUserExist.isActive !== IsActive.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: envVars.RESET_PASS_EXPIRES as jwt.SignOptions["expiresIn"],
  });

  const passwordResetCode = Math.floor(1000 + Math.random() * 9000).toString();
  const passwordResetCodeExpires = new Date(
    Date.now() + ms(envVars.RESET_PASS_EXPIRES)
  );

  isUserExist.passwordResetCode = passwordResetCode;
  isUserExist.passwordResetCodeExpires = passwordResetCodeExpires;
  await isUserExist.save();

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

  await sendEmail({
    to: isUserExist.email,
    subject: "Password Reset",
    templateName: "forgetPassword",
    templateData: {
      name: isUserExist.name,
      resetUILink,
      code: passwordResetCode,
    },
  });
};

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  changePassword,
  resetPassword,
  setPassword,
  forgotPassword,
};
