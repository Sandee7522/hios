import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        { status: admin.code },
      );
    }

    const payload = await req.json();
    const service = new AuthService();
    const result = await service.getAllUsers(payload);

    return success("Users fetched successfully", result.data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
