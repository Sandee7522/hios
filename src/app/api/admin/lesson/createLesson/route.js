import connectDB from "@/config/database";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const createLessonSchema = z.object({
  courseId: z.string().min(1, "courseId required"),
  moduleId: z.string().min(1, "moduleId required"),
  title: z.string().min(1, "title required"),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export async function POST(req) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        { status: admin.code },
      );
    }

    const body = await req.json();
    const validatedData = createLessonSchema.parse(body);
    const service = new CourseServises();
    const result = await service.createLesson(validatedData);

    return success("Lesson created successfully", result);
  } catch (error) {
    console.error("POST lesson error:", error);

  if (error?.name === "ZodError") {
    return NextResponse.json(
      {
        success: false,
        message: error.issues?.[0]?.message || "Validation error",
      },
      { status: 400 }
    );
  }
    return serverError();
  }
}
