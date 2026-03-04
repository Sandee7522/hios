import { NextResponse } from "next/server";
import AccessRuleService from "@/services/AccessRuleService";
import { checkAccessSchema } from "@/validations/accessRule";

const service = new AccessRuleService();

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = checkAccessSchema.parse(body);

    const result = await service.checkAccessLesson(validated);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}