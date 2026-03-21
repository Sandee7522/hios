import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import { AdminAuthentication } from "@/utils/jwt";
import { serverError, success } from "@/utils/apiResponse";
import {
  Categories,
  Courses,
  Lessons,
  Modules,
  Payments,
  UserRoles,
  Users,
} from "@/models/schemaModal";

export async function GET(req) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.code },
      );
    }

    const [adminRole, instructorRole] = await Promise.all([
      UserRoles.findOne({ user_type: "admin" }).select("_id").lean(),
      UserRoles.findOne({ user_type: "instructor" }).select("_id").lean(),
    ]);

    const [
      totalUsers,
      totalAdmins,
      totalInstructors,
      totalCategories,
      totalModules,
      totalLessons,
      totalSellingCourse,
      totalCourse,
      activeCourse,
      pendingCourse,
      incomeAgg,
    ] = await Promise.all([
      Users.countDocuments({}),
      adminRole?._id ? Users.countDocuments({ role_id: adminRole._id }) : 0,
      instructorRole?._id ? Users.countDocuments({ role_id: instructorRole._id }) : 0,
      Categories.countDocuments({}),
      Modules.countDocuments({}),
      Lessons.countDocuments({}),
      Payments.countDocuments({ status: "completed" }),
      Courses.countDocuments({}),
      Courses.countDocuments({
        $or: [{ isPublished: true }, { status: "published" }],
      }),
      Courses.countDocuments({ status: "pending" }),
      Payments.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalEarning = Number(incomeAgg?.[0]?.total || 0);

    return success("Dashboard stats fetched successfully", {
      users: totalUsers,
      admin: totalAdmins,
      instructor: totalInstructors,
      allCategory: totalCategories,
      allModules: totalModules,
      allLesson: totalLessons,
      totalSellingCourse,
      totalCourse,
      activeCourse,
      pendingCourse,
      totalEarning,
    });
  } catch (error) {
    console.error("GET /admin/dashboard/stats error:", error);
    return serverError();
  }
}
