import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { serverError, success } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

export async function GET(req) {
  try {
    await connectDB();
    const user = VerifyToken();

    const body = await req.json();
    const validated = getSchema.parse(body);

    const service = PaymentServise();
    const result = await service.getUserEnrollments({
      userId: user.data._id,
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
