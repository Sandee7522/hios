// app/api/modules/byId/route.js
import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { serverError, success } from "@/utils/apiResponse";
import CourseServises from "@/services/courses";
import { InstructorAuthentication } from "@/utils/jwt";

const getModuleSchema = z.object({
  id: z.string().min(1, "Module id required"),
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
    const parsed = getModuleSchema.safeParse(body);
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
    const result = await service.getModulById(parsed.data.id);

    return success("Module fetched successfully", result.data);
  } catch (err) {
    console.log("POST /modules/byId error:", err);
    return serverError();
  }
}
