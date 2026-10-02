/**
 * Customer emails about an order: the confirmation, and the courier tracking
 * details once it ships. Built to land in the inbox rather than spam: inline
 * styles only, no external fonts or free image hosts, a plain-text part that
 * says the same thing as the HTML, and a personal greeting.
 *
 * Anyone can place a guest order with any name and any email address, so every
 * customer-supplied value is escaped: otherwise the store would mail whatever
 * HTML (or phishing link) an attacker typed into the name field.
 */

export interface OrderEmailLine {
  name: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  image?: string;
}

export interface OrderEmailInput {
  customerName?: string;
  orderNumber?: number;
  lines: OrderEmailLine[];
  total: number;
}

export interface TrackingEmailInput {
  customerName?: string;
  orderNumber?: number;
  lines: OrderEmailLine[];
  courier?: string;
  trackCode: string;
  /** True when correcting tracking that was already sent. */
  isUpdate: boolean;
}

type RenderedEmail = { subject: string; text: string; html: string };

const esc = (value: unknown): string =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );

// Same format as the storefront's formatMoney: "৳ 1,234.00".
const money = (amount: number): string =>
  `৳ ${(Number.isFinite(amount) ? amount : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Letters only: a "name" like http://evil.example must not become a link.
const firstNameOf = (name?: string): string =>
  (String(name ?? "").trim().split(/\s+/)[0] ?? "").replace(/[^\p{L}\p{M}'-]/gu, "") ||
  "there";

// Only our own image CDN; images on free hosts (ImgBB and the like) are a spam signal.
const safeImage = (url?: string): string | undefined =>
  url && url.startsWith("https://res.cloudinary.com/") ? url : undefined;

const cell = "border-bottom:1px solid #e7e5e4;vertical-align:top;";
const label = "font-size:12px;letter-spacing:0.6px;text-transform:uppercase;color:#78716c;";

const itemRows = (lines: OrderEmailLine[], withPrices: boolean): string => {
  // One image column for all rows, or none: an empty column just indents names.
  const showImages = lines.some((l) => safeImage(l.image));
  return lines
    .map((l) => {
      const image = safeImage(l.image);
      return `<tr>${
        showImages
          ? `
  <td width="68" style="padding:12px 12px 12px 0;${cell}">${
    image
      ? `<img src="${esc(image)}" alt="${esc(l.name)}" width="56" height="56" style="display:block;border-radius:4px;">`
      : ""
  }</td>`
          : ""
      }
  <td style="padding:12px 0;font-size:14px;${cell}">
    <div style="font-weight:bold;">${esc(l.name)}</div>
    <div style="color:#78716c;font-size:13px;">${l.color ? `Color: ${esc(l.color)} &middot; ` : ""}Qty: ${Number(l.quantity) || 0}</div>
  </td>${
    withPrices
      ? `\n  <td align="right" style="padding:12px 0;font-size:14px;white-space:nowrap;${cell}">${money(l.unitPrice * l.quantity)}</td>`
      : ""
  }
</tr>`;
    })
    .join("\n");
};

const itemTable = (lines: OrderEmailLine[], withPrices: boolean): string =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7e5e4;">
${itemRows(lines, withPrices)}
    </table>`;

const itemText = (lines: OrderEmailLine[], withPrices: boolean): string[] =>
  lines.map(
    (l) =>
      `- ${l.name}${l.color ? ` (${l.color})` : ""} x ${l.quantity}${
        withPrices ? `: ${money(l.unitPrice * l.quantity)}` : ""
      }`
  );

