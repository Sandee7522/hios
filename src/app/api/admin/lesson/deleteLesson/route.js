import { NextResponse } from "next/server";
import * as z from "zod";

import connectDB from "@/config/database";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";

const deleteLessonSchema = z.object({
  id: z.string().min(1, "lesson id required"),
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
    const validated = deleteLessonSchema.parse(body);
    const service = new CourseServises();

    const result = await service.deleteLesson(validated.id);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("delete lesson error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message },
        { status: 400 },
      );
    }

    return serverError();
  }
}
