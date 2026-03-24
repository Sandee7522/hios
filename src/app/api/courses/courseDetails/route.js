import connectDB from "@/config/database";
import CourseServises from "@/services/courses";
import { serverError } from "@/utils/apiResponse";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "courseId is required" },
        { status: 400 },
      );
    }

    const service = new CourseServises();
    const result = await service.getCourseDetailsByCourseId(courseId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Public courseDetails error:", error);
    return serverError();
  }
}
