import express, { Request, Response } from "express";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";
import { StylistBooking } from "../models/booking";
import { PaymentDetails } from "../models/orders";
import { Stylist, StylistImage, StylistReview } from "../models/stylists";
import { User } from "../models/users";
import { Op } from "sequelize";
import { Conversation, Participant } from "../models/conversation";
import moment from "moment";

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
      booking_time,
      booking_date,
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

      if (paymentDetails) {
        createBooking.payment_id = paymentDetails.payment_details_id;
        await createBooking.save();

        res.status(200).json({
          code: 200,
          message: "Booking created successfully",
          data: createBooking,
        });
      } else {
        res.status(500).json({
          code: 500,
          status: "Internal Server Error",
          message: "Failed to create payment details.",
        });
      }
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
            model: PaymentDetails,
          },
          {
            model: User,
          },
          {
            model: Conversation,
            attributes: ["conversation_id"],
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
            model: PaymentDetails,
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

      if (!userId) {
        return res.status(401).json({ code: 401, message: "Invalid token." });
      }

      const booking = await StylistBooking.findOne<any>({
        where: { booking_id: bookingId },
        include: [
          {
            model: PaymentDetails,
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

      const { payment_details_id } = booking.payment_details;

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

      const fullDate = `${booking?.booking_date}T${booking?.booking_time}:00+07:00`;

      const start_time = moment(fullDate).toISOString();
      const end_time = moment(fullDate).add(30, "minutes").toISOString();

      // Create a new conversation entry for the accepted booking
      const newConversation = await Conversation.create<any>({
        booking_id: bookingId,
        start_time: start_time,
        end_time: end_time,
        conversation_status: "open",
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
            model: PaymentDetails,
          },
          {
            model: User,
          },
          {
            model: StylistReview,
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
            model: PaymentDetails,
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

//get overdue bookings
router.get("/overdue-bookings", async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const overduePayment = await StylistBooking.findAll<any>({
      where: {
        status: "pending",
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
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//get scheduled bookings
router.get("/scheduled", verifyToken, async (req: Request, res: Response) => {
  try {
    const bookings = await StylistBooking.findAll<any>({
      where: {
        status: "accepted",
      },
    });

    if (!bookings) {
      return res.status(404).json({ code: 404, message: "Booking not found" });
    }

    const now = new Date();

    const scheduledBookings = bookings.filter((booking) => {
      const bookingDate = `${booking.booking_date}T${booking.booking_time}:00+07:00`;
      return moment(bookingDate).isBefore(moment(now));
    });

    if (scheduledBookings.length === 0) {
      return res
        .status(404)
        .json({ code: 404, message: "No scheduled bookings found" });
    }

    return res.status(200).json({
      code: 200,
      message: "Scheduled bookings retrieved successfully",
      bookings: scheduledBookings,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//end conversation and booking
router.put(
  "/end-booking/:bookingId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const { bookingId } = req.params;

      if (!userId) {
        return res.status(401).json({ code: 401, message: "Invalid token." });
      }

      const booking = await StylistBooking.findOne<any>({
        where: { booking_id: bookingId },
        include: [
          {
            model: Conversation,
          },
          {
            model: PaymentDetails,
          },
          {
            model: Stylist,
          },
        ],
      });

      if (!booking) {
        return res
          .status(404)
          .json({ code: 404, message: "Booking not found" });
      }

      const conversation = booking.conversation;
      if (!conversation) {
        return res
          .status(404)
          .json({ code: 404, message: "Conversation not found" });
      }

      if (conversation.conversation_status === "closed") {
        return res
          .status(400)
          .json({ code: 400, message: "Conversation already closed" });
      }

      //update stylist balance
      const paymentDetails = booking.payment_details;
      const stylist = booking.stylist;
      if (stylist && paymentDetails && paymentDetails.amount != null) {
        stylist.balance = parseInt(
          parseFloat(stylist.balance) + paymentDetails.amount,
        );
        await stylist.save();
      }

      await conversation.update({
        conversation_status: "closed",
        end_time: new Date(),
      });
      await booking.update({ status: "done" });
      res.status(200).json({ code: 200, message: "Conversation ended" });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

router.put(
  "/refund-booking/:bookingId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const { bookingId } = req.params;

      if (!userId) {
        return res.status(401).json({ code: 401, message: "Invalid token." });
      }

      const booking = await StylistBooking.findOne<any>({
        where: { booking_id: bookingId },
        include: [
          {
            model: Conversation,
          },
        ],
      });

      if (!booking) {
        return res
          .status(404)
          .json({ code: 404, message: "Booking not found" });
      }

      const conversation = booking.conversation;
      if (!conversation) {
        return res
          .status(404)
          .json({ code: 404, message: "Conversation not found" });
      }

      if (conversation.conversation_status === "closed") {
        return res
          .status(400)
          .json({ code: 400, message: "Conversation already closed" });
      }

      await conversation.update({
        conversation_status: "closed",
        end_time: new Date(),
      });
      await booking.update({ status: "refunded" });
      res.status(200).json({ code: 200, message: "Conversation ended" });
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
