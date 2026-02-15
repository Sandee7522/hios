import { NextResponse } from "next/server";
import * as z from "zod";
import mongoose from "mongoose";
import connectDB from "@/config/database";
import { InstructorAuthentication } from "@/utils/jwt";
import CourseServices from "@/services/courses";
import { Courses } from "@/models/schemaModal";

/* ================= VALIDATION ================= */

const updateCourseSchema = z.object({
  id: z.string().min(1),
  data: z.object({}).passthrough(),
});

/* ================= POST ================= */

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
    const { id, data } = updateCourseSchema.parse(body);

    // ObjectId check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid course ID" },
        { status: 400 }
      );
    }

    // 🔥 OWNERSHIP CHECK (VERY IMPORTANT)
    const course = await Courses.findById(id).lean();

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.instructorId.toString() !== instructor.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update this course" },
        { status: 403 }
      );
    }

    const service = new CourseServices();
    const result = await service.updateCourse(id, data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Instructor update course route error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
