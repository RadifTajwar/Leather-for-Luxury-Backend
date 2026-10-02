// The order email goes to whatever address a guest types, greeting whatever
// name they type: customer input must never become markup or a link, and the
// lines + shipping must add up to the total that was charged.
const assert = require("assert");
const {
  renderOrderEmail,
  renderTrackingEmail,
} = require("../src/app/middlewares/orderEmailTemplate.ts");

const order = (customerName) =>
  renderOrderEmail({
    customerName,
    orderNumber: 1001,
    total: 980,
    lines: [
      { name: "Desi Bag", color: "Brown", quantity: 2, unitPrice: 450, image: "https://i.ibb.co.com/x.webp" },
    ],
  });

for (const name of ['<a href="http://evil.example">Win</a> Doe', "http://evil.example Doe"]) {
  const { text, html } = order(name);
  assert.ok(!html.includes("<a "), "customer HTML must be escaped");
  assert.ok(!/evil\.example|http:/.test(text + html), "no customer-supplied link anywhere");
}

const { subject, text, html } = order("Radif Tajwar");
assert.strictEqual(subject, "Your Leather For Luxury order #1001 is confirmed");
assert.ok(text.startsWith("Hi Radif,"));
assert.ok(!html.includes("ibb.co"), "images on free hosts are dropped");
assert.ok(text.includes("Subtotal: ৳ 900.00") && text.includes("Shipping: ৳ 80.00") && text.includes("Total: ৳ 980.00"));

// Tracking: names the delivery company and ID, says plainly when it's a correction.
const tracking = (isUpdate, courier = "Pathao Courier") =>
  renderTrackingEmail({
    customerName: "Radif Tajwar",
    orderNumber: 1002,
    courier,
    trackCode: 'DL<b>12</b>',
    isUpdate,
    lines: [{ name: "Desi Bag", color: "Brown", quantity: 1, unitPrice: 920 }],
  });
const shipped = tracking(false);
assert.strictEqual(shipped.subject, "Your Leather For Luxury order #1002 is on its way");
assert.ok(shipped.text.includes("Delivery company: Pathao Courier"));
assert.ok(shipped.html.includes("DL&lt;b&gt;12&lt;/b&gt;") && !shipped.html.includes("<b>12"), "tracking ID escaped");
assert.ok(!shipped.text.includes("৳"), "no prices in the tracking email");
const corrected = tracking(true);
assert.strictEqual(corrected.subject, "Updated tracking for your Leather For Luxury order #1002");
assert.ok(corrected.text.includes("won't work"), "a correction says the old ID is wrong");
assert.ok(!tracking(false, "").text.includes("Delivery company:"), "no courier line when none was given");
console.log("order-email: ok");
