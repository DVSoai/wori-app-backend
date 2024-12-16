import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(403).json({ error: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN || "worisecretkey");
    req.user = decoded as { id: string };
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};
