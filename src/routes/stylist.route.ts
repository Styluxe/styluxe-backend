import express, { Request, Response } from "express";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";
import {
  Stylist,
  StylistImage,
  StylistReview,
  StylistSchedule,
  StylistScheduleTime,
} from "../models/stylists";
import { User } from "../models/users";
import { Op, Sequelize } from "sequelize";

const router = express.Router();

//admin add user as stylist
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

    const { user_id } = req.body;

    const createStylist = await Stylist.create<any>({
      user_id,
    });

    const updateUserRole = await User.update<any>(
      {
        user_role: "stylist",
      },
      {
        where: { user_id },
      },
    );

    if (!createStylist || !updateUserRole) {
      return res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "Failed to create stylist.",
      });
    }

    res.status(201).json({
      code: 201,
      message: "Stylist created successfully",
      data: { createStylist },
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//update stylist profile
router.put("/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userRole, userId } = getUserIdFromToken(req, res);

    if (userRole !== "stylist") {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "You are not authorized to perform this action.",
      });
    }

    const { brand_name, about, price, type, images } = req.body;

    const updateStylist = await Stylist.update<any>(
      {
        brand_name,
        about,
        price,
        type,
      },
      {
        where: { user_id: userId },
      },
    );

    const getStylistId = await Stylist.findOne<any>({
      where: { user_id: userId },
    });

    if (images) {
      images.map(async (image: any) => {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "user_preset");
        formData.append("api_key", "761147494786172");

        fetch("https://api.cloudinary.com/v1_1/dkxeflvuu/image/upload", {
          method: "post",
          body: formData,
        }).then((data) => {
          data.json().then((result: any) => {
            StylistImage.create<any>({
              image_url: result.secure_url,
              stylist_id: getStylistId.stylist_id,
            });
          });
        });
      });
    }

    if (!updateStylist) {
      return res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "Failed to update stylist.",
      });
    }

    res.status(200).json({
      code: 200,
      message: "Stylist updated successfully",
      data: { updateStylist },
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//get authenticated stylist
router.get("/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    if (!userId) {
      return res.status(401).json({ code: 401, message: "Invalid token." });
    }

    const stylist = await Stylist.findOne({
      where: { user_id: userId },
      include: [
        { model: User, attributes: ["first_name", "last_name"] },
        {
          model: StylistImage,
        },
        {
          model: StylistSchedule,
          include: [{ model: StylistScheduleTime }],
        },
        {
          model: StylistReview,
        },
      ],
    });

    if (!stylist) {
      return res.status(404).json({ code: 404, message: "Stylist not found." });
    }

    res.status(200).json({ code: 200, data: stylist });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//set up stylist Time
router.post("/time", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userRole } = getUserIdFromToken(req, res);

    const { times, stylist_schedule_id } = req.body;

    if (userRole !== "stylist") {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "You are not authorized to perform this action.",
      });
    }

    const errors: string[] = [];
    const successfulTimes: any[] = [];

    await Promise.all(
      times.map(async (time: { time: string; status: string }) => {
        const timeExist = await StylistScheduleTime.findOne({
          where: { time: time.time, stylist_schedule_id: stylist_schedule_id },
        });

        if (timeExist) {
          errors.push(`Time ${time.time} already exists`);
        } else {
          const createdTime = await StylistScheduleTime.create<any>({
            stylist_schedule_id: stylist_schedule_id,
            time: time.time,
            status: time.status,
          });
          successfulTimes.push(createdTime);
        }
      }),
    );

    if (errors.length > 0) {
      return res.status(400).json({
        code: 400,
        status: "Bad Request",
        message: "Some times could not be added",
        errors: errors,
      });
    }

    res.status(201).json({
      code: 201,
      message: "Stylist schedule created successfully",
      data: successfulTimes,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//update stylist time
router.put(
  "/time/:stylistScheduleTimeId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userRole } = getUserIdFromToken(req, res);

      const { stylistScheduleTimeId } = req.params;
      const { time, status } = req.body;

      if (userRole !== "stylist") {
        return res.status(401).json({
          code: 401,
          status: "Unauthorized",
          message: "You are not authorized to perform this action.",
        });
      }

      const stylistScheduleTime = await StylistScheduleTime.findOne({
        where: { stylist_schedule_time_id: stylistScheduleTimeId },
      });

      if (!stylistScheduleTime) {
        return res.status(404).json({
          code: 404,
          status: "Not Found",
          message: "Stylist schedule not found.",
        });
      }

      const updatedStylistSchedule = await StylistScheduleTime.update(
        {
          time: time,
          status: status,
        },
        {
          where: { stylist_schedule_time_id: stylistScheduleTimeId },
        },
      );

      res.status(200).json({
        code: 200,
        message: "Stylist schedule updated successfully",
        data: updatedStylistSchedule,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

//delete stylist time
router.delete(
  "/time/:stylistScheduleTimeId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userRole } = getUserIdFromToken(req, res);

      const { stylistScheduleTimeId } = req.params;

      if (userRole !== "stylist") {
        return res.status(401).json({
          code: 401,
          status: "Unauthorized",
          message: "You are not authorized to perform this action.",
        });
      }

      const stylistScheduleTime = await StylistScheduleTime.findOne({
        where: { stylist_schedule_time_id: stylistScheduleTimeId },
      });

      if (!stylistScheduleTime) {
        return res.status(404).json({
          code: 404,
          status: "Not Found",
        });
      }

      const deletedStylistSchedule = await StylistScheduleTime.destroy({
        where: { stylist_schedule_time_id: stylistScheduleTimeId },
      });

      res.status(200).json({
        code: 200,
        message: "Stylist schedule deleted successfully",
        data: deletedStylistSchedule,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

//get schedule
router.get("/schedule", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userRole, userId } = getUserIdFromToken(req, res);

    if (userRole !== "stylist") {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "You are not authorized to perform this action.",
      });
    }

    const stylist = await Stylist.findOne<any>({
      where: { user_id: userId },
    });

    if (!stylist) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "Stylist not found.",
      });
    }

    let schedules = await StylistSchedule.findAll({
      where: { stylist_id: stylist.stylist_id },
      include: [{ model: StylistScheduleTime }],
    });

    if (schedules.length === 0) {
      console.log("No schedules found, creating new ones...");
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      const schedulePromises = days.map((day) =>
        StylistSchedule.create<any>({
          stylist_id: stylist.stylist_id,
          day: day,
        }),
      );

      schedules = await Promise.all(schedulePromises);

      // Re-fetch the schedules with the newly created ones
      schedules = await StylistSchedule.findAll({
        where: { stylist_id: stylist.stylist_id },
        include: [{ model: StylistScheduleTime }],
      });
    }

    res.status(200).json({ code: 200, data: schedules });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

const DAYS_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

//get schedule by stylist id
router.get("/schedule/:stylist_id", async (req: Request, res: Response) => {
  try {
    const { stylist_id } = req.params;

    const schedules = await StylistSchedule.findAll({
      where: { stylist_id: stylist_id },
      include: [{ model: StylistScheduleTime }],
      order: [
        [Sequelize.literal(`FIELD(day, '${DAYS_ORDER.join("','")}')`), "ASC"],
      ],
    });

    res.status(200).json({ code: 200, data: schedules });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

router.get("/all", async (req: Request, res: Response) => {
  try {
    const stylists = await Stylist.findAll({
      include: [
        {
          model: User,
          attributes: ["first_name", "last_name"],
        },
        {
          model: StylistImage,
        },
        {
          model: StylistSchedule,
          include: [
            {
              model: StylistScheduleTime,
              where: {
                time: {
                  [Op.ne]: null,
                },
              },
              required: true,
            },
          ],
          required: true,
          order: [
            [
              Sequelize.literal(`FIELD(day, '${DAYS_ORDER.join("','")}')`),
            ] as any,
          ],
        },
      ],
      order: [
        [
          Sequelize.literal(
            `CASE online_status WHEN 'online' THEN 1 ELSE 2 END`,
          ),
          "ASC",
        ],
      ],
    });

    res.status(200).json({ code: 200, data: stylists });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//get profile by id
router.get("/profile/:stylist_id", async (req: Request, res: Response) => {
  try {
    const { stylist_id } = req.params;

    const stylist = await Stylist.findOne({
      where: { stylist_id },
      include: [
        {
          model: User,
          attributes: ["first_name", "last_name"],
        },
        {
          model: StylistImage,
        },
        {
          model: StylistSchedule,
          include: [
            {
              model: StylistScheduleTime,
              required: false,
            },
          ],
          required: false,
        },
        {
          model: StylistReview,
        },
      ],
      order: [
        [Sequelize.literal(`FIELD(day, '${DAYS_ORDER.join("','")}')`), "ASC"],
      ],
    });

    if (!stylist) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "Stylist not found.",
      });
    }

    res.status(200).json({ code: 200, data: stylist });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//update stylist online status
router.put("/online-status", async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);
    const { online_status } = req.body;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "You are not authorized to perform this action.",
      });
    }

    const stylist = await Stylist.findOne({ where: { user_id: userId } });

    if (!stylist) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "Stylist not found.",
      });
    }

    const updatedStylist = await Stylist.update(
      { online_status },
      { where: { user_id: userId } },
    );

    res.status(200).json({ code: 200, data: updatedStylist });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

export default router;
