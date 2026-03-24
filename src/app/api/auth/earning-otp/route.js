import connectDB from "@/config/database";
import { Users } from "@/models/schemaModal";
import { success, validationError, serverError } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";
import generateOTP from "@/utils/otp";
import { sendMail } from "@/services/mailer";

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

    const adminData = admin.data?.adminData;
    const otp = generateOTP();

    // Store OTP in admin's emailVerificationToken
    await Users.findByIdAndUpdate(adminData._id, {
      emailVerificationToken: otp,
      emailVerificationExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    });

    const verifyEmail = process.env.SMTP_VERIFY_EMAIL;

    await sendMail({
      to: verifyEmail,
      from: verifyEmail,
      subject: "Earnings View OTP",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#1e293b;">Earnings Access Verification</h2>
          <p><strong>${adminData.name}</strong> (${adminData.email}) is requesting to view Total Earnings.</p>
          <p>Your OTP is:</p>
          <div style="text-align:center;margin:24px 0;">
            <span style="display:inline-block;padding:16px 32px;background:#0f172a;color:#22c55e;
                         font-size:32px;font-weight:700;letter-spacing:8px;border-radius:12px;
                         border:2px solid #22c55e;">
              ${otp}
            </span>
          </div>
          <p style="color:#64748b;font-size:14px;">This OTP is valid for 5 minutes.</p>
        </div>
      `,
    });

    return success("OTP sent to verification email");
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
