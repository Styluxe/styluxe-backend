import express, { Request, Response } from "express";
import {
  Product,
  ProductCategory,
  ProductImage,
  ProductSize,
  ProductSubCategory,
} from "../models/products";
import { verifyToken } from "../middlewares/verifyToken";
import { Order, OrderItem, PaymentDetails } from "../models/orders";
import { User } from "../models/users";
import { Sequelize } from "sequelize-typescript";

const router = express.Router();

//get all products
router.get("/products", verifyToken, async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: ProductSize },
        { model: ProductImage },
        { model: ProductSubCategory },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ code: 200, data: products });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

//get all  category
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await ProductCategory.findAll({
      include: [{ model: ProductSubCategory }],
    });

    res.status(200).json({
      code: 200,
      message: "All categories retrieved successfully",
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

// Get all orders with custom sorting
router.get("/orders", verifyToken, async (req: Request, res: Response) => {
    try {
        const orders = await Order.findAll<any>({
            include: [
                {
                    model: OrderItem,
                    include: [{ model: Product, include: [{ model: ProductImage }] }],
                },
                {
                    model: PaymentDetails,
                },
                {
                    model: User,
                },
            ],
            order: [
                [Sequelize.literal(`CASE WHEN order_status = 'waiting for confirmation' THEN 1 ELSE 2 END`), 'ASC'],
                ["createdAt", "DESC"]
            ],
        });

        res.status(200).json({ code: 200, data: orders });
    } catch (error) {
        console.error("Error viewing orders:", error);
        res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
});



export default router;
