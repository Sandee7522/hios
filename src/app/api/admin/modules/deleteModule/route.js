// app/api/modules/delete/route.js
import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import ModuleService from "@/services/moduleService";
import { AdminAuthentication } from "@/utils/jwt";
import { serverError, success } from "@/utils/apiResponse";

const deleteModuleSchema = z.object({
  id: z.string().min(1, "Module id required"),
});

export async function POST(req) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) return NextResponse.json(admin, { status: admin.code });

    const body = await req.json();
    const parsed = deleteModuleSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: "Validation error", errors: parsed.error.errors }, { status: 400 });

    const service = new ModuleService();
    const result = await service.deleteModule(parsed.data.id);

    return success("Module deleted successfully", result.data);
  } catch (err) {
    console.log("POST /modules/delete error:", err);
    return serverError();
  }
}