import connectDB from "@/config/database";
import { z } from "zod";
import { apiResponse, validationError, serverError } from "@/utils/apiResponse";
import AuthService from "@/services/auth";
import { AdminAuthentication } from "@/utils/jwt";

const schema = z.object({
  user_id: z.string().min(1, "user_id is required"),
  role_id: z.string().min(1, "roleType is required"),
});

export async function POST(req) {
  try {
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

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => e.message));
    }

    const service = new AuthService();
    const result = await service.assignRole(parsed.data);

    return apiResponse(result.status, result.message, result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
