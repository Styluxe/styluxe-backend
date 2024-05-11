import express, { Request, Response } from "express";
import { User, UserAddress } from "../models/users";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";

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
        { where: { user_id: userId } }
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
  }
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
        postal_code,
        telephone,
        mobile,
        receiver_name,
        address,
        name,
      } = req.body;

      const addAddress = await UserAddress.create<any>({
        user_id: userId,
        country,
        city,
        postal_code,
        telephone,
        mobile,
        receiver_name,
        address,
        name,
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
  }
);

// Get user address
router.get("/address", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    const address = await UserAddress.findAll({
      where: { user_id: userId },
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
  }
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
  }
);

export default router;
