import connectDB from "@/config/database";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";
const updateCategorySchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  name: z.string().min(2).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional(),
  icon: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
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

    const payload = await req.json();
    const validation = updateCategorySchema.safeParse(payload);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const service = new CourseServises();
    const result = await service.updateCategoryById(validation.data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error,
        },
        { status: 404 },
      );
    }

    return success("Category updated successfully", result.data);
  } catch (error) {
    console.log("updateCategory route error", error);
    return serverError();
  }
}
