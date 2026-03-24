import connectDB from "@/config/database";
import { Users, Payments } from "@/models/schemaModal";
import { success, validationError, serverError } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { sendMail } from "@/services/mailer";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  otp: z.string().length(6, "OTP must be 6 characters"),
});

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

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.errors.map((e) => e.message));
    }

    const adminData = admin.data?.adminData;

    const user = await Users.findOne({
      _id: adminData._id,
      emailVerificationToken: parsed.data.otp.toUpperCase(),
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return validationError("Invalid or expired OTP");
    }

    // Clear OTP
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Fetch total earnings
    const incomeAgg = await Payments.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalEarning = Number(incomeAgg?.[0]?.total || 0);

    // Fetch today's earnings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayAgg = await Payments.aggregate([
      { $match: { status: "completed", createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const todayEarning = Number(todayAgg?.[0]?.total || 0);

    // Total completed transactions
    const totalTransactions = await Payments.countDocuments({ status: "completed" });

    // Send earnings report to SMTP_VERIFY_EMAIL
    const verifyEmail = process.env.SMTP_VERIFY_EMAIL;
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    await sendMail({
      to: verifyEmail,
      from: verifyEmail,
      subject: `Earnings Report — ₹${totalEarning.toLocaleString("en-IN")}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#1e293b;">Earnings Report</h2>
          <p style="color:#64748b;">Requested by <strong>${adminData.name}</strong> (${adminData.email}) at ${now}</p>

          <table style="width:100%;border-collapse:collapse;margin:24px 0;">
            <tr style="border-bottom:2px solid #e2e8f0;">
              <td style="padding:12px 0;color:#64748b;font-size:14px;">Total Earnings</td>
              <td style="padding:12px 0;font-weight:700;font-size:24px;color:#22c55e;text-align:right;">₹${totalEarning.toLocaleString("en-IN")}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:12px 0;color:#64748b;font-size:14px;">Today's Earnings</td>
              <td style="padding:12px 0;font-weight:600;font-size:18px;color:#3b82f6;text-align:right;">₹${todayEarning.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;color:#64748b;font-size:14px;">Total Transactions</td>
              <td style="padding:12px 0;font-weight:600;font-size:18px;color:#8b5cf6;text-align:right;">${totalTransactions}</td>
            </tr>
          </table>

          <p style="color:#94a3b8;font-size:12px;margin-top:16px;">This is an automated earnings report from HIOS Admin Panel.</p>
        </div>
      `,
    });

    return success("OTP verified. Earnings report sent to verification email.", {
      totalEarning,
    });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
