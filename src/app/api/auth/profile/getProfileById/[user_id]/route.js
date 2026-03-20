import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import { Users } from "@/models/schemaModal";
import { VerifyToken } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    await connectDB();
    await VerifyToken(req);

    const params = await context.params;
    const { user_id } = params;

    console.log("[GetProfile] user_id:", user_id);

    if (!user_id) {
      return NextResponse.json({ status: 400, message: "user_id is required" }, { status: 400 });
    }

    const service = new AuthService();
    const result = await service.getProfileById({ user_id });

    console.log("[GetProfile] Service result status:", result.status, "has data:", !!result.data);

    // Profile found in UserDetails — return it
    if (result.status === 200 && result.data) {
      console.log("[GetProfile] Returning full profile with user_id:", result.data.user_id);
      return NextResponse.json(
        { status: 200, message: result.message, data: result.data },
        { status: 200 },
      );
    }

    // Profile NOT found in UserDetails — get name/email from Users table
    console.log("[GetProfile] No profile found, looking up Users table...");
    const user = await Users.findById(user_id).select("name email created_at").lean();
    console.log("[GetProfile] User from Users table:", user);

    if (user) {
      return NextResponse.json(
        {
          status: 200,
          message: "Profile not created yet",
          data: {
            user_id: { _id: user._id, name: user.name, email: user.email },
            created_at: user.created_at,
            profileNotCreated: true,
          },
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ status: 404, message: "User not found" }, { status: 404 });
  } catch (error) {
    console.error("[GetProfile] Error:", error);
    return NextResponse.json({ status: 500, message: error.message }, { status: 500 });
  }
}
