import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { serverError, success } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const progressSchema = z.object({
  courseId: z.string().min(1, "courseId requred"),
  progress: z.number().min(0).max(100),
  completedLessonId: z.string().optional(),
});

export async function POST(req) {
  try {
    await connectDB();
    const user = await VerifyToken(req);

    if (!user.status) {
      return NextResponse.json(
        { success: false, message: user.message },
        { status: user.code || 401 },
      );
    }

    const body = await req.json();
    const validated = progressSchema.parse(body);

    const service = new PaymentServise();
    const result = await service.updateProgress({
      userId: user.data.user._id,
      ...validated,
    });
    return success("Progress updated successfully", result);
  } catch (error) {
    console.log("Error Progress Enrollment", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: error.issues?.[0]?.message || "Validation Error",
        },
        { status: 400 },
      );
    }

    return serverError();
  }
}
