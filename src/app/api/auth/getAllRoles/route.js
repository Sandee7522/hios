import connectDB from "@/config/database";
import { apiResponse, serverError } from "@/utils/apiResponse";
import AuthService from "@/services/auth";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);

    if (!admin.status) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        { status: admin.code }
      );
    }

    const service = new AuthService();
    const result = await service.getAllRoles();

    return apiResponse(result.status, result.message, result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}