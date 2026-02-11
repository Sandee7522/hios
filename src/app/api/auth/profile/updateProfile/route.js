import { VerifyToken } from "@/utils/jwt";
import {
  apiResponse,
  serverError,
  success,
  validationError,
} from "@/utils/apiResponse";
import connectDB from "@/config/database";
import AuthService from "@/services/auth";

export async function POST(req) {
  try {
    await connectDB();
    await VerifyToken(req);

    const body = await req.json();
    console.log("body:", body);

    const service = new AuthService();
    const result = await service.updateProfile(body);

    return apiResponse(result.status, result.message, result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
