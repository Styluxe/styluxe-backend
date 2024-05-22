import Midtrans from "midtrans-client";
import express, { Request, Response } from "express";

const router = express.Router();

const snap = new Midtrans.Snap({
  clientKey: "SB-Mid-client-yvHTm6DcLb8RqO5s",
  isProduction: false,
  serverKey: "SB-Mid-server-yvzstT7fW_iiMLxPdcco1Phk",
});

router.post("/transaction", async (req: Request, res: Response) => {
  try {
    const { id, price, first_name, last_name, email, phone } = req.body;

    const parameter = {
      transaction_details: {
        order_id: id,
        gross_amount: price,
      },
      customer_details: {
        first_name,
        last_name,
        email,
        phone,
      },
    };

    const snapToken = await snap.createTransaction(parameter);

    res.status(200).json({ code: 200, message: "success", token: snapToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: "Failed to create transaction token",
    });
  }
});

export default router;
