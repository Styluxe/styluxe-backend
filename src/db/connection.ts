import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { User, UserAddress } from "../models/users";
import {
  Bookmark,
  Image,
  Post,
  PostCategory,
  PostComment,
  Reaction,
} from "../models/posts";
import {
  Product,
  ProductCare,
  ProductCategory,
  ProductImage,
  ProductMaterial,
  ProductSize,
  ProductSubCategory,
} from "../models/products";
import {
  CartItem,
  Order,
  OrderItem,
  PaymentDetails,
  ShoppingCart,
} from "../models/orders";
import {
  Stylist,
  StylistReview,
  StylistSchedule,
  StylistScheduleTime,
} from "../models/stylists";
import { StylistBooking, BookingDetails } from "../models/booking";
import { LatestProduct } from "../models/featured";

dotenv.config();

const connection = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [
    User,
    UserAddress,
    Post,
    PostCategory,
    PostComment,
    Reaction,
    Image,
    Bookmark,
    ProductCategory,
    ProductSubCategory,
    Product,
    ProductCare,
    ProductMaterial,
    ProductImage,
    ProductSize,
    ShoppingCart,
    CartItem,
    PaymentDetails,
    Order,
    OrderItem,
    Stylist,
    StylistReview,
    StylistSchedule,
    StylistScheduleTime,
    StylistBooking,
    BookingDetails,
    LatestProduct,
  ],
  logging: false,
});

export default connection;
