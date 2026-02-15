import connectDB from "@/config/database";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import * as z from "zod";
import { NextResponse } from "next/server";
import CourseServises from "@/services/courses";

const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
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

    const validation = createCategorySchema.safeParse(payload);

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
    const result = await service.createCategory(validation.data);

    return success("Category created successfully", result);
  } catch (error) {
    console.log("createCategory route error", error);
    return serverError();
  }
}
