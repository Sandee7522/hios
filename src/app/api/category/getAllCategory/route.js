import connectDB from "@/config/database";
import { serverError, success } from "@/utils/apiResponse";
import CourseServises from "@/services/courses";

export async function POST(req) {
  try {
    await connectDB();

    const payload = await req.json();

    const service = new CourseServises();
    const result = await service.getAllCategory(payload);

    return success("Categories fetched successfully", result);
  } catch (error) {
    console.log("getAllCategory route error", error);
    return serverError();
  }
}
