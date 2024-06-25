import { CronJob } from "cron";
import { Op } from "sequelize";
import { Conversation } from "../models/conversation";
import { StylistBooking } from "../models/booking";
import { Stylist } from "../models/stylists";
import { PaymentDetails } from "../models/orders";

const setConversationStatusClosed = async () => {
  const now = new Date();

  const closedBookings = await StylistBooking.findAll<any>({
    where: {
      status: "on going",
    },
    include: [
      {
        model: Conversation,
        where: {
          conversation_status: "open",
          end_time: {
            [Op.lt]: now,
          },
        },
      },
      {
        model: PaymentDetails,
      },
      {
        model: Stylist,
      },
    ],
  });

  if (closedBookings.length > 0) {
    for (const booking of closedBookings) {
      const conversation = booking.conversation;
      const paymentDetails = booking.payment_details;
      const stylist = booking.stylist;

      if (conversation) {
        conversation.conversation_status = "closed";
        await conversation.save();
      }

      if (stylist && paymentDetails && paymentDetails.amount != null) {
        stylist.balance += paymentDetails.amount;
        await stylist.save();
      }

      booking.status = "done";
      await booking.save();
    }
  }

  console.log("Set conversation status closed by cron job");
};

const conversationJob = new CronJob(
  "* * * * *",
  setConversationStatusClosed,
  null,
  false,
);

export const startConversationCronJobs = () => {
  conversationJob.start();
};
