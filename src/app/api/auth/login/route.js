import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { serverError, success, validationError } from "@/utils/apiResponse";
import z from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // ZOD validation
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => e.message));
    }

    const service = new AuthService();
    const userAgent = req.headers.get("user-agent") || "";
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const realIp = req.headers.get("x-real-ip") || "";
    const ipAddress =
      forwardedFor.split(",")[0]?.trim() || realIp || "Unknown";

    const detectBrowser = (ua) => {
      if (/edg/i.test(ua)) return "Edge";
      if (/chrome|crios/i.test(ua)) return "Chrome";
      if (/firefox|fxios/i.test(ua)) return "Firefox";
      if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return "Safari";
      if (/opr|opera/i.test(ua)) return "Opera";
      return "Unknown Browser";
    };

    const detectOS = (ua) => {
      if (/windows nt/i.test(ua)) return "Windows";
      if (/android/i.test(ua)) return "Android";
      if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
      if (/mac os x/i.test(ua)) return "macOS";
      if (/linux/i.test(ua)) return "Linux";
      return "Unknown OS";
    };

    const detectDevice = (ua) => {
      if (/mobile|iphone|android/i.test(ua)) return "Mobile";
      if (/ipad|tablet/i.test(ua)) return "Tablet";
      return "Desktop";
    };

    const result = await service.login(parsed.data, {
      ipAddress,
      userAgent,
      browser: detectBrowser(userAgent),
      os: detectOS(userAgent),
      device: detectDevice(userAgent),
    });

    if (!result.success) {
      return validationError(result.message);
    }

    // Admin requires OTP verification
    if (result.requireOtp) {
      return success(result.message, { ...result.data, requireOtp: true });
    }

    return success("Login successful", result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
