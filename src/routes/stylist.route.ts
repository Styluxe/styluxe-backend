import express, { Request, Response } from "express";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";
import { Stylist } from "../models/stylists";

const router = express.Router();

//create stylist biodata
router.post("/new", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userRole } = getUserIdFromToken(req, res);

    if (userRole !== "admin") {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "You are not authorized to perform this action.",
      });
    }

    const { user_id, about, rating, price, type } = req.body;

    const createStylist = await Stylist.create(req.body);

    res.status(201).json({
      code: 201,
      message: "Stylist created successfully",
      data: createStylist,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});
