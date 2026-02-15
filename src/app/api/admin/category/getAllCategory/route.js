import connectDB from "@/config/database";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";
import CourseServises from "@/services/courses";

export async function POST(req) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.code }
      );
    }

    const payload = await req.json();

    const service = new CourseServises();
    const result = await service.getAllCategory(payload);

    return success("Categories fetched successfully", result);
  } catch (error) {
    console.log("getAllCategory route error", error);
    return serverError();
  }
}
