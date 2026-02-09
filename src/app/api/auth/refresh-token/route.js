import connectDB from "@/config/database";
import AuthService from "@/services/AuthService";
import { success, serverError, validationError } from "@/utils/apiResponse";

export async function POST(req) {
  try {
    await connectDB();

    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return validationError("Refresh token required");
    }

    const service = new AuthService();
    const result = await service.refreshToken(refreshToken);

    if (!result.success) {
      return validationError(result.message);
    }

    return success("Token refreshed", result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
