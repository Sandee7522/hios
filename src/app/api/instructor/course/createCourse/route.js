import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { InstructorAuthentication } from "@/utils/jwt";
import { success, serverError } from "@/utils/apiResponse";
import CourseServices from "@/services/courses";

const createCourseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().min(10),
  shortDescription: z.string().optional(),
  thumbnail: z.string().url().optional().or(z.literal("")),
  previewVideo: z.string().url().optional().or(z.literal("")),

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
});

/* ================= INSTRUCTOR CREATE ================= */

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
    const validatedData = createCourseSchema.parse(body);

    // ✅ instructorId from token
    validatedData.instructorId = instructor.data._id;

    const service = new CourseServices();
    const result = await service.createCourse(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return success("Course created successfully", result.data);
  } catch (error) {
    console.error("Instructor create course error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return serverError();
  }
}
