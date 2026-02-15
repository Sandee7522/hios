import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { AdminAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";

const schema = z.object({
  courseId: z.string().min(1),
});

export async function POST(req) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.code },
      );
    }

    const body = await req.json();
    const { courseId } = schema.parse(body);

    const service = new CourseServises();
    const result = await service.getCourseById(courseId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Admin get course error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
