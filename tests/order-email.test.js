// The order email goes to whatever address a guest types, greeting whatever
// name they type: customer input must never become markup or a link, and the
// lines + shipping must add up to the total that was charged.
const assert = require("assert");
const { renderOrderEmail } = require("../src/app/middlewares/orderEmailTemplate.ts");

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
console.log("order-email: ok");
