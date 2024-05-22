import express, { Request, Response } from "express";
import { User, UserAddress, UserCoins } from "../models/users";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";
import { Order, OrderItem, PaymentDetails } from "../models/orders";
import { Product, ProductImage } from "../models/products";
import { StylistBooking } from "../models/booking";
import { Stylist, StylistImage } from "../models/stylists";
import moment from "moment";

const router = express.Router();

//get all users
router.get("/all", async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ code: 200, users });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile
router.get("/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    if (!userId) {
      return res.status(401).json({ message: "Invalid token." });
    }

    const userProfile = await User.findOne({ where: { user_id: userId } });

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    res.status(200).json({
      code: 200,
      message: "User profile retrieved successfully",
      data: userProfile,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update user profile
router.put("/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    if (!userId) {
      return res.status(401).json({ message: "Invalid token." });
    }

    const user = await User.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedUser = await User.update(req.body, {
      where: { user_id: userId },
    });

    res.status(200).json({
      code: 200,
      message: "User profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: "Internal server error",
      error: error.message,
    });
  }
});

// update profile image
router.post(
  "/profile/image",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);

      if (!userId) {
        return res.status(401).json({ message: "Invalid token." });
      }

      const user = await User.findOne({ where: { user_id: userId } });

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const { profile_picture } = req.body;

      if (!profile_picture) {
        return res.status(400).json({ message: "Image is required." });
      }

      const updatedUser = await User.update(
        { profile_picture },
        { where: { user_id: userId } },
      );

      res.status(200).json({
        code: 200,
        message: "Profile image updated successfully",
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Create user address
router.post(
  "/address",
  verifyToken,
  async (req: Request<{}, {}, UserAddress>, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const {
        country,
        city,
        province,
        district,
        postal_code,
        telephone,
        mobile,
        receiver_name,
        address,
        name,
      } = req.body;

      const existingAddress = await UserAddress.findOne({
        where: { user_id: userId },
      });

      const addAddress = await UserAddress.create<any>({
        user_id: userId,
        country,
        city,
        postal_code,
        province,
        district,
        telephone,
        mobile,
        receiver_name,
        address,
        name,
        is_primary: existingAddress ? false : true,
      });

      res.status(201).json({
        code: 201,
        status: "success",
        message: "Address created successfully",
        data: addAddress,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

router.put(
  "/address-primary/:address_id",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const addressId = req.params.address_id;

      // Find the current primary address
      const currentPrimaryAddress = await UserAddress.findOne<any>({
        where: { user_id: userId, is_primary: true },
      });

      // If there's a current primary address, set it to false
      if (currentPrimaryAddress) {
        await UserAddress.update(
          { is_primary: false },
          { where: { address_id: currentPrimaryAddress.address_id } },
        );
      }

      // Set the new address as primary
      const updatedAddress = await UserAddress.update(
        { is_primary: true },
        { where: { address_id: addressId, user_id: userId } },
      );

      res.status(200).json({
        code: 200,
        status: "success",
        message: "Address set as primary successfully",
        data: updatedAddress,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Get user address
router.get("/address", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    const address = await UserAddress.findAll({
      where: { user_id: userId },
      order: [["is_primary", "DESC"]],
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Address retrieved successfully",
      data: address,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update user address
router.put(
  "/address/:address_id",
  verifyToken,
  async (req: Request, res: Response) => {
    const address_id = req.params.address_id;
    try {
      const { userId } = getUserIdFromToken(req, res);

      const address_user = await UserAddress.findOne<any>({
        where: {
          user_id: userId,
          address_id: address_id,
        },
      });

      if (!address_user) {
        return res.status(404).json({
          code: 404,
          status: "Not Found",
          message: "Address not found",
        });
      }

      if (address_user && address_user.user_id === userId) {
        const address = await UserAddress.update(req.body, {
          where: {
            address_id: address_id,
          },
        });

        res.status(200).json({
          code: 200,
          status: "success",
          message: "Address updated successfully",
          address,
        });
      } else {
        return res.status(401).json({
          code: 401,
          status: "Unauthorized",
          message: "Unauthorized",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Delete address
router.delete(
  "/address/:address_id",
  verifyToken,
  async (req: Request, res: Response) => {
    const address_id = req.params.address_id;

    try {
      const { userId } = getUserIdFromToken(req, res);

      const address_user = await UserAddress.findOne<any>({
        where: {
          user_id: userId,
          address_id: address_id,
        },
      });

      if (!address_user) {
        return res.status(404).json({
          code: 404,
          status: "Not Found",
          message: "Address not found",
        });
      }

      if (address_user && address_user.user_id === userId) {
        const address = await UserAddress.destroy({
          where: {
            address_id: address_id,
          },
        });
        res.status(200).json({
          code: 200,
          status: "success",
          message: "Address deleted successfully",
        });
      } else {
        res.status(401).json({
          code: 401,
          status: "Unauthorized",
          message: "Not Authorized",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

// Combine and sort orders and bookings
router.get(
  "/all-activity",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);

      if (!userId) {
        return res.status(401).json({ code: 401, message: "Invalid token." });
      }

      // Fetch orders
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

      // Fetch bookings
      const bookings = await StylistBooking.findAll<any>({
        where: { customer_id: userId },
        include: [
          {
            model: Stylist,
            include: [
              {
                model: User,
              },
              {
                model: StylistImage,
              },
            ],
          },
          {
            model: PaymentDetails,
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const combined = [...orders, ...bookings].sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      res.status(200).json({ code: 200, data: combined });
    } catch (error) {
      console.error("Error fetching orders and bookings:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  },
);

// Route to get all coins for a user
router.get("/coins", async (req, res) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    if (!userId) {
      return res.status(401).json({ code: 401, message: "Invalid token." });
    }

    const userCoins = await UserCoins.findOne<any>({
      where: { user_id: userId },
    });

    if (!userCoins) {
      return res
        .status(404)
        .json({ code: 404, message: "No coins found for this user" });
    }

    const differenceDay = moment().diff(userCoins.last_claim_date, "days");

    if (differenceDay > 1 && userCoins.claim_day.startsWith("day")) {
      userCoins.claim_day = "day 1";
      await userCoins.save();
    }

    res.status(200).json({ code: 200, data: userCoins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Server error" });
  }
});

// Route to claim coins for a user
router.put("/coin/claim", async (req, res) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    if (!userId) {
      return res.status(401).json({ code: 401, message: "Invalid token." });
    }

    const { coin_amount, last_claim_date, claim_day } = req.body;

    const existingRecord = await UserCoins.findOne<any>({
      where: { user_id: userId },
    });

    if (existingRecord) {
      existingRecord.coin_amount = coin_amount;
      existingRecord.last_claim_date = last_claim_date;
      existingRecord.claim_day = claim_day;
      await existingRecord.save();
    } else {
      await UserCoins.create<any>({
        user_id: userId,
        coin_amount,
        last_claim_date,
        claim_day,
      });
    }

    res.status(201).json({ code: 201, message: "Coins claimed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Server error" });
  }
});

export default router;
