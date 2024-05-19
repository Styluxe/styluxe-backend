import express, { Request, Response } from "express";
import { User } from "../models/users";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

//register
router.post("/register", async (req: Request, res: Response) => {
  const { first_name, last_name, email, mobile, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        code: 409,
        status: "Conflict",
        message: "Email already exists. Please use a different email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      mobile,
      password: hashedPassword,
      user_role: "user",
    } as User);

    res.status(201).json({
      code: 201,
      status: "success",
      message: "User created successfully",
      user: user,
    });
  } catch (error: any) {
    res.status(400).json({ code: 400, message: error.message });
  }
});

//login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    if (!JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret is not defined." });
    }
  } catch (error) {
    return res.status(500).json({ message: "JWT secret is not defined." });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ code: 404, status: "Not Found", message: "Email Not Found." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "Invalid email or password.",
      });
    }

    // Calculate expiration time
    const expiresIn = "30d";

    // Create JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, userRole: user.user_role },
      JWT_SECRET,
      { expiresIn },
    );

    res.status(200).json({
      code: 200,
      status: "OK",
      message: "Login successful",
      token,
      data: jwt.decode(token),
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ code: 400, status: "Bad Request", message: error.message });
  }
});

//refresh token
router.post("/refresh-token", async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      code: 400,
      status: "Bad Request",
      message: "Refresh token is required.",
    });
  }

  try {
    const decodedToken: any = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "",
    );
    const userId = decodedToken.userId;

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: userId },
      process.env.JWT_SECRET || "",
      { expiresIn: "24h" },
    );

    res.status(200).json({
      code: 200,
      status: "OK",
      message: "Token refreshed successfully",
      token: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({
      code: 401,
      status: "Unauthorized",
      message: "Invalid refresh token.",
    });
  }
});

export default router;
