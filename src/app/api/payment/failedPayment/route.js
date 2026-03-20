import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { NextResponse } from "next/server";
import * as z from "zod";

const orderIdSchema = z.object({
  razorpayOrderId: z.string(),
});

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const validated = orderIdSchema.parse(body);

    const service = new PaymentServise();
    const result = await service.makePaymentFailed(validated.razorpayOrderId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Failed Payment Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
