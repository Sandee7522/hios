import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { success, validationError, serverError } from "@/utils/apiResponse";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().length(6, "OTP must be 6 characters"),
});

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => e.message));
    }

    const userAgent = req.headers.get("user-agent") || "";
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const realIp = req.headers.get("x-real-ip") || "";
    const ipAddress = forwardedFor.split(",")[0]?.trim() || realIp || "Unknown";

    const service = new AuthService();
    const result = await service.verifyAdminLoginOtp(parsed.data, {
      ipAddress,
      userAgent,
      browser: userAgent,
      os: "Unknown",
      device: "Unknown",
    });

    if (!result.success) {
      return validationError(result.message);
    }

    return success("Admin login verified successfully", result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
