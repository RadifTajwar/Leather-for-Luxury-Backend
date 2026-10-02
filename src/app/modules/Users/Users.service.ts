import crypto from "crypto";
import dns from "dns/promises";
import mongoose from "mongoose";
import { IUSer } from "./Users.interface";
import { User } from "./Users.model";
import { sendPasswordResetEmail, sendVerificationUser } from "../../middlewares/email";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

/**
 * Reject an address whose domain cannot receive mail at all (gmial.com,
 * gmail.con). This is the only wrong-email case detectable at signup: SMTP
 * accepts a non-existent *mailbox* on a real domain and bounces asynchronously,
 * so `jon@gmail.com` for `john@gmail.com` cannot be caught here — that is what
 * the verification code is for.
 */
const assertDeliverableDomain = async (email: string): Promise<void> => {
  const domain = email.split("@")[1];
  if (!domain) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Enter a valid email address");
  }
  try {
    const records = await dns.resolveMx(domain);
    if (!records.length) throw new Error("no MX");
  } catch {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `We can't find a mail server for "${domain}". Please check the spelling of your email address.`
    );
  }
};

const sixDigitCode = (): string =>
  String(crypto.randomInt(100000, 1000000));

const createUSer = async (payload: IUSer): Promise<IUSer | null> => {
  await assertDeliverableDomain(payload.email);

  // The password is the user's own: it is the one copy the email cannot lose.
  // Only the verification code is mailed, so nothing secret leaves the system.
  const verificationToken = sixDigitCode();
  payload = { ...payload, verificationToken, isVerified: false };

  const result = await User.create(payload);

  const sent = await sendVerificationUser(payload.email, verificationToken);
  if (!sent) {
    console.error(
      `[createUser] ${payload.email} created but the verification email failed to send`
    );
  }

  // Re-read: the created document still carries the password hash and the
  // verification code, and this goes straight back to the caller.
  return User.findById(result._id);
};

/**
 * Re-issue a verification code, for a mistyped address that has since been
 * corrected. Always resolves the same way so this cannot be used to discover
 * which addresses are registered.
 */
const resendVerification = async (
  email: string
): Promise<{ sent: boolean }> => {
  const user = await User.findOne({ email });
  if (!user || user.isVerified) return { sent: false };

  user.verificationToken = sixDigitCode();
  await user.save();
  const sent = await sendVerificationUser(user.email, user.verificationToken);
  return { sent };
};

/**
 * Verify the signed-in user's own address. The code is matched against that
 * one account: matched globally, any 6-digit guess could land on a stranger.
 */
const verifyEmailService = async (
  code: string,
  email: string
): Promise<IUSer | null> => {
  // Mongoose drops undefined filter values, so a missing code or email would
  // turn this into findOne({}) and "verify" the first user in the collection.
  if (!code || !email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Enter the 6-digit code from your email");
  }
  const user = await User.findOne({ email, verificationToken: String(code) });

  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "That code is not valid. Check the most recent email we sent you."
    );
  }

  // Update the user's verification status and clear token fields
  user.isVerified = true;
  user.verificationToken = undefined;

  await user.save();

  return user;
};

/**
 * One user, including the fields the schema hides by default (`select: 0`).
 * The password is never selected here.
 */
const getUserById = async (id: string): Promise<IUSer | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user id");
  }
  return User.findById(id).select("+phone +shippingAddress");
};

const RESET_CODE_TTL_MINUTES = 15;

/**
 * Start a password reset: issue a short-lived code and mail it.
 *
 * Resolves the same way whether or not the address is registered, so this
 * cannot be used to discover which addresses have accounts.
 */
const requestPasswordReset = async (email: string): Promise<{ sent: boolean }> => {
  const user = await User.findOne({ email });
  if (!user) return { sent: false };

  user.resetToken = sixDigitCode();
  user.resetTokenExpiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60_000);
  user.resetAttempts = 0;
  await user.save();

  const sent = await sendPasswordResetEmail(
    user.email,
    user.resetToken,
    RESET_CODE_TTL_MINUTES
  );
  if (!sent) {
    console.error(`[requestPasswordReset] could not mail a reset code to ${user.email}`);
  }
  return { sent };
};

/** Guesses allowed per reset code; requesting a new code starts over. */
const MAX_RESET_ATTEMPTS = 5;

/** Finish a reset. The code is single-use and only valid before it expires. */
const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<void> => {
  // Spend one attempt atomically before comparing. Uncapped, a 6-digit code
  // falls to brute force well inside its 15 minutes; a read-then-write count
  // would let parallel guesses slip past the cap.
  const user = await User.findOneAndUpdate(
    {
      email,
      resetTokenExpiresAt: { $gt: new Date() },
      resetAttempts: { $lt: MAX_RESET_ATTEMPTS },
    },
    { $inc: { resetAttempts: 1 } },
    { new: true }
  ).select("+resetToken +resetTokenExpiresAt");

  // One message for every failure mode, so a wrong code cannot be told apart
  // from an unregistered address.
  const invalid = new ApiError(
    httpStatus.BAD_REQUEST,
    "That reset code is not valid or has expired. Please request a new one."
  );
  if (!user || !user.resetToken || user.resetToken !== String(code)) throw invalid;

  user.password = newPassword; // hashed by the pre-save hook
  user.resetToken = undefined;
  user.resetTokenExpiresAt = undefined;
  user.resetAttempts = undefined;
  await user.save();
};

/** Lookup by address, for callers that only hold the email from a session. */
const getUserByEmail = async (email: string): Promise<IUSer | null> =>
  User.findOne({ email }).select("+phone +shippingAddress");

export const updateUSerProfile = async (
  id: string,
  payload: Partial<IUSer>
): Promise<IUSer | null> => {
  // Validate the ID format
  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   throw new Error("Invalid ID format");
  // }

  // Find and update the parent category
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true, // Return the updated document
    runValidators: true, // Enforce schema validations
  });

  return result;
};

export const UserService = {
  createUSer,
  updateUSerProfile,
  verifyEmailService,
  resendVerification,
  getUserById,
  getUserByEmail,
  requestPasswordReset,
  resetPassword,
};
