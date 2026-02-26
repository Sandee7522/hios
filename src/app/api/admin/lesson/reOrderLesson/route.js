// import { NextResponse } from "next/server";
// import * as z from "zod";
// import connectDB from "@/config/database";
// import { serverError, success } from "@/utils/apiResponse";
// import { AdminAuthentication } from "@/utils/jwt";
// import CourseServises from "@/services/courses";

// const reorderLessonSchema = z.object({
//   moduleId: z.string().min(1, "moduleId required"),
//   lessonOrders: z
//     .array(
//       z.object({
//         lessonId: z.string().min(1),
//         order: z.number(),
//       }),
//     )
//     .min(1, "lessonOrders required"),
// });

// export async function POST(req) {
//   try {
//     await connectDB();

//     const admin = await AdminAuthentication(req);
//     if (!admin.status) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: admin.message,
//         },
//         { status: admin.code },
//       );
//     }

//     const body = await req.json();
//     const validated = reorderLessonSchema.parse(body);
//     const service = new CourseServises();
//     const result = await service.reOrderLesson(validated);

//     return success("Reorder Data:::", result);
//   } catch (error) {
//     console.error("reorder lesson error:", error);

//     if (error?.name === "ZodError") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: error.issues?.[0]?.message || "Validation error",
//         },
//         { status: 400 },
//       );
//     }

//     return serverError();
//   }
// }
