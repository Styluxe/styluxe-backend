import express, { Request, Response } from "express";
import { Follower, Following, User, UserAddress } from "../models/users";
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
      } = req.body;

      const addAddress = await UserAddress.create({
        user_id: userId,
        country,
        city,
        postal_code,
        telephone,
        mobile,
        receiver_name,
        address,
      } as UserAddress);

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

      const address_user = await UserAddress.findOne({
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

      const address_user = await UserAddress.findOne({
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

//following other user
router.post(
  "/follow/:user_id",
  verifyToken,
  async (req: Request, res: Response) => {
    const { userId } = getUserIdFromToken(req, res); //auth user

    const followerId = parseInt(req.params.user_id); //user to follow

    try {
      const existingFollow = await Following.findOne({
        where: {
          user_id: followerId,
          following_user_id: userId,
        },
      });

      if (existingFollow) {
        return res
          .status(400)
          .json({ message: "You are already following this user" });
      }

      const followUser = await Following.create({
        user_id: followerId,
        following_user_id: userId,
      } as Following);

      const existingFollower = await Follower.findOne({
        where: {
          user_id: userId,
          follower_user_id: followerId,
        },
      });

      if (!existingFollower) {
        await Follower.create({
          user_id: userId,
          follower_user_id: followerId,
        } as Follower);
      }

      res
        .status(201)
        .json({ code: 201, message: "User followed successfully", followUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

//unfollow other user
router.delete(
  "/unfollow/:user_id",
  verifyToken,
  async (req: Request, res: Response) => {
    const { userId } = getUserIdFromToken(req, res);
    const followingId = parseInt(req.params.user_id);

    try {
      const unfollowUser = await Following.destroy({
        where: {
          user_id: followingId,
          following_user_id: userId,
        },
      });

      await Follower.destroy({
        where: {
          user_id: userId,
          follower_user_id: followingId,
        },
      });

      res.status(200).json({
        code: 200,
        message: "User Unfollowed succesfully",
        unfollowUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get followers of the authenticated user
router.get("/followers", verifyToken, async (req: Request, res: Response) => {
  const { userId } = getUserIdFromToken(req, res);

  try {
    const followers = await Follower.findAll({
      where: { user_id: userId },
      include: [{ model: User, as: "followerUser" }], // Include the follower details
    });

    if (followers.length === 0)
      return res.status(404).json({ message: "No followers found" });

    res.status(200).json({ code: 200, followers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get following of the authenticated user
router.get("/following", verifyToken, async (req: Request, res: Response) => {
  const { userId } = getUserIdFromToken(req, res);
  try {
    const following = await Following.findAll({
      where: { user_id: userId },
      include: [{ model: User, as: "followingUser" }],
    });
    res.status(200).json({ code: 200, following });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get followers of another user
router.get(
  "/followers/:user_id",
  verifyToken,
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.user_id);
    try {
      const followers = await Follower.findAll({
        where: { user_id: userId },
        include: [{ model: User, as: "followerUser" }],
      });
      res.status(200).json({ code: 200, followers });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get following of another user
router.get(
  "/following/:user_id",
  verifyToken,
  async (req: Request, res: Response) => {
    const userId = req.params.user_id;
    try {
      const following = await Following.findAll({
        where: { user_id: userId },
        include: [{ model: User, as: "followingUser" }],
      });
      res.status(200).json({ code: 200, following });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
