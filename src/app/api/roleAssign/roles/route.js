import connectDB from "@/config/database";
import roleService from "@/services/roleService";
import { NextResponse } from "next/server";
import { z } from "zod";

/* ======================= ZOD SCHEMAS (SAME FILE) ======================= */

const createRoleSchema = z.object({
  user_type: z
    .string()
    .min(2, "User type must be at least 2 characters")
    .max(50, "User type must be less than 50 characters"),

  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .optional(),

  permissions: z.array(z.string()).optional().default([]),
});

/* =======================  POST: CREATE ROLE ======================= */

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Zod validation
    const validatedData = createRoleSchema.parse(body);

    const result = await roleService.createRole(validatedData);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json(result, { status: 400 });
  } catch (error) {
    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

/* ======================= GET: FETCH ROLES ======================= */

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams);

    const result = await roleService.getAllRoles(filters);

    if (result.success) {
      return NextResponse.json(result);
    }

    return NextResponse.json(result, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
