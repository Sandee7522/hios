import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { AdminAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";


/* ================= VALIDATION ================= */

const createCourseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().min(10),
  shortDescription: z.string().optional(),
  thumbnail: z.string().url().optional().or(z.literal("")),
  previewVideo: z.string().url().optional().or(z.literal("")),

  instructorId: z.string().min(1),
  categoryId: z.string().optional(),

  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  courseLanguage: z.string().optional(),

  price: z.coerce.number().min(0),
  discount: z.coerce.number().optional(),
  totalFee: z.coerce.number().min(0),
  currency: z.string().optional(),

  partialPaymentEnabled: z.boolean().optional(),
  minimumPayment: z.coerce.number().optional(),

  duration: z
    .object({
      hours: z.coerce.number().optional(),
      minutes: z.coerce.number().optional(),
    })
    .optional(),

  requirements: z.array(z.string()).optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  status: z
    .enum(["draft", "pending", "published", "archived", "rejected"])
    .optional(),

  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().optional(),
});

/* ================= ADMIN CREATE ================= */

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

    const body = await req.json();
    const validatedData = createCourseSchema.parse(body);

    const service = new CourseServises();
    const result = await service.createCourse(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return success("Course created successfully", result.data);
  } catch (error) {
    console.error("Admin create course error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return serverError();
  }
}
