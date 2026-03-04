import connectDB from "@/config/database";
import { serverError, success } from "@/utils/apiResponse";
import PaymentService from "@/services/payment.service";
import { VerifyToken } from "@/utils/jwt";


const userIdSchema = z.object({
  userId: objectId,
});
export async function GET(req) {
  try {
    await connectDB();

    const tokenUser = await VerifyToken(req);

    const validated = userIdSchema.parse({
      userId: tokenUser.id,
    });
    const service = new PaymentService();
    const result = await service.getPaymentsByUserId(validated);

    return success(result);
  } catch (error) {
    return serverError(error.message);
  }
}
