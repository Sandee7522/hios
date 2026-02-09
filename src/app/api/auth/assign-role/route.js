import connectDB from "@/config/database";
import { z } from "zod";
import { success, validationError, serverError } from "@/utils/apiResponse";
import AuthService from "@/services/auth";

const schema = z.object({
  userId: z.string().min(1),
  roleType: z.string().min(1),
});

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.errors.map(e => e.message));
    }

    const service = new AuthService();
    const result = await service.assignRole(
      parsed.data.userId,
      parsed.data.roleType
    );

    if (!result.success) {
      return validationError(result.message);
    }

    return success(result.message, result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
