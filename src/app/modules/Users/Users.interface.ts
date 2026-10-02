import { Model } from "mongoose";

export type IUSer = {
  id: String;
  name: string;
  email: string;
  location?: string;
  password: string;
  slug?: string;
  phone?: string;
  shippingAddress?: string;
  role?: string;
  isVerified?: boolean;

  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiresAt?: Date;
  resetAttempts?: number;

  // Mongoose-specific methods
  isModified(path: string): boolean;
};
export interface UserModel extends Model<IUSer> {
  //instance methods for checking if the user exist
  isUserExistsByEmail(email: string): Promise<IUSer>;
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  // isJWTIssuedBeforePasswordChanged(
  //   passwordChangedTimestamp: Date,
  //   jwtIssuedTimestamp: number,
  // ): boolean;
}
// export type USerModel = Model<IUSer, Record<string, unknown>>;
