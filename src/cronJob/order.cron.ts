// cronJobs.js
import { CronJob } from "cron";
import { Op } from "sequelize";
import { Order, PaymentDetails } from "../models/orders";
import { StylistBooking } from "../models/booking";

// Set payment status failed and order canceled by cron job
export const setPaymentStatusFailed = async () => {
  const now = new Date();
  const overduePayment = await PaymentDetails.findAll({
    where: {
      payment_status: "pending",
      payment_deadline: {
        [Op.lt]: now,
      },
    },
    include: Order,
  });

  for (const payment of overduePayment) {
    const order = payment.order;
    if (order) {
      await order.update({ status: "cancelled" });
      await payment.update({ payment_status: "failed" });
    }
  }
  console.log("Set payment status failed and order canceled by cron job");
};

// Create the cron job but do not start it immediately
const job = new CronJob("* * * * *", setPaymentStatusFailed, null, false);

export const startOrderPaymentCronJobs = () => {
  job.start();
};
