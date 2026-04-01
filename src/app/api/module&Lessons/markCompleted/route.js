import connectDB from "@/config/database";
import { Lessons } from "@/models/schemaModal";
import { serverError, success } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";

const schema = z.object({
  lessonId: z.string().min(1, "lessonId required"),
});

export async function PUT(req) {
  try {
    await connectDB();

    const tokenResult = await VerifyToken(req);
    if (!tokenResult.status) {
      return NextResponse.json(
        { success: false, message: tokenResult.message },
        { status: tokenResult.code || 401 },
      );
    }

    const body = await req.json();
    const validated = schema.parse(body);

    const lesson = await Lessons.findByIdAndUpdate(
      validated.lessonId,
      { $set: { completed: true, updated_at: new Date() } },
      { new: true },
    );

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 },
      );
    }

    return success("Lesson marked as completed", lesson);
  } catch (error) {
    console.error("Mark Completed Error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: error.issues?.[0]?.message || "Validation Error" },
        { status: 400 },
      );
    }
    return serverError();
  }
}
