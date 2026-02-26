import { NextResponse } from "next/server";
import * as z from "zod";

import connectDB from "@/config/database";
import LessonService from "@/services/LessonService";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication, InstructorAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";

const service = new LessonService();

const reorderLessonSchema = z.object({
  moduleId: z.string().min(1, "moduleId required"),
  lessonOrders: z
    .array(
      z.object({
        lessonId: z.string().min(1),
        order: z.number(),
      }),
    )
    .min(1, "lessonOrders required"),
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
    const validated = reorderLessonSchema.parse(body);
    const service = new CourseServises();
    const result = await service.reOrderLesson(validated);

    return success("Reorder Data:::", result);
  } catch (error) {
    console.error("reorder lesson error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message },
        { status: 400 },
      );
    }

    return serverError();
  }
}
