import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import { AdminAuthentication } from "@/utils/jwt";
import { serverError, success } from "@/utils/apiResponse";
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

    const body = await req.json();

    const service = new CourseServises();
    const result = await service.getAllCourses(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return success("Courses fetched successfully", result);
  } catch (error) {
    console.error("Admin courses route error:", error);
    return serverError();
  }
}
