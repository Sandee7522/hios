import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { Modules } from "@/models/schemaModal";
import { AdminAuthentication } from "@/utils/jwt";
import { serverError, success } from "@/utils/apiResponse";

const listModulesSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(10),
  search: z.string().optional().default(""),
  courseId: z.string().optional(),
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
    const parsed = listModulesSchema.safeParse(body || {});
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

    const { page, pageSize, search, courseId, sortBy, sort } = parsed.data;
    const skip = (page - 1) * pageSize;

    const query = {};
    if (courseId) query.courseId = courseId;
    if (search?.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const sortOrder = sort === "asc" ? 1 : -1;
    const [data, total] = await Promise.all([
      Modules.find(query)
        .populate("courseId", "title slug")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Modules.countDocuments(query),
    ]);

    const pages = Math.ceil(total / pageSize) || 1;

    return success("Modules fetched successfully", {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: pages,
        pages,
      },
    });
  } catch (err) {
    console.error("POST /admin/modules/getAllModule error:", err);
    return serverError();
  }
}
