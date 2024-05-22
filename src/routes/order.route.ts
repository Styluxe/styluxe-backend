import express, { Request, Response } from "express";

import {
  Order,
  OrderItem,
  ShoppingCart,
  CartItem,
  PaymentDetails,
} from "../models/orders";
import { Product, ProductImage } from "../models/products";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";
import { UserAddress } from "../models/users";
import { Op } from "sequelize";
import { CronJob } from "cron";

const router = express.Router();

// Feature: Add to Cart
router.post(
  "/add-to-cart",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const { product_id, quantity, size } = req.body;

      // Find user's shopping cart
      let shoppingCart = await ShoppingCart.findOne<any>({
        where: { user_id: userId },
        include: [{ model: CartItem, include: [{ model: Product }] }],
      });

      // Initialize total amount of products
      let total = 0;

      if (!shoppingCart) {
        // Create new shopping cart if not found
        shoppingCart = await ShoppingCart.create<any>({
          user_id: userId,
          total: total,
        });
      }

      // Check if product already exists in cart
      let cartItem = await CartItem.findOne({
        where: {
          cart_id: shoppingCart.cart_id,
          product_id: product_id,
        },
      });

      if (cartItem) {
        // Update quantity if product exists
        if (cartItem.size === size) {
          cartItem.quantity += quantity;
          await cartItem.save();
        } else {
          // Create new cart item if product size differs
          cartItem = await CartItem.create<any>({
            cart_id: shoppingCart.cart_id,
            product_id: product_id,
            quantity: quantity,
            size: size,
          });
        }
      } else {
        // Create new cart item if product doesn't exist
        cartItem = await CartItem.create<any>({
          cart_id: shoppingCart.cart_id,
          product_id: product_id,
          quantity: quantity,
          size: size,
        });
      }

      // Calculate total price
      if (shoppingCart) {
        for (const item of shoppingCart.cart_items) {
          total += item.quantity * item.product.product_price;
        }
      }

      res.status(200).json({
        code: 200,
        message: "Product added to cart successfully",
        data: cartItem,
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  },
);

//update cart quantity
router.put(
  "/update-quantity",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const { cartItemId, quantity } = req.body;

      const cartItem = await CartItem.findOne({
        where: { cart_item_id: cartItemId },
      });

      const shoppingCart = await ShoppingCart.findOne<any>({
        where: { user_id: userId },
      });

      if (!cartItem) {
        return res
          .status(404)
          .json({ code: 404, error: "Cart item not found" });
      }

      if (cartItem.cart_id !== shoppingCart.cart_id) {
        return res.status(403).json({
          code: 403,
          error: "You are not authorized to update this cart item",
        });
      }

      cartItem.quantity = quantity;

      await cartItem.save();

      res.status(200).json({ code: 200, data: cartItem });

      // console.log("Cart item updated successfully");
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  },
);

//feature view cart
router.get("/view-cart", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    const shoppingCart = await ShoppingCart.findOne<any>({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          include: [{ model: Product, include: [{ model: ProductImage }] }],
        },
      ],
    });

    if (!shoppingCart) {
      const newShoppingCart = await ShoppingCart.create<any>({
        user_id: userId,
      });

      return res.status(200).json({ code: 200, data: newShoppingCart });
    }

    return res.status(200).json({ code: 200, data: shoppingCart });
  } catch (error) {
    console.error("Error viewing cart:", error);
    res.status(500).json({ code: 500, error: "Internal Server Error" });
  }
});

