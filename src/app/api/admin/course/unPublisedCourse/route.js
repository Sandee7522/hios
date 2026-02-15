import { NextResponse } from "next/server";
import { Courses, Modules, Lessons } from "@/models/schemaModal";
import CourseServises from "@/services/courses";
import { AdminAuthentication } from "@/utils/jwt";

const service = new CourseServises({ Courses, Modules, Lessons });

export async function POST(req) {
  try {
    // ✅ admin check
    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.code }
      );
    }

    // ✅ body
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "courseId is required" },
        { status: 400 }
      );
    }

    // ✅ service call
    const result = await service.unpublishCourse(courseId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
