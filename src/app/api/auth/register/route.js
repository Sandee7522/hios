import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { created, serverError, validationError } from "@/utils/apiResponse";
import { z } from "zod";

const allowedEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
];

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),

  email: z
    .string()
    .regex(emailRegex, "Invalid email format")
    .refine((email) => allowedEmailDomains.includes(email.split("@")[1]), {
      message: "Email domain is not supported",
    }),

  password: z.string().min(6, "Password must be at least 6 characters"),

  role_type: z.string().optional(),
});

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((err) => err.message));
    }

    const service = new AuthService();
    const result = await service.register(parsed.data);

    return created("User registered successfully", result);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
