import crypto from "crypto";
import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";

import globalErrorHandler from "./app/middlewares/globalErrorHandler";

import router from "./app/routes";
import sendResponse from "./app/shared/sendResponse ";
import Status from "http-status";
import cookieParser from "cookie-parser";
import jsonSyntaxErrorHandler from "./app/errors/jsonSyntaxErrorHandler";
import config from "./app/config";
import ApiError from "./app/errors/ApiError";
const app: Application = express();

app.use(cors());

//parser
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Welcome to the API Of Leather-for-Luxury",
    data: null, // No data to send
  });
});

/**
 * Only the storefront's server may call the API. Browsers never talk to it
 * directly, so a secret shared with the storefront keeps the API private even
 * though its URL is public. No secret configured means nobody gets in.
 */
const requireStorefront = (req: Request, _res: Response, next: NextFunction) => {
  const given = Buffer.from(req.get("x-bff-secret") ?? "");
  const expected = Buffer.from(config.bff_secret ?? "");
  if (
    expected.length > 0 &&
    given.length === expected.length &&
    crypto.timingSafeEqual(given, expected)
  ) {
    return next();
  }
  next(new ApiError(Status.UNAUTHORIZED, "Unauthorized"));
};

// Serverless: connect on the first request and reuse it. A failed attempt is
// dropped, so the next request retries instead of failing until a cold start.
let db: Promise<unknown> | undefined;
const connectDb = (_req: Request, _res: Response, next: NextFunction) => {
  db ??= mongoose.connect(config.database_url as string).then(
    () => console.log("🛢   Database is connected successfully"),
    (err) => {
      db = undefined;
      throw err;
    }
  );
  db.then(() => next(), next);
};

// route
app.use("/api/v1", requireStorefront, connectDb, router);

// Catch JSON syntax errors
app.use(jsonSyntaxErrorHandler);
//global error handler
app.use(globalErrorHandler);
//Testing

export default app;
