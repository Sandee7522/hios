import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { serverError, success } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const makeEnrollSchema = z.object({
  courseId: z.string().min(1, "Course id required"),
  totalFee: z.coerce.number().min(0).optional(),
});

export async function POST(req) {
  try {
    await connectDB();

    const tokenResult = await VerifyToken(req);
    if (!tokenResult.status) {
      return NextResponse.json(
        { success: false, message: tokenResult.message },
        { status: tokenResult.code || 401 },
      );
    }

    const body = await req.json();
    const validated = makeEnrollSchema.parse(body);

    const service = new PaymentServise();
    const result = await service.enrollUserProcess({
      userId: tokenResult.data.user._id,
      courseId: validated.courseId,
      totalPaid: 0,
      remainingAmount: validated.totalFee || 0,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in POST make enroll:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: error.issues?.[0]?.message || "Validation error" },
        { status: 400 },
      );
    }
    return serverError();
  }
}
