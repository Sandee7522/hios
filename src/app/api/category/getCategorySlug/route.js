import connectDB from "@/config/database";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    const service = new CourseServises();
    const result = await service.getCategoryBySlug(slug);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 404 }
      );
    }

    return success("Category fetched successfully", result.data);
  } catch (error) {
    console.log("getCategoryBySlug route error", error);
    return serverError();
  }
}
