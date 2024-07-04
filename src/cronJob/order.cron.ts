// cronJobs.js
import { CronJob } from "cron";
import { Op, Sequelize } from "sequelize";
import { Order, OrderItem, PaymentDetails } from "../models/orders";
import { StylistBooking } from "../models/booking";
import moment from "moment";
import { Product, ProductSize } from "../models/products";
import connection from "../db/connection";

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
      {
        model: OrderItem,
        include: [{ model: Product }],
      },
    ],
  });

  if (overdueOrders.length > 0) {
    for (const order of overdueOrders) {
      const transaction = await connection.transaction();

      try {
        const paymentDetails = order.payment_details;

        if (paymentDetails) {
          paymentDetails.payment_status = "failed";
          await paymentDetails.save({ transaction });
        }

        order.order_status = "cancelled";
        await order.save({ transaction });

        // Update stock for each order item
        for (const orderItem of order.order_items) {
          const productSize = await ProductSize.findOne({
            where: {
              product_id: orderItem.product_id,
              size: orderItem.size,
            },
            transaction,
          });

          if (productSize) {
            await productSize.update(
              {
                stock: Sequelize.literal(`stock + ${orderItem.quantity}`),
              },
              { transaction },
            );
          }
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        console.error(
          "Error setting payment status to failed and cancelling order:",
          error,
        );
      }
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
      status: "scheduled",
    },
  });

  const now = new Date();

  const scheduledBookings = acceptedBookings.filter((booking) => {
    const bookingEndDate = `${booking.booking_date}T${booking.booking_time}:00+07:00`;

    return moment(bookingEndDate).isBefore(moment(now));
  });

  if (scheduledBookings.length > 0) {
    for (const booking of scheduledBookings) {
      booking.status = "on going";
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