//feature remove from cart by cart item id
router.delete(
  "/remove-cart/:cartItemId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const cartItemId = parseInt(req.params.cartItemId);
      if (!cartItemId) {
        return res
          .status(404)
          .json({ code: 404, error: "Cart item not found" });
      }

      const { userId } = getUserIdFromToken(req, res);

      const shoppingCart = await ShoppingCart.findOne<any>({
        where: { user_id: userId },
      });

      if (!shoppingCart) {
        return res.status(404).json({ code: 404, error: "Cart is empty" });
      }

      const cartItem = await CartItem.findByPk(cartItemId);

      if (!cartItem || cartItem.cart_id !== shoppingCart.cart_id) {
        return res
          .status(404)
          .json({ code: 404, error: "Cart item not found" });
      }

      await cartItem.destroy();

      res.status(200).json({
        code: 200,
        message: "Product removed from cart successfully",
      });
    } catch (error) {
      console.error("Error removing product from cart:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  },
);

//view payment summary
router.get(
  "/payment-summary",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);

      const address = await UserAddress.findOne<any>({
        where: { user_id: userId, is_primary: true },
      });

      const shoppingCart = await ShoppingCart.findOne<any>({
        where: { user_id: userId },
      });

      if (!shoppingCart) {
        return res.status(404).json({ code: 404, error: "Cart is empty" });
      }

      const cartItems = await CartItem.findAll({
        where: { cart_id: shoppingCart.cart_id },
        include: [{ model: Product, include: [{ model: ProductImage }] }],
      });

      //count total price
      let total = 0;

      for (const item of cartItems) {
        total += item.quantity * item.product.product_price;
      }

      res.status(200).json({
        code: 200,
        data: {
          total_price: total,
          address: address || null,
          cartItems: cartItems,
        },
      });
    } catch (error) {
      console.error("Error viewing payment summary:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  },
);

//feature create order from shopping cart and calculate total
router.post(
  "/create-order",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const { payment_provider, address_id } = req.body;

      const shoppingCart = await ShoppingCart.findOne<any>({
        where: { user_id: userId },
      });

      const cartItems = await CartItem.findAll({
        where: { cart_id: shoppingCart.cart_id },
        include: [{ model: Product }],
      });

      if (!shoppingCart || cartItems.length === 0) {
        return res.status(404).json({ code: 404, error: "Cart is empty" });
      }

      let total = 0;
      for (const cartItem of cartItems) {
        total += cartItem.quantity * cartItem.product.product_price;
      }

      const randomThreeDigit = Math.floor(Math.random() * 1000);
      const transferAmount = total + randomThreeDigit;

      const orderCreationDate = new Date();
      const paymentDeadline = new Date(
        orderCreationDate.getTime() + 24 * 60 * 60 * 1000,
      );

      const paymentDetails = await PaymentDetails.create<any>({
        amount: total,
        transfer_amount: transferAmount,
        provider: payment_provider,
        payment_deadline: paymentDeadline,
      }).catch((error) => {
        console.error("Error creating payment details:", error);
        res
          .status(500)
          .json({ code: 500, error: "Internal Server Error (payment)" });
      });

      const generateRandomId = () => {
        const shortTimestamp = Math.floor(Date.now() / 1000); // Convert timestamp to seconds instead of milliseconds
        const randomPart = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit random number
        return `${shortTimestamp}${randomPart}`;
      };

      const order = await Order.create<any>({
        user_id: userId,
        order_number: "STLXE" + generateRandomId(),
        payment_id: paymentDetails.payment_details_id,
        address_id: address_id,
        total: total,
        order_status: "pending",
      }).catch((error) => {
        console.error("Error creating order:", error);
        res
          .status(500)
          .json({ code: 500, error: "Internal Server Error (order)" });
      });

      for (const cartItem of cartItems) {
        await OrderItem.create<any>({
          order_id: order.order_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          size: cartItem.size,
        }).catch((error) => {
          console.error("Error creating order item:", error);
          res
            .status(500)
            .json({ code: 500, error: "Internal Server Error (order item)" });
        });
      }

      // Clear the shopping cart
      await CartItem.destroy({ where: { cart_id: shoppingCart.cart_id } });

      res.status(200).json({
        code: 200,
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  },
);

//update payment status and order status
router.put(
  "/order-status/:orderId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (!orderId) {
        return res.status(400).json({ code: 400, error: "Invalid order ID" });
      }

      const { userId } = getUserIdFromToken(req, res);

      const order = await Order.findOne<any>({
        where: { order_id: orderId },
        include: [{ model: PaymentDetails }],
      });

      if (!order) {
        return res.status(404).json({ code: 404, error: "Order not found" });
      }

      if (order.user_id !== userId) {
        return res.status(403).json({
          code: 403,
          error: "You are not authorized to update this order",
        });
      }

      const { payment_status, order_status } = req.body;

      // Find the associated payment details
      const payment = await PaymentDetails.findOne<any>({
        where: { payment_details_id: order.payment_id },
      });

      // Update payment status if provided
      if (req.body.payment_status) {
        payment.payment_status = payment_status;
        await payment.save();
      }

      // Update order status if provided
      if (req.body.order_status) {
        order.order_status = order_status;
        await order.save();
      }

      res
        .status(200)
        .json({ code: 200, message: "Order updated successfully" });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  },
);

