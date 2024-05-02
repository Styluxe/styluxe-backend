import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import {
  User,
  UserAddress,
  PaymentType,
  Follower,
  Following,
} from "../models/users";
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
  ProductDiscussion,
  ProductDiscussionReply,
  ProductImage,
  ProductMaterial,
  ProductReview,
  ProductReviewImage,
  ProductSize,
  ProductSubCategory,
} from "../models/products";
import {
  CartItem,
  Order,
  OrderItem,
  PaymentDetails,
  ShippingDetails,
  ShoppingCart,
  Wishlist,
  WishlistItem,
} from "../models/orders";
import { Stylist, StylistReview, StylistSchedule } from "../models/stylists";
import { StylistBooking, BookingDetails } from "../models/booking";

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
    PaymentType,
    Follower,
    Following,
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
    ProductReview,
    ProductReviewImage,
    ProductSize,
    ProductDiscussion,
    ProductDiscussionReply,
    ShoppingCart,
    CartItem,
    Wishlist,
    WishlistItem,
    PaymentDetails,
    ShippingDetails,
    Order,
    OrderItem,
    Stylist,
    StylistReview,
    StylistSchedule,
    StylistBooking,
    BookingDetails,
  ],
  logging: false,
});

export default connection;
