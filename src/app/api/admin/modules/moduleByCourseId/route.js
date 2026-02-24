// app/api/modules/byCourse/route.js
import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";

const getModulesSchema = z.object({
  courseId: z.string().min(1, "courseId required"),
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
    const parsed = getModulesSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: parsed.error.errors,
        },
        { status: 400 },
      );

    const service = new CourseServises();
    const result = await service.moduleByCourseId(parsed.data.courseId);

    return success("Modules fetched successfully", result.data);
  } catch (err) {
    console.log("POST /modules/byCourse error:", err);
    return serverError();
  }
}
