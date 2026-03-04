import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { serverError, success } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";

const refundSchema = z.object({
  enrollmentId: z.string().min(1, "EnrollmentId is required"),
  refundAmount: z.number().positive(),
  refundReason: z.string().min(3),
});

export async function POST(req) {
  try {
    await connectDB();

    await VerifyToken(req);

    const body = await req.json();
    const validated = refundSchema.parse(body);
    const service = PaymentServise();
    const result = await service.initiateRefund(validated);

    return success(result);
  } catch (error) {
    return serverError(error.message);
  }
}
