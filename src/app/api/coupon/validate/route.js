import connectDB from "@/config/database";
import CouponService from "@/services/coupon";
import { success, validationError, serverError } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

export async function POST(req) {
  try {
    await connectDB();

    const auth = await VerifyToken(req);
    if (!auth.status) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.code },
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => e.message));
    }

    const userId = auth.data?.user?._id?.toString();
    const service = new CouponService();
    const result = await service.validateCoupon({
      code: parsed.data.code,
      userId,
      courseId: parsed.data.courseId,
    });

    if (!result.success) {
      return validationError(result.message);
    }

    return success("Coupon is valid", result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
