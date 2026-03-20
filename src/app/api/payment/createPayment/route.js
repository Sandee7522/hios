import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const createPaymentSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  enrollmentId: z.string().min(1, "enrollmentId is required"),
  razorpayOrderId: z.string().min(3),
  amount: z.coerce.number().positive(),
  currency: z.string().default("INR"),
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

    const userId = tokenResult.data.user._id.toString();
    const body = await req.json();
    const validated = createPaymentSchema.parse(body);

    const service = new PaymentServise();
    const result = await service.createPayment({
      userId,
      ...validated,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Create Payment Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
