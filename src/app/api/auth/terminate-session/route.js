import connectDB from "@/config/database";
import AuthService from "@/services/AuthService";
import { z } from "zod";
import { success, validationError, serverError } from "@/utils/apiResponse";

const schema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(req) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    if (!userId) return validationError("User ID missing");

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.errors.map(e => e.message));
    }

    const service = new AuthService();
    const result = await service.terminateSession(userId, parsed.data.sessionId);

    if (!result.success) return validationError(result.message);

    return success(result.message);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
