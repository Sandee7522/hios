import { NextResponse } from "next/server";
import CourseService from "@/services/course.service";
// import { createCourseSchema } from "@/validations/course.validation";
import connectDB from "@/config/database";
import { InstructorAuthentication } from "@/utils/jwt";
import { createCourseSchema } from "../../zodValidation/zodValidation";

const service = new CourseService();

export async function POST(req) {
  try {
    await connectDB();
    await InstructorAuthentication(req);
    const body = await req.json();

    // ✅ Zod validation
    const parsed = createCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const result = await service.createCourse(parsed.data);

    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    console.error("Create course route error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
