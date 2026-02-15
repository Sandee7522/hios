import connectDB from "@/config/database";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // 🔒 public users only see published courses
    body.isPublished = true;

    const service = new CourseServises();
    const result = await service.getAllCourses(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 },
      );
    }

    return success("Courses fetched successfully", result);
  } catch (error) {
    console.error("User courses route error:", error);
    return serverError();
  }
}
