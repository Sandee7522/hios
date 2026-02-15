import { NextResponse } from "next/server";
import { Courses, Modules, Lessons } from "@/models/schemaModal";
import CourseServises from "@/services/courses";
import { AdminAuthentication } from "@/utils/jwt";

const service = new CourseServises({ Courses, Modules, Lessons });

export async function POST(req) {
  try {
    const user = await AdminAuthentication(req);

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.code },
      );
    }

    const { courseId } = await req.json();

    const result = await service.deleteCourse(courseId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
