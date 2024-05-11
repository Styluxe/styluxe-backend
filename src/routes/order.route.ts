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
import { UUIDV4 } from "sequelize";

const router = express.Router();

//feature add to cart
router.post(
  "/add-to-cart",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const { product_id, quantity, size } = req.body;

      let shoppingCart = await ShoppingCart.findOne<any>({
        where: { user_id: userId },
        include: [{ model: CartItem, include: [{ model: Product }] }],
      });

      if (!shoppingCart) {
        shoppingCart = await ShoppingCart.create<any>({
          user_id: userId,
          total: 0,
        });
      }

      let cartItem = await CartItem.findOne({
        where: {
          cart_id: shoppingCart.cart_id,
          product_id: product_id,
        },
      });

      if (cartItem) {
        if (cartItem.size === size) {
          cartItem.quantity += quantity;
          await cartItem.save();
        } else {
          cartItem = await CartItem.create<any>({
            cart_id: shoppingCart.cart_id,
            product_id: product_id,
            quantity: quantity,
            size: size,
          });
        }
      } else {
        cartItem = await CartItem.create<any>({
          cart_id: shoppingCart.cart_id,
          product_id: product_id,
          quantity: quantity,
          size: size,
        });
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
  }
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
  }
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
      return res.status(404).json({ code: 404, error: "Cart is empty" });
    }

    res.status(200).json({ code: 200, data: shoppingCart });
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
  }
);

//feature create order from shopping cart and calculate total
router.post(
  "/create-order",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const { payment_provider, payment_type_id } = req.body;

      const shoppingCart = await ShoppingCart.findOne<any>({
        where: { user_id: userId },
      });

      const cartItems = await CartItem.findAll({
        where: { cart_id: shoppingCart.cart_id },
      });

      if (!shoppingCart || cartItems.length === 0) {
        return res.status(404).json({ code: 404, error: "Cart is empty" });
      }

      let total = 0;
      for (const cartItem of cartItems) {
        total += cartItem.quantity * cartItem.product.product_price;
      }

      const paymentDetails = await PaymentDetails.create<any>({
        amount: total,
        provider: payment_provider,
        payment_date: null,
        payment_type_id: payment_type_id,
      });

      // Create a new order
      const order = await Order.create<any>({
        user_id: userId,
        payment_id: paymentDetails.payment_details_id,
        total: total,
        status: "Pending", // Initial order status
      });

      // Create order items for each cart item
      for (const cartItem of cartItems) {
        await OrderItem.create<any>({
          order_id: order.order_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
        });
      }

      // Update product stock and create order items for each cart item
      for (const cartItem of cartItems) {
        // Update product stock
        const product = await Product.findByPk(cartItem.product_id);

        // Create order item
        await OrderItem.create<any>({
          order_id: order.order_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
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
  }
);

//view single order
router.get(
  "/view-order/:orderId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { userId } = getUserIdFromToken(req, res);

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

      res.status(200).json({ code: 200, data: order });
    } catch (error) {
      console.error("Error viewing order:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  }
);

router.put(
  "/cancel-order/:orderId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
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
  }
);

export default router;
