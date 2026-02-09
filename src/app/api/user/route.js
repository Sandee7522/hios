// import connectDB from "@/lib/connectDB";

import connectDB from "@/config/database";

export async function GET() {
  try {
    await connectDB();
    return Response.json(
      { message: "✅ DB connected successfully" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: "❌ DB connection failed", error: error.message },
      { status: 500 }
    );
  }
}
