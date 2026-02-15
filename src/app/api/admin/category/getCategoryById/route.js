import connectDB from "@/config/database";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        { status: admin.code }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 }
      );
    }

    const service = new CourseServises();
    const result = await service.getCategoryById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 404 }
      );
    }

    return success("Category fetched successfully", result.data);
  } catch (error) {
    console.log("getCategoryById route error", error);
    return serverError();
  }
}
