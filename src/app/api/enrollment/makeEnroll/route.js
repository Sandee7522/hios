import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { serverError, success } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const makeEnrollSchema = z.object({
  courseId: z.string().min(1, "Course id_equired"),
  progress: z.number().min(0).max(100).optional(),
  completedLessons: z.array(z.string()).optional(),
});

export async function POST(req) {
  try {
    await connectDB();
    const user = await VerifyToken();

    const body = await req.json();
    const validated = makeEnrollSchema.parse(body);

    const service = new PaymentServise();
    const result = await service.enrollUserProcess({
      userId: user.data._id,
      ...validated,
    });

    return success("Make enroll succesfully", result);
  } catch (error) {
    console.error("Error in POST make enroll:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: error.issues?.[0]?.message || "Validation error",
        },
        { status: 400 },
      );
    }
    return serverError();
  }
}
