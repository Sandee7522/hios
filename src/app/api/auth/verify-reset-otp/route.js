import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { success, serverError, validationError } from "@/utils/apiResponse";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
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

    const service = new AuthService();
    const result = await service.verifyResetOtp(parsed.data);

    if (!result.success) {
      return validationError(result.message);
    }

    return success(result.message, result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
