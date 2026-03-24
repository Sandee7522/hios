import { customAlphabet } from "nanoid";

/**
 * Generate a 6-digit alphanumeric OTP (uppercase letters + numbers).
 * Example output: "A3K7B2", "9XR4M1"
 */
const generateOTP = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

export default generateOTP;
