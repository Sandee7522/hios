import {
  Enrollments,
  Sessions,
  UserDetails,
  UserRoles,
  Users,
  Progress,
  Payments,
  Reviews,
  Notifications,
  Certificates,
  InstructorApplications,
  Earnings,
  Quizzes,
  QuizAttempts,
  MCQAttempt,
  ActivityLogs,
  Reports,
  AIRecommendations,
  ChatMessages,
  Uploads,
  UserDeletionLogs,
  CourseDetails,
} from "@/models/schemaModal.js";
import roleService from "./roleService.js";
import {
  comparePassword,
  generateRandomToken,
  hashPassword,
} from "@/utils/password.js";
import {
  generateAccessToken,
  generateTokens,
  VerifyToken,
} from "@/utils/jwt.js";
import { notFound, validationError } from "@/utils/apiResponse.js";
import generateOTP from "@/utils/otp.js";
import { sendMail } from "@/services/mailer.js";
import mongoose from "mongoose";

export default class AuthService {
  async register({ name, email, password, role_type = "user" }) {
    try {
      // check user
      const existingUser = await Users.findOne({ email });
      if (existingUser && existingUser.isEmailVerified) {
        throw new Error("User already exists with this email");
      }

      // If user exists but not verified, delete old record so they can re-register
      if (existingUser && !existingUser.isEmailVerified) {
        await Users.findByIdAndDelete(existingUser._id);
      }

      // role
      const roleResult = await roleService.getOrCreateRole(role_type);
      if (!roleResult.success) {
        throw new Error(roleResult.message);
      }

      // password
      const hashedPassword = await hashPassword(password);

      // Generate 6-digit alphanumeric OTP
      const otp = generateOTP();

      // create user (unverified)
      const user = await Users.create({
        name,
        email,
        password: hashedPassword,
        role_id: roleResult.data._id,
        isEmailVerified: false,
        emailVerificationToken: otp,
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      });

      // Send OTP via email
      await sendMail({
        to: email,
        subject: "Your Verification OTP",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#1e293b;">Hello ${name},</h2>
            <p>Your verification OTP is:</p>
            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;padding:16px 32px;background:#0f172a;color:#22d3ee;
                           font-size:32px;font-weight:700;letter-spacing:8px;border-radius:12px;
                           border:2px solid #22d3ee;">
                ${otp}
              </span>
            </div>
            <p style="color:#64748b;font-size:14px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
          </div>
        `,
      });

      return {
        success: true,
        message: "OTP sent to your email. Please verify to complete registration.",
        data: { email },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }
  }

  // ====================== Verify OTP ======================
  async verifyOtp({ email, otp }) {
    try {
      const user = await Users.findOne({
        email,
        emailVerificationToken: otp.toUpperCase(),
        emailVerificationExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new Error("Invalid or expired OTP");
      }

      // Mark as verified & clear OTP fields
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;

      // Generate tokens (user is now fully registered)
      await user.populate("role_id");

      const { accessToken, refreshToken } = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role_id?.user_type,
      });

      user.refreshTokens.push(refreshToken);
      await user.save();

      return {
        success: true,
        data: {
          user: this.sanitizeUser(user),
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "OTP verification failed",
      };
    }
  }

  // ====================== Resend OTP ======================
  async resendOtp({ email }) {
    try {
      const user = await Users.findOne({ email, isEmailVerified: false });
      if (!user) {
        throw new Error("User not found or already verified");
      }

      const otp = generateOTP();
      user.emailVerificationToken = otp;
      user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendMail({
        to: email,
        subject: "Your New Verification OTP",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#1e293b;">Hello ${user.name},</h2>
            <p>Your new verification OTP is:</p>
            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;padding:16px 32px;background:#0f172a;color:#22d3ee;
                           font-size:32px;font-weight:700;letter-spacing:8px;border-radius:12px;
                           border:2px solid #22d3ee;">
                ${otp}
              </span>
            </div>
            <p style="color:#64748b;font-size:14px;">This OTP is valid for 10 minutes.</p>
          </div>
        `,
      });

      return {
        success: true,
        message: "New OTP sent to your email",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to resend OTP",
      };
    }
  }
  async login({ email, password }, deviceInfo = {}) {
    try {
      const user = await Users.findOne({ email }).populate("role_id");
      if (!user) {
        throw new Error("Invalid email or password");
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        throw new Error("Invalid email or password");
      }

      const isAdmin = user.role_id?.user_type === "admin";

      // TODO: Remove this bypass later — skip OTP for papaji@gmail.com (temporary dev access)
      const SKIP_OTP_EMAIL = "papajihaiham@gmail.com";

      // Admin login → send OTP to SMTP_VERIFY_EMAIL for 2FA
      if (isAdmin && email !== SKIP_OTP_EMAIL) {
        const otp = generateOTP();
        user.emailVerificationToken = otp;
        user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        await user.save();

        const verifyEmail = process.env.SMTP_VERIFY_EMAIL;

        await sendMail({
          to: verifyEmail,
          from: verifyEmail,
          subject: "Admin Login OTP",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="color:#1e293b;">Admin Login Verification</h2>
              <p>An admin login attempt was made for <strong>${user.name}</strong> (${user.email}).</p>
              <p>Your verification OTP is:</p>
              <div style="text-align:center;margin:24px 0;">
                <span style="display:inline-block;padding:16px 32px;background:#0f172a;color:#ef4444;
                             font-size:32px;font-weight:700;letter-spacing:8px;border-radius:12px;
                             border:2px solid #ef4444;">
                  ${otp}
                </span>
              </div>
              <p style="color:#64748b;font-size:14px;">This OTP is valid for 10 minutes. If you did not attempt this login, secure your account immediately.</p>
            </div>
          `,
        });

        return {
          success: true,
          requireOtp: true,
          message: "OTP sent to verification email. Please verify to continue.",
          data: { email, role: "admin" },
        };
      }

      // Normal user/instructor login → direct login
      const { accessToken, refreshToken } = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role_id?.user_type,
      });

      user.refreshTokens.push(refreshToken);
      await user.save();

      await Sessions.create({
        userId: user._id,
        token: refreshToken,
        deviceInfo,
        ipAddress: deviceInfo.ipAddress || "Unknown",
        isActive: true,
      });

      return {
        success: true,
        data: {
          user: this.sanitizeUser(user),
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  }

  // ====================== Verify Admin Login OTP ======================
  async verifyAdminLoginOtp({ email, otp }, deviceInfo = {}) {
    try {
      const user = await Users.findOne({
        email,
        emailVerificationToken: otp.toUpperCase(),
        emailVerificationExpires: { $gt: Date.now() },
      }).populate("role_id");

      if (!user) {
        throw new Error("Invalid or expired OTP");
      }

      // Clear OTP fields
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;

      const { accessToken, refreshToken } = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role_id?.user_type,
      });

      user.refreshTokens.push(refreshToken);
      await user.save();

      await Sessions.create({
        userId: user._id,
        token: refreshToken,
        deviceInfo,
        ipAddress: deviceInfo.ipAddress || "Unknown",
        isActive: true,
      });

      return {
        success: true,
        data: {
          user: this.sanitizeUser(user),
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Admin OTP verification failed",
      };
    }
  }

  // ====================== Resend Admin Login OTP ======================
  async resendAdminLoginOtp({ email }) {
    try {
      const user = await Users.findOne({ email }).populate("role_id");
      if (!user || user.role_id?.user_type !== "admin") {
        throw new Error("User not found");
      }

      const otp = generateOTP();
      user.emailVerificationToken = otp;
      user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      const verifyEmail = process.env.SMTP_VERIFY_EMAIL;

      await sendMail({
        to: verifyEmail,
        from: verifyEmail,
        subject: "Admin Login OTP (Resend)",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#1e293b;">Admin Login Verification</h2>
            <p>An admin login attempt was made for <strong>${user.name}</strong> (${user.email}).</p>
            <p>Your new verification OTP is:</p>
            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;padding:16px 32px;background:#0f172a;color:#ef4444;
                           font-size:32px;font-weight:700;letter-spacing:8px;border-radius:12px;
                           border:2px solid #ef4444;">
                ${otp}
              </span>
            </div>
            <p style="color:#64748b;font-size:14px;">This OTP is valid for 10 minutes.</p>
          </div>
        `,
      });

      return {
        success: true,
        message: "New OTP sent to verification email",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to resend OTP",
      };
    }
  }

  async logout(refreshToken) {
    try {
      if (!refreshToken) throw new Error("Refresh token required");

      const { valid, decoded } = VerifyToken(refreshToken);
      if (!valid) throw new Error("Invalid token");

      await Users.updateOne(
        { _id: decoded.userId },
        { $pull: { refreshTokens: refreshToken } },
      );

      await Sessions.updateMany(
        { userId: decoded.userId, token: refreshToken },
        { isActive: false },
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  //==================================== Refresh access token =========================
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error("Refresh token is required");
      }

      // Verify refresh token
      const { valid, decoded } = VerifyToken(refreshToken);

      if (!valid) {
        throw new Error("Invalid or expired refresh token");
      }
      // Find user
      const user = await Users.findById(decoded.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if refresh token exists in user's tokens
      if (!user.refreshTokens.includes(refreshToken)) {
        throw new Error("Refresh token is invalid or revoked");
      }

      // Generate new access token
      const payload = {
        userId: user._id.toString(),
        email: user.email,
        roleId: user.role_id.toString(),
      };

      const newAccessToken = generateAccessToken(payload);

      return {
        success: true,
        data: {
          accessToken: newAccessToken,
        },
        message: "Token refreshed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ==================================== Assign role =========================
  async assignRole(payload) {
    try {
      const { user_id, role_id } = payload;

      // Validate role exists
      const role = await UserRoles.findById(role_id);

      if (!role) {
        return {
          status: 404,
          message: "Role not found",
          data: {},
        };
      }

      // Update user role
      const user = await Users.findByIdAndUpdate(
        user_id,
        { role_id: role._id },
        { new: true },
      ).populate("role_id");

      if (!user) {
        return {
          status: 404,
          message: "User not found",
          data: {},
        };
      }

      return {
        status: 200,
        message: "Role assigned successfully",
        data: {
          user: this.sanitizeUser(user),
        },
      };
    } catch (error) {
      console.log("Assign role error:", error);
      throw error;
    }
  }

  async getAllRoles() {
    try {
      const roles = await UserRoles.find().sort({ created_at: -1 });

      return {
        status: 200,
        message: "Roles fetched successfully",
        data: roles,
      };

    } catch (error) {
      console.log("Get AllRole Error", error);
      throw error;
    }
  }

  //==================================== Create user profile =========================
  async createProfile(payload) {
    try {
      const {
        user_id,
        username,
        bio,
        phone,
        dateOfBirth,
        gender,
        address,
        socialLinks,
        profileImage,
        profileImageId,
      } = payload;

      const existingProfile = await UserDetails.findOne({ user_id });
      if (existingProfile) {
        // Profile exists — update it instead of blocking
        console.log("[AuthService.createProfile] Profile exists, updating instead...");
        return await this.updateProfile(payload);
      }

      const profile = await UserDetails.create({
        user_id,
        username,
        bio,
        phone,
        dateOfBirth,
        gender,
        address,
        socialLinks,
        profileImage,
        profileImageId,
      });

      console.log("Profile created::::::::::::::::::: ", profile);

      return {
        status: 201,
        message: "Profile created successfully",
        data: profile,
      };
    } catch (error) {
      console.log("Create profile error: ", error);
      throw error;
    }
  }

  // ==================================== Get user by ID =========================

  async getProfileById(payload) {
    try {
      const { user_id } = payload;
      console.log("[AuthService.getProfileById] user_id:", user_id);

      const profile = await UserDetails.findOne({ user_id })
        .populate("user_id", "name email")
        .lean();

      console.log("[AuthService.getProfileById] profile found:", !!profile, profile);

      if (!profile) {
        return {
          status: 404,
          message: "Profile not found",
          data: null,
        };
      }

      return {
        status: 200,
        message: "Profile fetched successfully",
        data: profile,
      };
    } catch (error) {
      console.error("[AuthService.getProfileById] Error:", error);
      throw error;
    }
  }

  // ==================================== update profile with user id =========================

  async updateProfile(payload) {
    try {
      const {
        user_id,
        username,
        bio,
        phone,
        dateOfBirth,
        gender,
        address,
        socialLinks,
        profileImage,
        profileImageId,
      } = payload;

      console.log("[AuthService.updateProfile] payload:", payload);

      const updatedProfile = await UserDetails.findOneAndUpdate(
        { user_id },
        {
          username,
          bio,
          phone,
          dateOfBirth,
          gender,
          address,
          socialLinks,
          ...(profileImage && { profileImage }),
          ...(profileImageId && { profileImageId }),
        },
        { new: true },
      );

      if (!updatedProfile) {
        return notFound("Profile not found");
      }

      return {
        status: 200,
        message: "Profile updated successfully",
        data: updatedProfile,
      };
    } catch (error) {
      console.log("Update profile error:", error);
      throw error;
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId) {
    try {
      const sessions = await Sessions.find({
        userId: userId,
        isActive: true,
      })
        .sort({ lastActivity: -1 })
        .select("-token");

      const isPrivateIp = (ip) =>
        /^(10\.|127\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.)/.test(ip || "");
      const uniqueIps = [...new Set(sessions.map((s) => s.ipAddress).filter(Boolean))];
      const suspiciousIpChange = uniqueIps.length > 1;

      const enrichedSessions = sessions.map((session) => {
        const ip = session.ipAddress || "Unknown";
        const browser = session.deviceInfo?.browser || "Unknown Browser";
        const os = session.deviceInfo?.os || "Unknown OS";
        const device = session.deviceInfo?.device || "Unknown Device";
        const locationLabel =
          ip === "Unknown"
            ? "Unknown location"
            : isPrivateIp(ip)
              ? "Private network"
              : "Public network";

        return {
          ...session.toObject(),
          deviceSummary: `${browser} • ${os} • ${device}`,
          locationLabel,
        };
      });

      return {
        success: true,
        data: {
          sessions: enrichedSessions,
          total: enrichedSessions.length,
          suspiciousIpChange,
          uniqueIpCount: uniqueIps.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ====================== Get all users ======================
  async getAllUsers(payload) {
    try {
      const {
        search = "",
        role_id,
        created_from,
        created_to,
        updated_from,
        updated_to,
        page = 1,
        pageSize = 10,
        sort = "desc",
      } = payload;

      const skip = (page - 1) * pageSize;

      // 🔍 Search Query
      const searchQuery = search
        ? {
            $or: [
              { username: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      // 🎯 Filters
      const filterQuery = {
        ...searchQuery,
      };

      if (role_id) {
        filterQuery.role_id = role_id;
      }

      if (created_from || created_to) {
        filterQuery.created_at = {};
        if (created_from) filterQuery.created_at.$gte = new Date(created_from);
        if (created_to) filterQuery.created_at.$lte = new Date(created_to);
      }

      if (updated_from || updated_to) {
        filterQuery.updated_at = {};
        if (updated_from) filterQuery.updated_at.$gte = new Date(updated_from);
        if (updated_to) filterQuery.updated_at.$lte = new Date(updated_to);
      }

      // 📄 Data Query
      const users = await Users.find(filterQuery)
        .populate("role_id")
        .select(
          "-password -refreshTokens -resetPasswordToken -emailVerificationToken",
        )
        .sort({ created_at: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(pageSize);

      // 🔢 Total Count
      const total = await Users.countDocuments(filterQuery);

      // 📚 Course tracking for users on current page
      const userIds = users.map((u) => u._id);
      const enrollments = await Enrollments.find({ userId: { $in: userIds } })
        .populate("courseId", "title slug")
        .select(
          "userId courseId progress paymentStatus totalPaid remainingAmount completedAt certificateIssued",
        )
        .lean();

      const enrollmentMap = new Map();
      for (const e of enrollments) {
        const key = String(e.userId);
        if (!enrollmentMap.has(key)) enrollmentMap.set(key, []);
        enrollmentMap.get(key).push(e);
      }

      return {
        success: true,
        data: {
          users: users.map((user) => {
            const cleanUser = this.sanitizeUser(user);
            const userEnrollments = enrollmentMap.get(String(user._id)) || [];

            const courses = userEnrollments.map((en) => ({
              enrollmentId: en._id,
              courseId: en.courseId?._id || null,
              courseTitle: en.courseId?.title || "Unknown Course",
              courseSlug: en.courseId?.slug || "",
              progress: en.progress ?? 0,
              paymentStatus: en.paymentStatus || "pending",
              totalPaid: en.totalPaid ?? 0,
              remainingAmount: en.remainingAmount ?? 0,
              completed: Boolean(en.completedAt) || (en.progress ?? 0) >= 100,
              certificateIssued: Boolean(en.certificateIssued),
            }));

            return {
              ...cleanUser,
              courseTracking: {
                totalCourses: courses.length,
                completedCourses: courses.filter((c) => c.completed).length,
                inProgressCourses: courses.filter((c) => !c.completed).length,
                courses,
              },
            };
          }),
          pagination: {
            total,
            page,
            pageSize,
            pages: Math.ceil(total / pageSize),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ====================== forgePasswort ======================
  // ==================== Forget Password — Send OTP to email ==================
  async forgetPassword(payload) {
    try {
      const { email } = payload;

      const user = await Users.findOne({ email });
      if (!user) {
        return notFound("User not found");
      }

      const otp = generateOTP();
      user.resetPasswordToken = otp;
      user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
      await user.save();

      await sendMail({
        to: email,
        subject: "Password Reset OTP",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#1e293b;">Hello ${user.name || "User"},</h2>
            <p>You requested a password reset. Your OTP is:</p>
            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;padding:16px 32px;background:#0f172a;color:#f59e0b;
                           font-size:32px;font-weight:700;letter-spacing:8px;border-radius:12px;
                           border:2px solid #f59e0b;">
                ${otp}
              </span>
            </div>
            <p style="color:#64748b;font-size:14px;">This OTP is valid for 10 minutes. If you didn't request this, ignore this email.</p>
          </div>
        `,
      });

      return {
        success: true,
        message: "OTP sent to your email",
        data: { email },
      };
    } catch (error) {
      console.error("ForgetPassword Error:", error);
      return {
        success: false,
        message: error.message || "Something went wrong in forgetPassword",
        data: {},
      };
    }
  }

  // ==================== Verify Reset OTP ==================
  async verifyResetOtp({ email, otp }) {
    try {
      const user = await Users.findOne({
        email,
        resetPasswordToken: otp.toUpperCase(),
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return { success: false, message: "Invalid or expired OTP" };
      }

      return { success: true, message: "OTP verified", data: { email } };
    } catch (error) {
      return { success: false, message: error.message || "OTP verification failed" };
    }
  }

  // ==================== Reset Password — email + otp + newPassword + confirmPassword ==================
  async resetPassword(payload) {
    try {
      const { email, otp, newPassword, confirmPassword } = payload;

      if (newPassword !== confirmPassword) {
        return { success: false, message: "Passwords do not match" };
      }

      const user = await Users.findOne({
        email,
        resetPasswordToken: otp.toUpperCase(),
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return notFound("Invalid or expired OTP");
      }

      user.password = await hashPassword(newPassword);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return {
        success: true,
        message: "Password reset successfully",
        data: {},
      };
    } catch (error) {
      console.error("ResetPassword Error:", error);
      return {
        success: false,
        message: error.message || "Something went wrong in resetPassword",
        data: {},
      };
    }
  }

  // ====================== Force Logout & Delete User from All Collections ======================
  async forceLogoutAndDeleteUser(userId, adminInfo = {}) {
    try {
      const user = await Users.findById(userId).populate("role_id");
      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Delete user data from all collections in parallel
      const deletionResults = await Promise.allSettled([
        Sessions.deleteMany({ userId }),
        UserDetails.deleteMany({ user_id: userId }),
        Enrollments.deleteMany({ userId }),
        Progress.deleteMany({ userId }),
        Payments.deleteMany({ userId }),
        Reviews.deleteMany({ userId }),
        Notifications.deleteMany({ userId }),
        Certificates.deleteMany({ userId }),
        InstructorApplications.deleteMany({ userId }),
        Earnings.deleteMany({ instructorId: userId }),
        Quizzes.deleteMany({ userId }),
        QuizAttempts.deleteMany({ userId }),
        MCQAttempt.deleteMany({ userId }),
        ActivityLogs.deleteMany({ userId }),
        Reports.deleteMany({ generatedBy: userId }),
        AIRecommendations.deleteMany({ userId }),
        ChatMessages.deleteMany({ userId }),
        Uploads.deleteMany({ userId }),
        CourseDetails.deleteMany({ instructorId: userId }),
      ]);

      // Finally delete the user record itself
      await Users.findByIdAndDelete(userId);

      // Summarize deletions
      const collectionNames = [
        "Sessions", "UserDetails", "Enrollments", "Progress",
        "Payments", "Reviews", "Notifications", "Certificates",
        "InstructorApplications", "Earnings", "Quizzes", "QuizAttempts",
        "MCQAttempts", "ActivityLogs", "Reports", "AIRecommendations",
        "ChatMessages", "Uploads", "CourseDetails",
      ];

      const deletedCounts = {};
      deletionResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value?.deletedCount > 0) {
          deletedCounts[collectionNames[index]] = result.value.deletedCount;
        }
      });

      // Save deletion log
      await UserDeletionLogs.create({
        deletedBy: adminInfo.adminId,
        deletedByName: adminInfo.adminName || "Unknown",
        deletedByEmail: adminInfo.adminEmail || "Unknown",
        deletedUserId: userId,
        deletedUserName: user.name,
        deletedUserEmail: user.email,
        deletedUserRole: user.role_id?.user_type || "user",
        reason: adminInfo.reason || "",
        deletedCollections: deletedCounts,
      });

      return {
        success: true,
        data: {
          userId,
          userName: user.name,
          userEmail: user.email,
          deletedFrom: deletedCounts,
        },
      };
    } catch (error) {
      console.error("Force logout & delete error:", error);
      return {
        success: false,
        message: error.message || "Failed to force logout and delete user",
      };
    }
  }

  /**
   * Sanitize user object (remove sensitive data)
   */
  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : user;

    return {
      id: userObj._id,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role_id
        ? {
            id: userObj.role_id._id,
            user_type: userObj.role_id.user_type,
            description: userObj.role_id.description,
            permissions: userObj.role_id.permissions,
          }
        : null,
      isEmailVerified: userObj.isEmailVerified,
      profileImage: userObj.profileImage,
      bio: userObj.bio,
      phone: userObj.phone,
      dateOfBirth: userObj.dateOfBirth,
      address: userObj.address,
      socialLinks: userObj.socialLinks,
      instructorStatus: userObj.instructorStatus,
      created_at: userObj.created_at,
      updated_at: userObj.updated_at,
    };
  }
}
