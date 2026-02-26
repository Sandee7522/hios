// app/api/modules/reorder/route.js
import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";

const reorderSchema = z.object({
  courseId: z.string().min(1, "courseId required"),
  moduleOrders: z.array(
    z.object({
      moduleId: z.string().min(1),
      order: z.number(),
    }),
  ),
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
    const parsed = reorderSchema.safeParse(body);
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
    const result = await service.reorderModules(
      parsed.data.courseId,
      parsed.data.moduleOrders,
    );

    return success("Modules reordered successfully", result.data);
  } catch (err) {
    console.log("POST /modules/reorder error:", err);
    return serverError();
  }
}
