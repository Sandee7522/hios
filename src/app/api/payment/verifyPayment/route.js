import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import { serverError, success } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import * as z from "zod";
const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(req) {
  try {
    await connectDB();
    await VerifyToken();
    const body = await req.json();
    const validated = verifyPaymentSchema.parse(body);
    const service = new PaymentServise();
    const result = await service.verifyAndCompletePayment(validated);

    return success(result);
  } catch (error) {
    return serverError(error.message);
  }
}
