import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import CourseServises from "@/services/courses";


export async function GET(req, context) {
  try {
    await connectDB();

     const { slug } = await context.params;
    console.log("slug:::::::::::::", slug);

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    const service = new CourseServises();
    const result = await service.getCourseBySlug(slug);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Get course by slug route error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
