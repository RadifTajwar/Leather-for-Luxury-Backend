export const OrderFilterableFields = [
  "searchTerm",
  "user",
  "status",
  "dateOrdered",
  "email",
  "startDate",
  "endDate",
  "orderNumber",
];

/**
 * Fields a free-text `searchTerm` is matched against. `orderNumber` is handled
 * separately in the service because it is numeric, not a regex target.
 */
export const OrderSearchableFields = ["email", "name", "phone", "trackCode", "status"];
