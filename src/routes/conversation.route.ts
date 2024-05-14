import express, { Request, Response } from "express";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";
import { Participant, Conversation, Message } from "../models/conversation";
import { User } from "../models/users";
import { io } from "../main";

const router = express.Router();

//create conversation and add participants
router.post("/create", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    if (!userId) {
      return res.status(401).json({ message: "Invalid token." });
    }

    const { start_time, end_time, participants } = req.body;

    // Create a conversation
    const conversation = await Conversation.create<any>({
      start_time,
      end_time,
    });

    await Promise.all(
      participants.map(async (participant: any) => {
        await Participant.create<any>({
          conversation_id: conversation.conversation_id,
          user_id: participant.user_id,
        });
      }),
    );

    io.emit("conversation", { code: 201, data: conversation });

    res.status(201).json({ code: 201, data: conversation });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
});

//get all conversations by user id
router.get("/all", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    if (!userId) {
      return res.status(401).json({ message: "Invalid token." });
    }

    const conversations = await Participant.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Conversation,
          include: [
            {
              model: Participant,
              include: [
                {
                  model: User,
                  attributes: ["first_name", "last_name", "profile_picture"],
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({ code: 200, data: conversations });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
});

//get conversation by conversation id
router.get(
  "/:conversationId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);

      if (!userId) {
        return res.status(401).json({ message: "Invalid token." });
      }

      const { conversationId } = req.params;

      const conversation = await Conversation.findOne({
        where: { conversation_id: conversationId },
        include: [
          {
            model: Participant,
            include: [
              {
                model: User,
                attributes: ["first_name", "last_name", "profile_picture"],
              },
            ],
          },
          {
            model: Message,
            include: [
              {
                model: Participant,
                include: [
                  {
                    model: User,
                    attributes: ["first_name", "last_name", "profile_picture"],
                  },
                ],
              },
            ],
          },
        ],
      });

      res.status(200).json({ code: 200, data: conversation });
    } catch (error) {
      res.status(500).json({ code: 500, message: "Internal server error" });
    }
  },
);

//post message
router.post(
  "/:conversationId/message",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);

      if (!userId) {
        return res.status(401).json({ message: "Invalid token." });
      }

      const { conversationId } = req.params;

      const { message } = req.body;

      const conversation = await Conversation.findOne({
        where: { conversation_id: conversationId },
      });

      if (!conversation) {
        return res
          .status(404)
          .json({ code: 404, message: "Conversation not found" });
      }

      const newMessage = await Message.create<any>({
        conversation_id: conversationId,
        participant_id: userId,
        message_text: message,
      });

      io.emit("message", { conversationId, code: 201, data: newMessage });

      res.status(201).json({ code: 201, data: newMessage });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
);

export default router;
