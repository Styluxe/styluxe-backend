// cronJobs.js
import { CronJob } from "cron";
import { Op } from "sequelize";
import { Order, PaymentDetails } from "../models/orders";
import { StylistBooking } from "../models/booking";
import moment from "moment";

// Set payment status failed and order canceled by cron job
const setOrderPaymentStatusFailed = async () => {
  const now = new Date();
  const overdueOrders = await Order.findAll({
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

  if (overdueOrders.length > 0) {
    for (const order of overdueOrders) {
      const paymentDetails = order.payment_details;

      if (paymentDetails) {
        paymentDetails.payment_status = "failed";
        await paymentDetails.save();
      }

      order.order_status = "cancelled";
      await order.save();
    }
  }

  console.log("Set payment status failed and order canceled by cron job");
};

const setBookingStatusFailed = async () => {
  const now = new Date();
  const overdueBookings = await StylistBooking.findAll({
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

  if (overdueBookings.length > 0) {
    for (const booking of overdueBookings) {
      const paymentDetails = booking.payment_details;

      if (paymentDetails) {
        paymentDetails.payment_status = "failed";
        await paymentDetails.save();
      }

      booking.status = "cancelled";
      await booking.save();
    }
  }

  console.log("Set booking status failed and booking canceled by cron job");
};

const setBookingStatusScheduled = async () => {
  const acceptedBookings = await StylistBooking.findAll<any>({
    where: {
      status: "accepted",
    },
  });

  const now = new Date();

  const scheduledBookings = acceptedBookings.filter((booking) => {
    const bookingEndDate = `${booking.booking_date}T${booking.booking_time}:00+07:00`;

    return moment(bookingEndDate).isBefore(moment(now));
  });

  if (scheduledBookings.length > 0) {
    for (const booking of scheduledBookings) {
      booking.status = "scheduled";
      await booking.save();
    }
  }

  console.log("Set booking status scheduled by cron job");
};

// Create the cron job but do not start it immediately
const Orderjob = new CronJob(
  "* * * * *",
  setOrderPaymentStatusFailed,
  null,
  false,
);

const Bookingjob = new CronJob(
  "* * * * *",
  setBookingStatusFailed,
  null,
  false,
);

const BookingScheduledJob = new CronJob(
  "* * * * *",
  setBookingStatusScheduled,
  null,
  false,
);

export const startOrderPaymentCronJobs = () => {
  Orderjob.start();
  Bookingjob.start();
  BookingScheduledJob.start();
};
