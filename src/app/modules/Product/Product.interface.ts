import mongoose, { Model, Types } from "mongoose";

type Color = {
  colorName: string;
  hex: string;
  availableQuantity: number;
};
type AdditionalDetails = {
  color: string;
  hex: string;
  quantity: number;
  images: string[];
};
type Size = {
  [key: string]: string;
};

type ProductDetails = {
  additionalProductDetails: Record<string, any>;
  size: Size;
  warranty: string;
};
type Leather = {
  image?: string;
  title?: string[];
};

export type IProduct = {
  _id: mongoose.Types.ObjectId;
  barcode?: string;
  slug?: string;
  name: string;
  color: Color;
  originalPrice: number;
  discountedPrice: number;
  inStock: boolean;
  onSale: boolean;
  categoryId: mongoose.Types.ObjectId;
  parentCategoryId?: mongoose.Types.ObjectId;
  imageDefault: string;
  imageHover: string;
  additionalDetails: AdditionalDetails;
  productDetails: ProductDetails;
  leather?: Leather;
};

export type IProductFilters = {
  searchTerm?: string;
  category?: string;
  categoryId?: Types.ObjectId;
  parentCategoryId?: Types.ObjectId;
  startPrice?: number;
  endPrice?: number;
  colorName?: string | string[];
  inStock?: boolean;
  onSale?: boolean;
};
export type ProductModel = Model<IProduct, Record<string, unknown>>;
