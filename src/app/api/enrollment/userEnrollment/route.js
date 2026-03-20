import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const tokenResult = await VerifyToken(req);
    if (!tokenResult.status) {
      return NextResponse.json(
        { success: false, message: tokenResult.message },
        { status: tokenResult.code || 401 },
      );
    }

    const service = new PaymentServise();
    const result = await service.getUserEnrollments({
      userId: tokenResult.data.user._id,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error User Enrollments:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
