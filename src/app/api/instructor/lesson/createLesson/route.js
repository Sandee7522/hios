import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication, InstructorAuthentication } from "@/utils/jwt";


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

     const instructor = await InstructorAuthentication(req);
     if (!instructor.status) {
       return NextResponse.json(
         { success: false, message: instructor.message },
         { status: instructor.code },
       );
     }

    const body = await req.json();
    // const validatedData = createLessonSchema.parse(body);
    const service = new CourseServises();

    const result = await service.createLesson(body);
    console.log("Created Lesson::::::::::::::", result);
    return success("Lesson created successfully", result);
  } catch (error) {
    console.error("POST lesson error:", error);

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
