import connectDB from "@/config/database";
import { z } from "zod";
import { success, validationError, serverError } from "@/utils/apiResponse";
import AuthService from "@/services/auth";

const updateSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function GET(req) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    if (!userId) return validationError("User ID missing");

    const service = new AuthService();
    const result = await service.getUserById(userId);

    if (!result.success) return validationError(result.message);

    return success("User fetched", result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    if (!userId) return validationError("User ID missing");

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.errors.map(e => e.message));
    }

    const service = new AuthService();
    const result = await service.updateProfile(userId, parsed.data);

    if (!result.success) return validationError(result.message);

    return success(result.message, result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
