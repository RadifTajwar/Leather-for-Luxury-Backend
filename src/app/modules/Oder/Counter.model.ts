import mongoose, { Schema } from "mongoose";

/**
 * Atomic sequence source for human-facing order numbers.
 *
 * A "read the current max and add one" scheme races: two checkouts in the same
 * moment both read the same max and one of them fails the unique index. A
 * single-document `$inc` is atomic in MongoDB, so every caller gets a distinct
 * number without a transaction.
 */
export interface ICounter {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
});

export const Counter = mongoose.model<ICounter>("Counter", counterSchema);

/** Order numbers start here so the first one does not read as "#1". */
export const ORDER_NUMBER_START = 1000;

export async function nextOrderNumber(): Promise<number> {
  const doc = await Counter.findByIdAndUpdate(
    "orderNumber",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return ORDER_NUMBER_START + doc.seq;
}
