import connectDB from "@/config/database";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication, InstructorAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const getLessonSchema = z.object({
  courseId: z.string().optional(),
  moduleId: z.string().optional(),
  id: z.string().optional(),
});
const service = new CourseServises();
export async function GET(req) {
  try {
    await connectDB();
    const instructor = await InstructorAuthentication(req);
    if (!instructor.status) {
      return NextResponse.json(
        { success: false, message: instructor.message },
        { status: instructor.code },
      );
    }

    const { searchParams } = new URL(req.url);

    const query = {
      courseId: searchParams.get("courseId") || undefined,
      moduleId: searchParams.get("moduleId") || undefined,
      id: searchParams.get("id") || undefined,
    };

    const validatedQuery = getLessonSchema.parse(query);

    let result;

    if (validatedQuery.id) {
      result = await service.getLessonById(validatedQuery.id);
    } else if (validatedQuery.moduleId) {
      result = await service.getLessonByModule(validatedQuery.moduleId);
    } else if (validatedQuery.courseId) {
      result = await service.getLessonByCourse(validatedQuery.courseId);
    } else {
      return NextResponse.json(
        { success: false, message: "Provide id, moduleId or courseId" },
        { status: 400 },
      );
    }

    return success("Fetch Lesson successfully", result);
  } catch (error) {
    console.error("GET lesson error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.errors[0]?.message,
        },
        { status: 400 },
      );
    }

    return serverError();
  }
}
