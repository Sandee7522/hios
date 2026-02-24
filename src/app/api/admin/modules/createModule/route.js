import connectDB from "@/config/database";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import * as z from "zod";


// ================= ZOD SCHEMA =================
const createModuleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isPublished: z.boolean().optional(),
  courseId: z.string().min(1, "courseId is required"),
});

// ================= POST HANDLER =================
export async function POST(req) {
  try {
    // Connect to DB
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        { status: admin.code },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = createModuleSchema.safeParse(body);
    if (!parsed.success) {
      console.log("Validation errors:", parsed.error.errors);
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.errors },
        { status: 400 }
      );

    }

    const service = new CourseServises();
    const result = await service.createModule(parsed.data);
    return success("Module created successfully", result);
  } catch (error) {
    console.log("POST /modules error:", error);
    return serverError();
  }
}