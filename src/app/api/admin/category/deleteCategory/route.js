import connectDB from "@/config/database";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const deleteCategorySchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
});

export async function POST(req) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.code }
      );
    }

    const payload = await req.json();

    const validation = deleteCategorySchema.safeParse(payload);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const service = new CourseServises();
    const result = await service.deleteCategoryById(
      validation.data.categoryId
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 404 }
      );
    }

    return success("Category deleted successfully", result.data);
  } catch (error) {
    console.log("deleteCategory route error", error);
    return serverError();
  }
}
