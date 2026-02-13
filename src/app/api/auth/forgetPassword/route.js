import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { success, serverError, validationError } from "@/utils/apiResponse";
import { z } from "zod";

const forgetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const validation = forgetPasswordSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((e) => e.message);
      return validationError(errors, 422);
    }

    const service = new AuthService();
    const result = await service.forgetPassword(validation.data);

    return success(result.message, result.data);
  } catch (error) {
    console.error(error);
    return serverError(error.message);
  }
}
