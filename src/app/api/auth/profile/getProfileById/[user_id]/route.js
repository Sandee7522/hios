import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { apiResponse, serverError } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";


export async function GET(req, context) {
  try {
    await connectDB();
    await VerifyToken(req);

    const params = await context.params;
    const { user_id } = params;

    console.log("user_id:", user_id);

    if (!user_id) {
      return apiResponse(400, "user_id is required");
    }

    const service = new AuthService();
    const result = await service.getProfileById({ user_id });

    return apiResponse(result.status, result.message, result.data);
  } catch (error) {
    console.log(error);
    return serverError();
  }
}