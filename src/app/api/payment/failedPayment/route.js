import connectDB from "@/config/database";
import PaymentServise from "@/services/payment";
import * as z from "zod";
const orderIdSchema = z.object({
  razorpayOrderId: z.string(),
});
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const validated = orderIdSchema.parse(body);
    const service = new PaymentServise();
    const result = await service.makePaymentFailed(validated.razorpayOrderId);

    return success(result);
  } catch (error) {
    return serverError(error.message);
  }
}
