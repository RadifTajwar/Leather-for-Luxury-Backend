import { IOrder } from "../modules/Oder/Oder.interface";
import { IProduct } from "../modules/Product/Product.interface";
import { MAIL_FROM, transporter } from "./email.config";
import {
  Password_Reset_Template,
  Verification_Email_Template,
  Verification_User_Template,
} from "./emaleTemplate";
import { renderOrderEmail } from "./orderEmailTemplate";

export const sendVerificationEmail = async (
  email: string,
  verificationCode: string
): Promise<void> => {
  try {
    const response = await transporter.sendMail({
      from: MAIL_FROM,
      to: email, // list of receivers
      subject: "Order Track Code", // Subject line
      text: "Order Track Code", // plain text body
      html: Verification_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ),
    });
    // console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Email error:", error);
  }
};
/**
 * Welcome mail carrying the one-time password issued by createUser.
 * Returns whether it was accepted: the account is unusable without it, so the
 * caller needs to know, but it must not throw and unwind a created account.
 */
/**
 * Signup verification mail: carries the 6-digit code, never a password.
 * Returns whether the mail server accepted it. Note that acceptance is not
 * delivery — a non-existent mailbox is still accepted here and bounces later.
 */
export const sendVerificationUser = async (
  email: string,
  verificationCode: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject: "Verify your email — Leather For Luxury",
      text: `Your verification code is ${verificationCode}.`,
      html: Verification_User_Template.replace(
        /{verificationCode}/g,
        verificationCode
      ),
    });
    return true;
  } catch (error) {
    console.error("Verification email error:", error);
    return false;
  }
};

/**
 * Password reset code. Returns whether the mail server accepted it so the
 * caller can log a failure; never throws.
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetCode: string,
  expiryMinutes: number
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject: "Reset your password — Leather For Luxury",
      text: `Your password reset code is ${resetCode}. It expires in ${expiryMinutes} minutes.`,
      html: Password_Reset_Template.replace(/{resetCode}/g, resetCode).replace(
        /{expiryMinutes}/g,
        String(expiryMinutes)
      ),
    });
    return true;
  } catch (error) {
    console.error("Password reset email error:", error);
    return false;
  }
};

export const sendOrderEmail = async (
  email: string,
  Items: IProduct[],
  structuredOrderItems: IOrder
): Promise<void> => {
  try {
    const { subject, text, html } = renderOrderEmail({
      customerName: structuredOrderItems.name,
      orderNumber: structuredOrderItems.orderNumber,
      total: structuredOrderItems.totalPrice,
      lines: structuredOrderItems.orderItems.map((item) => {
        const product = Items.find((p) => p._id.equals(item.product));
        return {
          name: product?.name ?? "Item",
          color: item.color,
          quantity: item.quantity,
          // The storefront charges discountedPrice; show what was charged.
          unitPrice: Number(product?.discountedPrice ?? product?.originalPrice ?? 0),
          image: product?.imageDefault,
        };
      }),
    });

    await transporter.sendMail({
      from: MAIL_FROM,
      replyTo: MAIL_FROM,
      to: email,
      subject,
      text,
      html,
    });
  } catch (error) {
    // Never rethrow: the order is already saved by the time this runs, so a
    // failing mail server would unwind a successful sale into a 500 and the
    // customer would re-submit. Matches sendVerificationEmail/sendVerificationUser.
    console.error("Email error (order confirmation not sent):", error);
  }
};

// export const sendWelcomeEmail = async (
//   email: string,
//   name: string
// ): Promise<void> => {
//   try {
//     const response = await transporter.sendMail({
//       from: '"Zahid" <zahidtime313@gmail.com>',
//       to: email, // list of receivers
//       subject: "Welcome Email", // Subject line
//       text: "Welcome Email", // plain text body
//       html: Welcome_Email_Template.replace("{name}", name),
//     });
//     console.log("Email sent successfully:", response);
//   } catch (error) {
//     console.error("Email error:", error);
//   }
// };
