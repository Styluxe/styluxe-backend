import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export const verifyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. Token is missing." });
  }

  const token = authHeader.split(" ")[1];
  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    if (!JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret is not defined." });
    }
  } catch (error) {
    return res.status(500).json({ message: "JWT secret is not defined." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
  } catch (error) {
    return res.status(401).json({ message: "Access denied. Invalid token." });
  }

  next();
};

export const getUserIdFromToken = (
  req: Request,
  res: Response
): { userId: string | null; userRole: string | null } => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      message: "No token provided.",
      code: 401,
      status: "Unauthorized",
    });
    return { userId: null, userRole: null };
  }

  try {
    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET || "");

    return {
      userId: decodedToken.userId,
      userRole: decodedToken.userRole,
    };
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
    return { userId: null, userRole: null };
  }
};