//view all orders
router.get("/view-orders", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    const orders = await Order.findAll<any>({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, include: [{ model: ProductImage }] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ code: 200, data: orders });
  } catch (error) {
    console.error("Error viewing orders:", error);
    res.status(500).json({ code: 500, error: "Internal Server Error" });
  }
});

//delete order
router.delete(
  "/delete-order/:orderId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { userId } = getUserIdFromToken(req, res);

      const order = await Order.findOne<any>({
        where: { order_id: orderId, user_id: userId },
      });

      if (!order) {
        return res.status(404).json({ code: 404, error: "Order not found" });
      }

      await OrderItem.destroy({ where: { order_id: orderId } });
      await PaymentDetails.destroy({
        where: { payment_details_id: order.payment_id },
      });

      await order.destroy();

      res
        .status(200)
        .json({ code: 200, message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  },
);

//view single order
router.get(
  "/view-order/:orderId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (!orderId) {
        return res.status(400).json({ code: 400, error: "Invalid order ID" });
      }

      const { userId } = getUserIdFromToken(req, res);

      const order = await Order.findOne<any>({
        where: { order_id: orderId, user_id: userId },
        include: [
          {
            model: OrderItem,
            include: [{ model: Product, include: [{ model: ProductImage }] }],
          },
          { model: PaymentDetails },
          { model: UserAddress },
        ],
      });

      if (!order) {
        return res.status(404).json({ code: 404, error: "Order not found" });
      }

      res.status(200).json({ code: 200, data: order });
    } catch (error) {
      console.error("Error viewing order:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  },
);

router.put(
  "/cancel-order/:orderId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (!orderId) {
        return res.status(400).json({ code: 400, error: "Invalid order ID" });
      }

      const { userId } = getUserIdFromToken(req, res);

      // Find the order by its ID
      const order = await Order.findOne<any>({
        where: { order_id: orderId, user_id: userId },
        include: [
          { model: OrderItem, include: [{ model: Product }] },
          { model: PaymentDetails },
        ],
      });

      if (!order) {
        return res.status(404).json({ code: 404, error: "Order not found" });
      }

      // Update payment status, shipping status, and order status to "Cancelled"
      await Promise.all([
        order.payment_details.update({ payment_status: "Cancelled" }),
        order.shipping_details.update({ shipping_status: "Cancelled" }),
        order.update({ status: "Cancelled" }),
      ]);

      // Restore product stock
      for (const orderItem of order.order_items) {
        const product = orderItem.product;
        if (product) {
          await product.increment("product_stock", { by: orderItem.quantity });
        }
      }

      res.status(200).json({
        code: 200,
        message: "Order cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  },
);

router.get(
  "/get-orders-due-for-payment",
  async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const overduePayment = await Order.findAll({
        where: {
          order_status: "pending",
        },
        include: [
          {
            model: PaymentDetails,
            where: {
              payment_status: "pending",
              payment_deadline: {
                [Op.lt]: now,
              },
            },
          },
        ],
      });

      res.status(200).json({ code: 200, data: overduePayment });
    } catch (error) {
      console.error("Error setting payment status failed:", error);
    }
  },
);

export default router;
