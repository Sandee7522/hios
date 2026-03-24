import connectDB from "@/config/database";
import { UserDeletionLogs } from "@/models/schemaModal";
import { success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.code },
      );
    }

    const { page = 1, pageSize = 10, search = "" } = await req.json();
    const skip = (page - 1) * pageSize;

    const searchQuery = search
      ? {
          $or: [
            { deletedUserName: { $regex: search, $options: "i" } },
            { deletedUserEmail: { $regex: search, $options: "i" } },
            { deletedByName: { $regex: search, $options: "i" } },
            { reason: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [logs, total] = await Promise.all([
      UserDeletionLogs.find(searchQuery)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      UserDeletionLogs.countDocuments(searchQuery),
    ]);

    return success("Deletion logs fetched", {
      logs,
      pagination: { total, page, pageSize, pages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
