import nodemailer from "nodemailer";
import config from "../config";

/**
 * Mail transport. Credentials come from the environment, never the source:
 * the previous hardcoded app password is in this repo's git history and had to
 * be revoked.
 */
export const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465, // true for 465, false for 587/STARTTLS
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
});

/** Envelope sender for every message this app sends. */
export const MAIL_FROM = config.smtp.from;
