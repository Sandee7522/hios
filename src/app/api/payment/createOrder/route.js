import connectDB from "@/config/database";
import Razorpay from "razorpay";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const createOrderSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().default("INR"),
  courseId: z.string().min(1, "Course ID is required"),
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
    const validated = createOrderSchema.parse(body);

    const razorpay = new Razorpay({
      key_id: process.env.RAZZER_PAY_KEY_ID,
      key_secret: process.env.RAZZER_PAY_KEY_SECRET,
    });

    // amount in paise for Razorpay
    const order = await razorpay.orders.create({
      amount: Math.round(validated.amount * 100),
      currency: validated.currency,
      receipt: `rcpt_${Date.now()}`,
      notes: {
        courseId: validated.courseId,
        userId,
      },
    });

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    console.error("Create Order Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
