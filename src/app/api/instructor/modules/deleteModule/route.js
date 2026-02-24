// app/api/modules/delete/route.js
import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { serverError, success } from "@/utils/apiResponse";
import { InstructorAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";

const deleteModuleSchema = z.object({
  id: z.string().min(1, "Module id required"),
});

export async function POST(req) {
  try {
    await connectDB();

    const instructor = await InstructorAuthentication(req);
    if (!instructor.status) {
      return NextResponse.json(
        { success: false, message: instructor.message },
        { status: instructor.code }
      );
    }
    const body = await req.json();
    const parsed = deleteModuleSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: "Validation error", errors: parsed.error.errors }, { status: 400 });

    const service = new CourseServises();
    const result = await service.deleteModule(parsed.data.id);

    return success("Module deleted successfully", result.data);
  } catch (err) {
    console.log("POST /modules/delete error:", err);
    return serverError();
  }
}