import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { success, serverError, validationError } from "@/utils/apiResponse";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req) {
  try {
    await connectDB();
    const auth = await VerifyToken(req);
    if (!auth.status) {
      return validationError([auth.message], auth.code);
    }
    const body = await req.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((e) => e.message);
      return validationError(errors, 422);
    }

    const service = new AuthService();
    const result = await service.resetPassword(validation.data);

    return success(result.message, result.data);
  } catch (error) {
    console.error(error);
    return serverError(error.message);
  }
}
