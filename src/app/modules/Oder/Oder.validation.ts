import mongoose from "mongoose";
import { z } from "zod";

export const OrderZodSchema = z.object({
  body: z.object({
    orderItems: z.array(
      z.object({
        quantity: z.number().min(1, "Quantity must be at least 1"),
        product: z
          .string()
          .refine((id) => mongoose.Types.ObjectId.isValid(id), {
            message: "Invalid Product ID",
          }),
        color: z.string().min(1, "color is  required"),
      })
    ),
    name: z.string().min(1, "name is required"),
    shippingAddress: z.string().optional(),
    city: z.string().min(1, "City is required"),
    zip: z.string().min(1, "ZIP code is required"),
    country: z.string().min(1, "Country is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().min(1, "Email number is required"),
    status: z.string().default("Pending"),
    totalPrice: z.number().optional(),
    trackCode: z.string().optional(),
    dateOrdered: z.date().optional(),
  }),
});
export const UpdateOrderZodSchema = z.object({
  body: z
    .object({
      orderItems: z
        .array(
          z.object({
            quantity: z.number().optional(),
            product: z.string().optional(),
            color: z.string().optional(),
          })
        )
        .optional(),
      name: z.string().optional(),
      shippingAddress2: z.string().optional(),
      city: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      status: z.string().optional(),
      totalPrice: z.number().optional(),
      trackCode: z.string().optional(),
      courier: z.string().optional(),
      dateOrdered: z.date().optional(),
    })
    .optional(),
});

export const OrderValidation = {
  OrderZodSchema,
  UpdateOrderZodSchema,
};
