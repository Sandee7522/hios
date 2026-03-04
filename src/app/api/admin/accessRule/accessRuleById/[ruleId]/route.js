
// not tested

import connectDB from "@/config/database";
import AccessRuleService from "@/services/accessRoule";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";

/* ================= PARAM VALIDATION ================= */
const paramSchema = z.object({
  ruleId: z.string().min(1, "Rule ID is required"),
});

/* ================= UPDATE BODY VALIDATION ================= */
const updateSchema = z.object({
  unlockCondition: z.enum(["payment", "completion", "both"]).optional(),
  requiredPaymentPercentage: z.number().min(0).max(100).optional(),
  requiredPaymentAmount: z.number().min(0).optional(),
  prerequisiteLessons: z.array(z.string()).optional(),
});

/* ================= GET BY RULE ID ================= */
export async function GET(req, { params }) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.code },
        { status: admin.code },
      );
    }

    const { ruleId } = paramSchema.parse(params);

    const service = new AccessRuleService();
    const result = await service.getAccessByRuleId(ruleId);

    return success("Access rule fetched successfully", result);
  } catch (error) {
    console.error("GET Access Rule Error:", error);

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

/* ================= UPDATE RULE ================= */
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.code },
        { status: admin.code },
      );
    }

    const { ruleId } = paramSchema.parse(params);
    const body = await req.json();
    const validatedBody = updateSchema.parse(body);

    const service = new AccessRuleService();
    const result = await service.updateAccessRule(ruleId, validatedBody);

    return success("Access rule updated successfully", result);
  } catch (error) {
    console.error("UPDATE Access Rule Error:", error);

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

/* ================= DELETE RULE ================= */
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.code },
        { status: admin.code },
      );
    }

    const { ruleId } = paramSchema.parse(params);

    const service = new AccessRuleService();
    const result = await service.deleteAccessRule(ruleId);

    return success("Access rule deleted successfully", result);
  } catch (error) {
    console.error("DELETE Access Rule Error:", error);

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
