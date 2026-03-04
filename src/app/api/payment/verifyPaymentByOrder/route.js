import connectDB from "@/config/database";
import { serverError, success } from "@/utils/apiResponse";
import PaymentService from "@/services/payment.service";
import { VerifyToken } from "@/utils/jwt";
import * as z from "zod";
const orderIdSchema = z.object({
  razorpayOrderId: z.string(),
});
export async function POST(req) {
  try {
    await connectDB();
    await VerifyToken();
    const body = await req.json();
    const validated = orderIdSchema.parse(body);
    const service = new PaymentService();
    const result = await service.getPaymentByOrderId(validated);

    return success(result);
  } catch (error) {
    return serverError(error.message);
  }
}
