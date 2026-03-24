import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { success, validationError } from "@/utils/apiResponse";
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

    const { userId, reason } = await req.json();
    if (!userId) {
      return validationError("userId is required");
    }

    // Prevent admin from deleting themselves
    const adminData = admin.data?.adminData;
    const adminId = adminData?._id?.toString();
    if (userId === adminId) {
      return validationError("You cannot force logout and delete yourself");
    }

    const service = new AuthService();
    const result = await service.forceLogoutAndDeleteUser(userId, {
      adminId,
      adminName: adminData?.name,
      adminEmail: adminData?.email,
      reason: reason || "",
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 },
      );
    }

    return success("User force logged out and all data deleted successfully", result.data);
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
