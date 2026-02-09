import connectDB from "@/config/database";
import AuthService from "@/services/AuthService";
import { success, validationError, serverError } from "@/utils/apiResponse";

export async function GET(req) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    if (!userId) return validationError("User ID missing");

    const service = new AuthService();
    const result = await service.getUserSessions(userId);

    if (!result.success) return validationError(result.message);

    return success("Sessions fetched", result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
