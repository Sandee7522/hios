import connectDB from "@/config/database";
import AuthService from "@/services/AuthService";
import { success, serverError } from "@/utils/apiResponse";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const service = new AuthService();
    const result = await service.getAllUsers({}, page, limit);

    if (!result.success) {
      return validationError(result.message);
    }

    return success("Users fetched", result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
