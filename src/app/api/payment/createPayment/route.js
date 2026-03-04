import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { serverError, success } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";

const createPaymentSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  courseId: z.string().min(1, "courseId is required"),
  enrollmentId: z.string().min(1, "EnrollmentId is required"),
  razorpayOrderId: z.string().min(3),
  amount: z.number().positive(),
});

export async function POST(req) {
  try {
    await connectDB();

    const tokenUser = await VerifyToken(req);
    const body = await req.json();

    const validated = createPaymentSchema.parse({
      ...body,
      userId: tokenUser.id,
    });
    const service = new PaymentServise();
    const result = await service.createPayment(validated);

    return success("Pyment created Successfuly", result);
  } catch (error) {
    return serverError(error.message);
  }
}
