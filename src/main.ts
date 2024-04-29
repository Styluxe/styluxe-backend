import "reflect-metadata";
import express from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import dotenv from "dotenv";

import connection from "./db/connection";

import AuthRoutes from "./routes/auth.route";
import UserRoutes from "./routes/user.route";
import PostRoutes from "./routes/post.route";
import ProductRoutes from "./routes/product.route";
import OrderRoutes from "./routes/order.route";

const app = express();

dotenv.config();

app.use(json());
app.use(cors());
app.use(urlencoded({ extended: true }));

app.use("/auth", AuthRoutes);
app.use("/user", UserRoutes);
app.use("/post", PostRoutes);
app.use("/product", ProductRoutes);
app.use("/order", OrderRoutes);

const port = process.env.PORT || 8080;

const start = async (): Promise<void> => {
  try {
    await connection.sync({ alter: false, force: false });
    console.log("Database migration completed successfully.");

    app.listen(port, () => {
      console.log("Server started on port 8080");
    });
  } catch (error) {
    console.error("Database migration failed:", error);
    process.exit(1);
  }
};

void start();
