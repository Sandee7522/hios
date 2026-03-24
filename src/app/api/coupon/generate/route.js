import connectDB from "@/config/database";
import CouponService from "@/services/coupon";
import { success, validationError, serverError } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  userId: z.string().optional(),
  discountType: z.enum(["percentage", "flat"]).default("percentage"),
  discountValue: z.number().min(1),
  maxDiscount: z.number().optional(),
  courseId: z.string().optional(),
  expiresInDays: z.number().min(1).default(30),
});

export async function POST(req) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.code },
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => e.message));
    }

    const adminId = admin.data?.adminData?._id?.toString();
    const service = new CouponService();
    const result = await service.generateCoupon({
      adminId,
      ...parsed.data,
    });

    if (!result.success) {
      return validationError(result.message);
    }

    return success("Coupon generated successfully", result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
