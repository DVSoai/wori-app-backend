import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../models/db";
import jwt from "jsonwebtoken";
import { error } from "console";

const SALT_ROUNDS = 10;
const JWT_TOKEN = process.env.JWT_SECRET || "worisecretkey";
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "worisecretkey";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "worisrefreshkey";
const ACCESS_TOKEN_EXPIRATION = "5m"; // 15 phút
const REFRESH_TOKEN_EXPIRATION = "7d"; // 7 ngày

const randomImages = [
  "https://duhocsunny.edu.vn/wp-content/uploads/2023/02/Go-Youn-Jung-Anh-Gai-xinh-Han-Quoc-.jpg",
  "https://duhocsunny.edu.vn/wp-content/uploads/2023/02/Anh-gai-xinh-Han-Quoc-Han-Kyung.jpg",
  "https://i.vietgiaitri.com/2013/11/19/anh-girl-xinh-han-quoc-chan-dai-hd-dep-nhat-7696b5.jpg",
  "https://bhd.1cdn.vn/2021/08/19/files-library-images-site-1-20210819-web-ve-dep-dam-chat-latinh-cua-hoa-hau-the-gioi-colombia-2021-32-145409.jpg",
  "https://bhd.1cdn.vn/2021/08/19/files-library-images-site-1-20210819-web-ve-dep-dam-chat-latinh-cua-hoa-hau-the-gioi-colombia-2021-32-145411.jpg",
  "https://bhd.1cdn.vn/2021/08/19/files-library-images-site-1-20210819-web-ve-dep-dam-chat-latinh-cua-hoa-hau-the-gioi-colombia-2021-32-145413.jpg",
];

const generateTokens = (user: any) => {
  const payload = {
    id: user.id,
  };

  // Sinh ra accessToken
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });

  // Sinh ra refreshToken
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  return { accessToken, refreshToken };
};
const ERROR_CODES = {
  USER_OR_EMAIL_NOT_CORRECT: "AUTH.USER_OR_EMAIL_NOT_CORRECT",
  INVALID_CREDENTIALS: "AUTH.INVALID_CREDENTIALS",
  SERVER_ERROR: "AUTH.SERVER_ERROR",
  SUCCESS: "000000",
};
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const randomImage =
      randomImages[Math.floor(Math.random() * randomImages.length)];
    const result = await pool.query(
      "INSERT INTO users (username, email, password, profile_image) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, hashedPassword, randomImage]
    );

    const user = result.rows[0];

    res.status(201).json({
      user,
    });
  } catch (e) {
    console.error("Lỗi khi đăng ký người dùng:", e);
    res.status(500).json({ message: "Failed to register user" });
  }
};
export const login = async (req: Request, res: Response): Promise<any> => {
  //1. get email, password
  //2. Verify if email exits
  //3. Compare pwd -> 'invalid credentials'
  //4. return token
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({
        errorCode: "User not found",
      });
    }

    const isMath = await bcrypt.compare(password, user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        errorCode: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    const token = jwt.sign({ id: user.id }, JWT_TOKEN, { expiresIn: "60m" });
    let finalResult = { ...user, token };
    res.json({ user: finalResult });
  } catch (e) {
    console.error("Lỗi khi đăng nhập:", e);
    res.status(500).json({ message: "Failed to register user" });
  }
};
