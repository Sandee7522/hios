// app/api/modules/update/route.js
import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import ModuleService from "@/services/moduleService";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";

const updateModuleSchema = z.object({
  id: z.string().min(1, "Module id required"),
  title: z.string().optional(),
  description: z.string().optional(),
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
    const parsed = updateModuleSchema.safeParse(body);
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
    const result = await service.updateModule(parsed.data.id, parsed.data);

    return success("Module updated successfully", result.data);
  } catch (err) {
    console.log("POST /modules/update error:", err);
    return serverError();
  }
}
