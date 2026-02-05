
import connectDB from "@/config/database";

export async function GET() {
  try {
    await connectDB();
    return new Response(JSON.stringify({ message: "✅ DB connected successfully!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "❌ DB connection failed", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
