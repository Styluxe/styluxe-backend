import express, { Request, Response } from "express";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";
import { BookingDetails, StylistBooking } from "../models/booking";
import { PaymentDetails } from "../models/orders";
import { Stylist, StylistImage } from "../models/stylists";
import { User } from "../models/users";
import { Op } from "sequelize";
import { Conversation, Participant } from "../models/conversation";

const router = express.Router();

//create booking
router.post("/new", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    const { stylist_id, booking_time, booking_date, amount, provider } =
      req.body;

    if (!userId) {
      return res.status(401).json({ code: 401, message: "Invalid token." });
    }

    const generateRandomId = () => {
      const shortTimestamp = Math.floor(Date.now() / 1000); // Convert timestamp to seconds instead of milliseconds
      const randomPart = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit random number
      return `${shortTimestamp}${randomPart}`;
    };

    const createBooking = await StylistBooking.create<any>({
      booking_number: "STLST" + generateRandomId(),
      stylist_id,
      customer_id: userId,
      status: "pending",
    });

    const randomThreeDigit = Math.floor(Math.random() * 1000);
    const transferAmount = amount + randomThreeDigit;

    const orderCreationDate = new Date();
    const paymentDeadline = new Date(
      orderCreationDate.getTime() + 30 * 60 * 1000,
    );

    if (createBooking) {
      const paymentDetails = await PaymentDetails.create<any>({
        amount,
        transfer_amount: transferAmount,
        provider,
        payment_deadline: paymentDeadline,
      });

      const createBookingDetails = await BookingDetails.create<any>({
        booking_id: createBooking.booking_id,
        booking_time,
        booking_date,
        payment_id: paymentDetails.payment_details_id,
      });

      res.status(200).json({
        code: 200,
        message: "Booking created successfully",
        data: createBooking,
      });
    }

    if (!createBooking) {
      return res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "Failed to create booking.",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//get all booking by stylist_id no verify
router.get("/stylist/:stylistId", async (req: Request, res: Response) => {
  try {
    const { stylistId } = req.params;

    const bookings = await StylistBooking.findAll<any>({
      where: { stylist_id: stylistId },
      include: [
        {
          model: BookingDetails,
        },
      ],
    });

    res.status(200).json({
      code: 200,
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//get booking by id
router.get(
  "/details/:bookingId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const { bookingId } = req.params;

      const bookingDetails = await StylistBooking.findOne<any>({
        where: { booking_id: bookingId, customer_id: userId },
        include: [
          {
            model: Stylist,
            include: [
              {
                model: User,
              },
            ],
          },
          {
            model: BookingDetails,
            include: [
              {
                model: PaymentDetails,
              },
            ],
          },
          {
            model: User,
          },
        ],
      });

      if (!bookingDetails) {
        return res.status(404).json({ code: 404, error: "Booking not found" });
      }

      res.status(200).json({ code: 200, data: bookingDetails });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

//get all bookings
router.get(
  "/view-bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);

      if (!userId) {
        return res.status(401).json({ code: 401, message: "Invalid token." });
      }

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
            model: BookingDetails,
            include: [
              {
                model: PaymentDetails,
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({ code: 200, data: bookings });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

//update payment status and booking status
router.put(
  "/update-status/:bookingId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const { bookingId } = req.params;
      const { payment_status, booking_status } = req.body;

      console.log("payment", payment_status);

      if (!userId) {
        return res.status(401).json({ code: 401, message: "Invalid token." });
      }

      const booking = await StylistBooking.findOne<any>({
        where: { booking_id: bookingId },
        include: [
          {
            model: BookingDetails,
            include: [
              {
                model: PaymentDetails,
              },
            ],
          },
          {
            model: Stylist,
          },
          {
            model: User,
          },
        ],
      });

      if (!booking) {
        return res.status(404).json({ code: 404, error: "Booking not found" });
      }

      const { payment_details_id } = booking.booking_details.payment_details;

      const payment = await PaymentDetails.findOne<any>({
        where: { payment_details_id },
      });

      if (!payment) {
        return res.status(404).json({ code: 404, error: "Payment not found" });
      }

      if (payment_status) {
        payment.payment_status = payment_status;
        await payment.save();
      }

      if (booking_status) {
        booking.status = booking_status;
        await booking.save();
      }

      res.status(200).json({ code: 200, data: booking });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

//stylist accept status
// Update the /accept-booking route to handle booking acceptance
router.put(
  "/accept-booking/:bookingId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const { bookingId } = req.params;

      const { start_time, end_time } = req.body;

      if (!userId) {
        return res.status(401).json({ code: 401, message: "Invalid token." });
      }

      const booking = await StylistBooking.findOne<any>({
        where: { booking_id: bookingId },
        include: [
          {
            model: BookingDetails,
          },
          {
            model: Stylist,
            include: [
              {
                model: User,
              },
            ],
          },
          {
            model: User,
          },
        ],
      });

      if (!booking) {
        return res.status(404).json({ code: 404, error: "Booking not found" });
      }

      booking.status = "accepted";
      await booking.save();

      // Create a new conversation entry for the accepted booking
      const newConversation = await Conversation.create<any>({
        booking_id: bookingId,
        start_time: booking.booking_details.booking_time,
        end_time: booking.booking_details.booking_time,
      });

      // Add participants to the conversation (stylist and customer)
      await Participant.bulkCreate<any>([
        {
          conversation_id: newConversation.conversation_id,
          user_id: booking.stylist.user.user_id,
        },
        {
          conversation_id: newConversation.conversation_id,
          user_id: booking.customer.user_id,
        },
      ]);

      res
        .status(200)
        .json({ code: 200, message: "Booking accepted successfully" });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

//get all bookings by stylist_id where order.status is not pending and order.status is not cancelled alos sort by booking_date desc
router.get(
  "/active-bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);

      if (!userId) {
        return res.status(401).json({ code: 401, message: "Invalid token." });
      }

      const stylist = await Stylist.findOne<any>({
        where: { user_id: userId },
      });

      if (!stylist) {
        return res.status(404).json({ code: 404, error: "Stylist not found" });
      }

      const bookings = await StylistBooking.findAll<any>({
        where: {
          stylist_id: stylist.stylist_id,
          status: {
            [Op.notIn]: ["pending", "cancelled"],
          },
        },
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
            model: BookingDetails,
            include: [
              {
                model: PaymentDetails,
              },
            ],
          },
          {
            model: User,
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({ code: 200, data: bookings });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

router.get(
  "/user-active-bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);

      if (!userId) {
        return res.status(401).json({ code: 401, message: "Invalid token." });
      }

      const bookings = await StylistBooking.findAll<any>({
        where: {
          customer_id: userId,
          status: {
            [Op.notIn]: ["pending", "cancelled", "waiting for confirmation"],
          },
        },
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
            model: BookingDetails,
            include: [
              {
                model: PaymentDetails,
              },
            ],
          },
          {
            model: User,
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({ code: 200, data: bookings });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

export default router;
