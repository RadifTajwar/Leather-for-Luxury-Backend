/**
 * One-time backfill: give every existing order a sequential number, oldest
 * first, and leave the counter pointing just past the highest one.
 * Safe to re-run — orders that already have a number are skipped.
 */
import mongoose from "mongoose";
import config from "../src/app/config";
import { Counter, ORDER_NUMBER_START } from "../src/app/modules/Oder/Counter.model";
import { Order } from "../src/app/modules/Oder/Oder.model";

(async () => {
  await mongoose.connect(config.database_url as string);

  const existing = await Order.find({ orderNumber: { $exists: true, $ne: null } })
    .sort({ orderNumber: -1 })
    .limit(1);
  let seq = existing.length ? (existing[0].orderNumber as number) - ORDER_NUMBER_START : 0;

  const missing = await Order.find({
    $or: [{ orderNumber: { $exists: false } }, { orderNumber: null }],
  }).sort({ createdAt: 1, _id: 1 });

  console.log(`orders needing a number: ${missing.length}`);
  for (const order of missing) {
    seq += 1;
    await Order.updateOne({ _id: order._id }, { $set: { orderNumber: ORDER_NUMBER_START + seq } });
  }

  await Counter.findByIdAndUpdate("orderNumber", { $set: { seq } }, { upsert: true });

  const total = await Order.countDocuments();
  const numbered = await Order.countDocuments({ orderNumber: { $exists: true, $ne: null } });
  const first = await Order.findOne().sort({ orderNumber: 1 });
  const last = await Order.findOne().sort({ orderNumber: -1 });
  console.log(`numbered ${numbered}/${total}  range #${first?.orderNumber} .. #${last?.orderNumber}`);
  console.log(`counter now at seq=${seq} (next order will be #${ORDER_NUMBER_START + seq + 1})`);
  process.exit(0);
})();
