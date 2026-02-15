import { NextResponse } from "next/server";
import connectDB from "@/config/database";
// import { InstructorAuthentication } from "@/utils/jwt";
import { serverError, success } from "@/utils/apiResponse";
import CourseServises from "@/services/courses";

export async function POST(req) {
  try {
    await connectDB();

    const instructor = await InstructorAuthentication(req);
    if (!instructor.status) {
      return NextResponse.json(
        { success: false, message: instructor.message },
        { status: instructor.code },
      );
    }

    const body = await req.json();

    // 🔒 instructor sees only own courses
    body.instructorId = instructor.data._id;

    const service = new CourseServises();
    const result = await service.getAllCourses(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 },
      );
    }

    return success("Instructor courses fetched", result);
  } catch (error) {
    console.error("Instructor courses route error:", error);
    return serverError();
  }
}
