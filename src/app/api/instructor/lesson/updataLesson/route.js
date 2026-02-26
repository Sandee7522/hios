import { NextResponse } from "next/server";
import * as z from "zod";

import connectDB from "@/config/database";
import LessonService from "@/services/LessonService";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication, InstructorAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";

const service = new LessonService();

const updateLessonSchema = z.object({
  id: z.string().min(1, "lesson id required"),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
});

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
    const validated = updateLessonSchema.parse(body);
    const service = new CourseServises();
    const result = await service.updateLesson(validated);

    return success("Update Lesson successfully", result);
  } catch (error) {
    console.error("update lesson error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message },
        { status: 400 },
      );
    }

    return serverError();
  }
}