/** The shared card: store name on top, the message, a short footer. */
const layout = (subject: string, heading: string, body: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e7e5e4;border-radius:8px;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
  <tr><td style="padding:20px 28px;border-bottom:1px solid #e7e5e4;font-size:18px;font-weight:bold;letter-spacing:0.5px;">Leather For Luxury</td></tr>
  <tr><td style="padding:28px;">
    <p style="margin:0 0 8px;font-size:20px;font-weight:bold;">${esc(heading)}</p>
${body}
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#57534e;">Questions about your order? Just reply to this email.</p>
  </td></tr>
  <tr><td style="padding:16px 28px;border-top:1px solid #e7e5e4;font-size:12px;line-height:1.5;color:#78716c;">You received this email because an order was placed at Leather For Luxury with this address.</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const paragraph = (html: string): string =>
  `    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#44403c;">${html}</p>`;

export const renderOrderEmail = ({
  customerName,
  orderNumber,
  lines,
  total,
}: OrderEmailInput): RenderedEmail => {
  const ref = orderNumber ? ` #${orderNumber}` : "";
  const firstName = firstNameOf(customerName);
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  // The order total is priced by the storefront as items + shipping.
  const shipping = Math.max(0, Number((total - subtotal).toFixed(2)));

  const subject = `Your Leather For Luxury order${ref} is confirmed`;

  const text = [
    `Hi ${firstName},`,
    "",
    `Thank you for your order${ref}. We have received it and will email you again when it ships.`,
    "",
    ...itemText(lines, true),
    "",
    `Subtotal: ${money(subtotal)}`,
    `Shipping: ${money(shipping)}`,
    `Total: ${money(total)}`,
    "",
    "Questions about your order? Just reply to this email.",
    "",
    "Leather For Luxury",
  ].join("\n");

  const html = layout(
    subject,
    `Order${ref} confirmed`,
    `${paragraph(`Hi ${esc(firstName)}, thank you for your order. We have received it and will email you again when it ships.`)}
    ${itemTable(lines, true)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:14px;">
      <tr><td style="padding:4px 0;color:#57534e;">Subtotal</td><td align="right" style="padding:4px 0;">${money(subtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#57534e;">Shipping</td><td align="right" style="padding:4px 0;">${money(shipping)}</td></tr>
      <tr><td style="padding:10px 0 0;font-weight:bold;border-top:1px solid #e7e5e4;">Total</td><td align="right" style="padding:10px 0 0;font-weight:bold;border-top:1px solid #e7e5e4;">${money(total)}</td></tr>
    </table>`
  );

  return { subject, text, html };
};

/**
 * The parcel is with a delivery company: tell the customer which one and the
 * tracking ID it issued, so they can follow it on that company's site or app.
 * A correction says so plainly, because the first ID they got is now wrong.
 */
export const renderTrackingEmail = ({
  customerName,
  orderNumber,
  lines,
  courier,
  trackCode,
  isUpdate,
}: TrackingEmailInput): RenderedEmail => {
  const ref = orderNumber ? ` #${orderNumber}` : "";
  const firstName = firstNameOf(customerName);
  const company = courier?.trim() || "";
  const carrier = company || "our delivery partner";

  const subject = isUpdate
    ? `Updated tracking for your Leather For Luxury order${ref}`
    : `Your Leather For Luxury order${ref} is on its way`;
  const lead = isUpdate
    ? `we've corrected the tracking details for your order. Please use the tracking ID below; the one we sent earlier won't work.`
    : `good news: your order has been handed to ${carrier} and is on its way.`;
  const howTo = company
    ? `Track your parcel on the ${company} website or app with this tracking ID.`
    : `Track your parcel on the delivery company's website or app with this tracking ID.`;

  const text = [
    `Hi ${firstName},`,
    "",
    `${lead.charAt(0).toUpperCase()}${lead.slice(1)}`,
    "",
    ...(company ? [`Delivery company: ${company}`] : []),
    `Tracking ID: ${trackCode}`,
    "",
    howTo,
    "",
    "In this parcel:",
    ...itemText(lines, false),
    "",
    "Questions about your order? Just reply to this email.",
    "",
    "Leather For Luxury",
  ].join("\n");

  const html = layout(
    subject,
    isUpdate ? `Tracking updated for order${ref}` : `Order${ref} is on its way`,
    `${paragraph(`Hi ${esc(firstName)}, ${esc(lead)}`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;background-color:#fafaf9;border:1px solid #e7e5e4;border-radius:6px;">
      <tr><td style="padding:16px 18px;">${
        company
          ? `
        <div style="${label}">Delivery company</div>
        <div style="margin:2px 0 14px;font-size:16px;font-weight:bold;">${esc(company)}</div>`
          : ""
      }
        <div style="${label}">Tracking ID</div>
        <div style="margin-top:2px;font-size:20px;font-weight:bold;letter-spacing:1px;font-family:'Courier New',Courier,monospace;word-break:break-all;">${esc(trackCode)}</div>
      </td></tr>
    </table>
    <p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#57534e;">${esc(howTo)}</p>
    <p style="margin:0 0 4px;${label}">In this parcel</p>
    ${itemTable(lines, false)}`
  );

  return { subject, text, html };
};
