import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { serverError, success, validationError } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import { z } from "zod";

const createProfileSchema = z.object({
  user_id: z.string().min(1, "User id is required"),
  username: z.string().min(1, "Username is required"),
  bio: z.string().optional(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Invalid international phone number")
    .optional(),
  dateOfBirth: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }),
socialLinks: z.array(z.string().url("Invalid URL")).optional(),
});

export async function POST(req) {
  try {
    await connectDB();

    const auth = await VerifyToken(req);
    if (!auth.status) {
      return validationError([auth.message], auth.code);
    }

    const contentType = req.headers.get("content-type");
    const params =
      contentType && contentType.includes("application/json")
        ? await req.json()
        : {};

    const validation = createProfileSchema.safeParse(params);
    if (!validation.success) {
      const errors = validation.error.issues.map((e) => e.message);
      return validationError(errors, 422);
    }

    const service = new AuthService();
    const result = await service.createProfile(validation.data);

    return success(result.message, result.data);
  } catch (error) {
    console.error(error);
    return serverError(error.message);
  }
}

