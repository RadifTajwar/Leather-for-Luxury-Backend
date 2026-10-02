import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse ";
import httpStatus from "http-status";
import { OrderService } from "./Oder.service";
import ApiError from "../../errors/ApiError";
import { paginationFields } from "../../constants/pagination";
import pick from "../../shared/pick";
import { IOrder } from "./Oder.interface";
import { OrderFilterableFields } from "./Oder.constants";
import { assertSelfOrAdmin } from "../../middlewares/auth";

const createOder = catchAsync(
  async (req: { body: any }, res: Response<any, Record<string, any>>) => {
    const oder = req.body;

    const result = await OrderService.createOder(oder);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order is created successfully",
      data: result,
    });
  }
);
const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, OrderFilterableFields);

  const paginationOptions = pick(req.query, paginationFields);

  const result = await OrderService.getAll(filters, paginationOptions);
  sendResponse<IOrder[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleOrderById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await OrderService.getSingleById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "order is retrieved successfully",
    data: result,
  });
});
const getOrderByUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.email;
  assertSelfOrAdmin(req.user, id);
  const result = await OrderService.getOderByUser(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: " UserOrder is retrieved successfully",
    data: result,
  });
});
export const updateOderById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params; // Extract ID from request parameters
    const updateData = req.body; // Extract update payload from request body

    // Perform the update operation
    const updatedOrder = await OrderService.updateOrderId(id, updateData);

    // Handle case where the category is not found
    if (!updatedOrder) {
      throw new ApiError(httpStatus.NOT_FOUND, "Oder  not found");
    }

    // Send a successful response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order  updated successfully",
      data: updatedOrder,
    });
  }
);
const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const id = req?.params?.id;
  const result = await OrderService.deleteOrderFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order  is deleted successfully",
    data: result,
  });
});

export const OderController = {
  createOder,
  getAll,
  getSingleOrderById,
  getOrderByUser,
  updateOderById,
  deleteOrder,
};
