import httpStatus from "http-status";
import { User } from "../Users/Users.model";
import {
  IChangePassword,
  ILoginUserResponse,
  IRefreshTokenResponse,
  TLoginUser,
} from "./Auth.interface";
import ApiError from "../../errors/ApiError";
import { createToken, verifyToken } from "../../helpers/jwtHelpers";
import config from "../../config";
import { JwtPayload, Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";

const loginUser = async (payload: TLoginUser): Promise<ILoginUserResponse> => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found !");
  }

  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new ApiError(httpStatus.FORBIDDEN, "Password do not matched");

  //create token and sent to the  client

  const jwtPayload = {
    id: String((user as any)._id ?? user.id),
    email: user.email,
    role: user.role,
    // Lets the storefront show the "verify your email" prompt without an extra
    // round trip. Tokens issued before this field existed simply omit it.
    isVerified: Boolean(user.isVerified),
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  // Loaded with +password for the comparison above; never send the hash back.
  (user as any).password = undefined;

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  //verify token
  // invalid token - synchronous
  let verifiedToken = null;
  try {
    verifiedToken = verifyToken(token, config.jwt_access_secret as Secret);
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid Refresh Token");
  }

  const { email } = verifiedToken;

  const isUserExist = await User.isUserExistsByEmail(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
  }
  //generate new token

  const newAccessToken = createToken(
    {
      email: isUserExist.id,
      role: "user",
    },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  user: JwtPayload | null,
  payload: IChangePassword
): Promise<void> => {
  const { oldPassword, newPassword } = payload;

  // checking if the user is exist
  const UserExists = await User.isUserExistsByEmail(user?.email);

  if (!UserExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found !");
  }
  if (
    UserExists.password &&
    !(await User.isPasswordMatched(oldPassword, UserExists.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Old Password is incorrect");
  }

  // hash password before saving
  const newHashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bycrypt_salt_rounds)
  );

  const query = { email: user?.email };
  const updatedData = {
    password: newHashedPassword, //
    // needsPasswordChange: false,
    // passwordChangedAt: new Date(), //
  };

  await User.findOneAndUpdate(query, updatedData);
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
  // forgotPass,
  // resetPassword
};
