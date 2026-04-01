import { NextResponse } from "next/server";
import AccessRuleService from "@/services/accessRoule";
import { z } from "zod";
export const checkAccessSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),

  lessonId: z.string().min(1, "lessonId is required"),

  enrollment: z
    .object({
      totalPaid: z.number().nonnegative().optional().default(0),

      remainingAmount: z.number().nonnegative().optional().default(0),

      completedLessons: z.array(z.string()).optional().default([]),
    })
    .optional()
    .default({
      totalPaid: 0,
      remainingAmount: 0,
      completedLessons: [],
    }),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = checkAccessSchema.parse(body);

    const service = new AccessRuleService();
    const result = await service.checkAccessLesson(validated);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}
