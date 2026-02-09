import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 10;

/**
 * Hash plain password
 */
export const hashPassword = async (password) => {
  if (!password) throw new Error("Password is required");
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain password with hashed password
 */
export const comparePassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) return false;
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate random token (for reset password, email verify, etc.)
 */
export const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};
