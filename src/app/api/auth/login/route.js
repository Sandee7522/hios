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
    const result = await service.login(parsed.data, {
      ipAddress: req.headers.get("x-forwarded-for") || "Unknown",
      userAgent: req.headers.get("user-agent"),
    });

    if (!result.success) {
      return validationError(result.message);
    }

    return success("Login successful", result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
