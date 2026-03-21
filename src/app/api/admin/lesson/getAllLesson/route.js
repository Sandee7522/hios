import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { Lessons } from "@/models/schemaModal";
import { AdminAuthentication } from "@/utils/jwt";
import { serverError, success } from "@/utils/apiResponse";

const listLessonsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(10),
  search: z.string().optional().default(""),
  courseId: z.string().optional(),
  moduleId: z.string().optional(),
  sortBy: z.enum(["title", "order", "created_at", "updated_at"]).optional().default("created_at"),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
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
    const parsed = listLessonsSchema.safeParse(body || {});
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: parsed.error.errors,
        },
        { status: 400 },
      );
    }

    const { page, pageSize, search, courseId, moduleId, sortBy, sort } = parsed.data;
    const skip = (page - 1) * pageSize;

    const query = {};
    if (courseId) query.courseId = courseId;
    if (moduleId) query.moduleId = moduleId;
    if (search?.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { content: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const sortOrder = sort === "asc" ? 1 : -1;
    const [data, total] = await Promise.all([
      Lessons.find(query)
        .populate("courseId", "title slug")
        .populate("moduleId", "title order")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Lessons.countDocuments(query),
    ]);

    const pages = Math.ceil(total / pageSize) || 1;

    return success("Lessons fetched successfully", {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: pages,
        pages,
      },
    });
  } catch (error) {
    console.error("POST /admin/lesson/getAllLesson error:", error);
    return serverError();
  }
}
