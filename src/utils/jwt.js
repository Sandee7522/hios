import { Users } from "@/models/schemaModal";
import jwt from "jsonwebtoken";

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN = "15m",
  JWT_REFRESH_EXPIRES_IN = "7d",
} = process.env;

export const generateAccessToken = (payload) => {
  if (typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("JWT payload must be a plain object");
  }

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

export const generateTokens = (payload) => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken(payload),
});


export const VerifyToken = async (req) => {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw Object.assign(new Error("Authorization token missing"), {
      status: 401,
    });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (error) {
    throw Object.assign(new Error("Invalid or expired token"), {
      status: 401,
    });
  }

  const userId = decoded.userId || decoded.id;

  const user = await Users.findById(userId);
  if (!user) {
    throw Object.assign(new Error("User not found"), {
      status: 401,
    });
  }

  // attach user to request (optional but recommended)
  req.user = user;

  return {
    decoded,
    user,
  };
};
