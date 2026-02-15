import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/config/database";
import { AdminAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";

/* ================= VALIDATION ================= */

const updateCourseSchema = z.object({
  id: z.string().min(1),
  data: z.object({}).passthrough(), // allow partial updates
});

/* ================= POST ================= */

export async function POST(req) {
  try {
    await connectDB();

    // 🔐 Admin auth
    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.code },
      );
    }

    const body = await req.json();

    // ✅ validate
    const { id, data } = updateCourseSchema.parse(body);

    const service = new CourseServises();
    const result = await service.updateCourse(id, data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Admin update course route error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
