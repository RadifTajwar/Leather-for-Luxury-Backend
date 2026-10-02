import mongoose, { SortOrder } from "mongoose";
import { IOrder, IOrderFilters } from "./Oder.interface";
import { Order } from "./Oder.model";
import { IProductFilters } from "../Product/Product.interface";
import { IGenericResponse } from "../../interface/common";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelpers } from "../../helpers/paginationHelper";
import { OrderSearchableFields } from "./Oder.constants";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { sendOrderEmail, sendTrackingEmail } from "../../middlewares/email";
import { Product } from "../Product/Product.model";
import { nextOrderNumber } from "./Counter.model";

const createOder = async (payload: IOrder): Promise<IOrder | null> => {
  // Fetch the products by their IDs
  const productIds = payload.orderItems.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  // console.log(products, "product");
  // Ensure all products are found
  if (products.length !== productIds.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "One or more products not found");
  }

  // Structure the orderItems with product details
  const structuredOrderItems = payload.orderItems.map((item) => {
    const product = products.find((p) => p._id.equals(item.product));
    if (!product) {
      throw new Error("Product not found");
    }
    return {
      ...item,
      product: product._id, // or any additional details you want to add
    };
  });

  // Create the order
  const result = await Order.create({
    ...payload,
    orderNumber: await nextOrderNumber(),
    orderItems: structuredOrderItems,
  });

  // Send the order email
  await sendOrderEmail(payload.email, products, result);

  return result;
};

const getSingleById = async (id: string) => {
  const result = await Order.findById(id).populate({
    path: "orderItems",
    populate: {
      path: "product",
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }
  return result;
};
const getOderByUser = async (email: string) => {
  const result = await Order.find({ email: email }).populate({
    path: "orderItems",
    populate: {
      path: "product",
      select: `
      barcode
      slug
      name
      originalPrice
      discountedPrice
      inStock
      onSale
      imageDefault
      imageHover
    `.trim(),
    },
  });
  return result;
};

export const updateOrderId = async (
  id: string,
  payload: Partial<IOrder>
): Promise<IOrder | null> => {
  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ID format");
  }

  const before = await Order.findById(id);

  // Find and update the order
  const result = await Order.findByIdAndUpdate(id, payload, {
    new: true, // Return the updated document
    runValidators: true, // Enforce schema validations
  });

  // Mail the customer only when the tracking details actually change: adding
  // them, or correcting a wrong ID or courier. A status-only save sends nothing.
  if (
    result?.trackCode &&
    (result.trackCode !== before?.trackCode || result.courier !== before?.courier)
  ) {
    const products = await Product.find({
      _id: { $in: result.orderItems.map((item) => item.product) },
    });
    await sendTrackingEmail(result, products, Boolean(before?.trackCode));
  }

  return result;
};

const getAll = async (
  filters: IOrderFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IOrder[]>> => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  // Extract searchTerm to implement search query
  const { startDate, endDate, searchTerm, ...filtersData } = filters;

  const andConditions = [];

  let start = startDate ? new Date(startDate) : null;
  let end = endDate ? new Date(endDate) : null;

  // Validate and handle date range
  if (start && end) {
    if (start > end) {
      // Swap dates if startDate is after endDate
      [start, end] = [end, start];
    }
    start.setHours(0, 0, 0, 0); // Start of the day
    end.setHours(23, 59, 59, 999); // End of the day

    andConditions.push({
      dateOrdered: {
        $gte: start,
        $lte: end,
      },
    });
  } else if (start) {
    // If only startDate is provided, get all data from startDate onwards
    start.setHours(0, 0, 0, 0);
    andConditions.push({
      dateOrdered: {
        $gte: start,
      },
    });
  } else if (end) {
    // If only endDate is provided, get all data up to endDate
    end.setHours(23, 59, 59, 999);
    andConditions.push({
      dateOrdered: {
        $lte: end,
      },
    });
  }

  // Free text search across the string fields, plus an exact hit on the order
  // number so staff can paste what a customer reads out ("1042" or "#1042").
  //
  // The previous version tested `field === "Product" || "User"`, where the bare
  // "User" is always truthy, so every field went down the $expr branch.
  if (searchTerm) {
    const term = String(searchTerm).trim();
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const or: Record<string, unknown>[] = OrderSearchableFields.map((field) => ({
      [field]: { $regex: escaped, $options: "i" },
    }));

    const asNumber = Number(term.replace(/^#/, ""));
    if (Number.isInteger(asNumber)) or.push({ orderNumber: asNumber });

    // Let staff paste a full or partial database id too.
    if (/^[0-9a-f]{6,24}$/i.test(term)) {
      or.push({ $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: term, options: "i" } } });
    }

    andConditions.push({ $or: or });
  }

  // Filters needs $and to fullfill all the conditions
  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // Dynamic  Sort needs  field to  do sorting
  const sortConditions: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  // If there is no condition , put {} to give all data
  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  // console.log("Query Conditions:", whereConditions);
  const result = await Order.find(whereConditions)

    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
const deleteOrderFromDB = async (id: string) => {
  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }
  const result = await Order.findByIdAndDelete({ _id: id });

  return result;
};

export const OrderService = {
  createOder,
  getOderByUser,
  getSingleById,
  updateOrderId,
  getAll,
  deleteOrderFromDB,
};
