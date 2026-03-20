import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
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
    const validated = verifyPaymentSchema.parse(body);

    const service = new PaymentServise();
    const result = await service.verifyAndCompletePayment(validated);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
