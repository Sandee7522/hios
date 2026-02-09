import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { serverError, success, validationError } from "@/utils/apiResponse";

export async function POST(req) {
  try {
    await connectDB();

    const { refreshToken } = await req.json();
    if (!refreshToken) return validationError("Refresh token required");

    const service = new AuthService();
    await service.logout(refreshToken);

    return success("Logout successful");
  } catch (error) {
    return validationError(error.message) || serverError();
  }
}
