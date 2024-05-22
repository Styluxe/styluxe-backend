import { CronJob } from "cron";
import { Op } from "sequelize";
import moment from "moment";
import { Conversation } from "../models/conversation";
import { StylistBooking } from "../models/booking";

const setConversationStatusClosed = async () => {
  const now = new Date();

  const closedBooking = await StylistBooking.findAll<any>({
    where: {
      status: "scheduled",
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
    ],
  });

  if (closedBooking.length > 0) {
    for (const booking of closedBooking) {
      booking.status = "done";
      await booking.save();

      const conversation = booking.conversation;

      if (conversation) {
        conversation.conversation_status = "closed";
        await conversation.save();
      }
    }
  }

  console.log("Set conversation status closed by cron job");
};

const conversationjob = new CronJob(
  "* * * * *",
  setConversationStatusClosed,
  null,
  false,
);

export const startConversationCronJobs = () => {
  conversationjob.start();
};
