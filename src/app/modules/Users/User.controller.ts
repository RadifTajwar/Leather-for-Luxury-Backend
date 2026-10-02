import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse ";
import { Request, Response } from "express";
import { UserService } from "./Users.service";
import ApiError from "../../errors/ApiError";
import config from "../../config";
import { createToken } from "../../helpers/jwtHelpers";
import { assertSelfOrAdmin } from "../../middlewares/auth";
import pick from "../../shared/pick";

/** The only fields a profile update may touch: never role, email or password. */
const PROFILE_FIELDS = ["name", "phone", "shippingAddress", "location"];

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await UserService.createUSer(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Created successfully",
    data: result,
  });
});
export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  // Extract user ID from request parameters and update payload from request body
  const { code } = req.body;
  // Only the signed-in account's own code counts (auth() runs first).
  const updatedUser = await UserService.verifyEmailService(code, req.user?.email);

  // If no user is found, throw an error
  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Reissue the access token so the caller's session reflects isVerified right
  // away. Without it the old token keeps saying "unverified" until it expires
  // and the prompt never goes away.
  const accessToken = createToken(
    {
      id: String((updatedUser as any)._id ?? updatedUser.id),
      email: updatedUser.email,
      role: updatedUser.role,
      isVerified: true,
    },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  // Send a successful response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User verify successfully",
    data: { user: updatedUser, accessToken },
  });
});

export const resendVerification = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email is required");
    }
    await UserService.resendVerification(email);

    // Byte-identical answer whether or not the account exists or is already
    // verified, so this cannot be used to enumerate registered addresses.
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "If that address needs verifying, a new code is on its way",
      data: null,
    });
  }
);

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new ApiError(httpStatus.BAD_REQUEST, "Email is required");

  await UserService.requestPasswordReset(email);

  // Byte-identical answer whether or not the account exists. Returning the
  // service's { sent } would give it away just as plainly as a different
  // message would.
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "If an account exists for that address, a reset code is on its way",
    data: null,
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email, code and new password are required");
  }

  await UserService.resetPassword(email, code, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your password has been changed. You can sign in with it now.",
    data: null,
  });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.getUserById(req.params.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  assertSelfOrAdmin(req.user, user.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

export const getUserByEmail = catchAsync(async (req: Request, res: Response) => {
  assertSelfOrAdmin(req.user, req.params.email);
  const user = await UserService.getUserByEmail(req.params.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

export const updateUSerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params; // Extract ID from request parameters

    const target = await UserService.getUserById(id);
    if (!target) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    assertSelfOrAdmin(req.user, target.email);
    const updateData = pick(req.body, PROFILE_FIELDS);

    // Perform the update operation
    const updatedCategory = await UserService.updateUSerProfile(id, updateData);

    // Handle case where the category is not found
    if (!updatedCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Send a successful response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User updated successfully",
      data: updatedCategory,
    });
  }
);

export const USerController = {
  createUser,
  updateUSerProfile,
  verifyEmail,
  resendVerification,
  getUserById,
  getUserByEmail,
  forgotPassword,
  resetPassword,
};
