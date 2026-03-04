import connectDB from "@/config/database";
import AccessRuleService from "@/services/accessRoule";
import { success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const createAccessRuleSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  lessonId: z.string().min(1, "Lesson ID is required"),
  moduleId: z.string().min(1, "Module ID is required"),
  requiredPaymentPercentage: z
    .number()
    .min(0, "Payment percentage must be at least 0")
    .max(100, "Payment percentage cannot exceed 100")
    .optional(),
  requiredPaymentAmount: z
    .number()
    .min(0, "Payment amount must be at least 0")
    .optional(),
  prerequisiteLessons: z.array(z.string()).optional(),
  unlockCondition: z.enum(["payment", "completion", "both"]),
});

export async function POST(req) {
  try {
    await connectDB();
    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        {
          success: false,
          message: admin.code,
        },
        {
          status: admin.code,
        },
      );
    }

    const body = await req.json();
    const validationData = createAccessRuleSchema.parse(body);

    const service = new AccessRuleService();
    const result = await service.createAccessRule(validationData);
    return success("Access rule created successfully", result);
  } catch (error) {
    console.error("Error in POST access rule:", error);
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


// {
//   "courseId": "65f3b9f4d1c3b41a12345678",
//   "lessonId": "65f3ba24d1c3b41a12345679",
//   "unlockCondition": "payment",
//   "requiredPaymentPercentage": 50
// }