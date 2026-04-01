import connectDB from "@/config/database";
import { serverError, success } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import PaymentServise from "@/services/payment";
export async function GET(req) {
  try {
    await connectDB();

    const tokenUser = await VerifyToken(req);

    const service = new PaymentServise();
    const result = await service.getPaymentsByUserId({
      userId: tokenUser.data?.user?._id || tokenUser.id,
    });

    return success(result);
  } catch (error) {
    return serverError(error.message);
  }
}
