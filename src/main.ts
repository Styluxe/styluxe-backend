import "reflect-metadata";
import express from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io"; // Import the Socket.IO Server
import http from "http"; // Import HTTP module

import connection from "./db/connection";

import AuthRoutes from "./routes/auth.route";
import UserRoutes from "./routes/user.route";
import PostRoutes from "./routes/post.route";
import ProductRoutes from "./routes/product.route";
import OrderRoutes from "./routes/order.route";
import StylistRoutes from "./routes/stylist.route";
import ConversationRoutes from "./routes/conversation.route";
import BookingRoutes from "./routes/booking.route";
import midtransRoutes from "./routes/midtrans.route";
import adminRoutes from "./routes/admin.route";

import { v2 as cloudinary } from "cloudinary";
import { startOrderPaymentCronJobs } from "./cronJob/order.cron";
import { startConversationCronJobs } from "./cronJob/conversation.cron";

const app = express();

dotenv.config();

app.use(json());
app.use(cors());
app.use(urlencoded({ extended: true }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create an HTTP server
const server = http.createServer(app);

// Use the HTTP server to create the Socket.IO server
export const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use("/auth", AuthRoutes);
app.use("/user", UserRoutes);
app.use("/post", PostRoutes);
app.use("/product", ProductRoutes);
app.use("/order", OrderRoutes);
app.use("/conversation", ConversationRoutes);
app.use("/stylist", StylistRoutes);
app.use("/booking", BookingRoutes);
app.use("/midtrans", midtransRoutes);
app.use("/admin", adminRoutes);
app.use("/", (req, res) => {
  res.status(200).json({ status: "Server is running smoothly" });
});

const port = process.env.PORT || 8080;

const start = async (): Promise<void> => {
  try {
    await connection.sync({ alter: false, force: false });
    console.log("Database migration completed successfully.");

    startOrderPaymentCronJobs();
    startConversationCronJobs();

    server.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (error) {
    console.error("Database migration failed:", error);
    process.exit(1);
  }
};

void start();
