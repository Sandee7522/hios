import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { serverError, success } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const progressSchema = z.object({
  courseId: z.string().min(1, "courseId requred"),
});

export async function POST(req) {
  try {
    await connectDB();
    const user = VerifyToken();

    const body = await req.json();
    const validated = progressSchema.parse(body);

    const service = PaymentServise();
    const result = await service.updatePayment({
      userId: user.data._id,
      ...validated,
    });
    return success("Single Enrollment Successfully", result);
  } catch (error) {
    console.log("Error Single Enrollment", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: error.issues?.[0]?.message || "Validation Error",
        },
        { status: 400 },
      );
    }

    serverError();
  }
}
