import connectDB from "@/config/database";
import AccessRuleService from "@/services/accessRoule";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";

const getSchema = z.Object({
  courseId: z.string().min(1, "Course ID is required"),
});

export async function GET(req, { params }) {
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

    const { courseId } = getSchema.parse(params);

    const service = new AccessRuleService();
    const result = await service.getAccessRulesByCourse(courseId);
    return success("Access rules fetched successfully", result);
  } catch (error) {
    console.error("Error in GET access rule:", error);
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
