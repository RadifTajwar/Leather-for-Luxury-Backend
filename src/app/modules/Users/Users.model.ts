import mongoose, { Schema } from "mongoose";
import { IUSer, UserModel } from "./Users.interface";
import bcrypt from "bcryptjs";
import config from "../../config";
import slugify from "slugify";

// Define the Mongoose schema
const UserSchema = new Schema<IUSer, UserModel>(
  {
    id: { type: String, required: false },
    name: { type: String, required: true },
    slug: { type: String, require: false },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "user" },
    location: { type: String },
    password: { type: String, required: true, select: 0 },
    phone: { type: String, required: false, select: 0 },
    shippingAddress: { type: String, required: false, select: 0 },

    // Was declared on IUSer but never on the schema, so verifyEmailService set
    // it and mongoose silently dropped it: verification never persisted.
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    // Password reset. The code is single-use and short lived: without an expiry
    // a leaked mailbox stays a permanent way into the account.
    resetToken: { type: String, select: 0 },
    resetTokenExpiresAt: { type: Date, select: 0 },
  },

  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

UserSchema.pre("save", async function (next) {
  // Only hash when the password actually changed. Hashing unconditionally
  // double-hashed it on any later save() and, because `password` is select:0,
  // threw "Illegal arguments: undefined" whenever the document was loaded
  // without it — which is every save from verification or profile updates.
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bycrypt_salt_rounds)
  );
  next();
});

// find user by email
UserSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select("+password");
};
// check password  meth
UserSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

UserSchema.pre("save", function (next) {
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("name") || this.isNew) {
    // Generate base slug
    const baseSlug = slugify(this.name, {
      lower: true, // Convert to lowercase
      strict: true, // Remove special characters
      replacement: "-", // Replace spaces with hyphens
    });

    let uniqueSlug = baseSlug;
    let counter = 0;

    // Check for slug uniqueness
    while (
      await User.findOne({ slug: uniqueSlug }) // Correct model name
    ) {
      counter += 1;
      uniqueSlug = `${baseSlug}-${counter}`; // Append counter if duplicate
    }

    this.slug = uniqueSlug; // Set the unique slug
  }
  next();
});

// Transform output to include `id` and remove `_id` and `__v`
UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});

// Create the model using the schema
export const User = mongoose.model<IUSer, UserModel>("User", UserSchema);
