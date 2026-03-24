import { Coupons, Users, Courses } from "@/models/schemaModal";
import { customAlphabet } from "nanoid";
import mongoose from "mongoose";

const generateCouponCode = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

export default class CouponService {
  // ================= Generate Coupon (Admin) =================
  async generateCoupon({
    adminId,
    userId,
    discountType = "percentage",
    discountValue,
    maxDiscount,
    courseId,
    expiresInDays = 30,
  }) {
    try {
      if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, message: "Invalid userId" };
      }
      if (courseId && !mongoose.Types.ObjectId.isValid(courseId)) {
        return { success: false, message: "Invalid courseId" };
      }

      if (discountType === "percentage" && (discountValue < 1 || discountValue > 100)) {
        return { success: false, message: "Percentage must be between 1 and 100" };
      }

      const code = generateCouponCode();
      const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

      const coupon = await Coupons.create({
        code,
        createdBy: adminId,
        assignedTo: userId || null,
        discountType,
        discountValue,
        maxDiscount: maxDiscount || null,
        courseId: courseId || null,
        expiresAt,
      });

      const populated = await Coupons.findById(coupon._id)
        .populate("assignedTo", "name email")
        .populate("courseId", "title")
        .populate("createdBy", "name")
        .lean();

      return { success: true, data: populated };
    } catch (error) {
      console.error("generateCoupon error:", error);
      return { success: false, message: error.message || "Failed to generate coupon" };
    }
  }

  // ================= Validate Coupon (User) =================
  async validateCoupon({ code, userId, courseId }) {
    try {
      const coupon = await Coupons.findOne({
        code: code.toUpperCase(),
        isUsed: false,
        expiresAt: { $gt: new Date() },
      }).lean();

      if (!coupon) {
        return { success: false, message: "Invalid or expired coupon" };
      }

      // Check if assigned to specific user
      if (coupon.assignedTo && coupon.assignedTo.toString() !== userId) {
        return { success: false, message: "This coupon is not assigned to you" };
      }

      // Check if assigned to specific course
      if (coupon.courseId && coupon.courseId.toString() !== courseId) {
        return { success: false, message: "This coupon is not valid for this course" };
      }

      return {
        success: true,
        data: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscount: coupon.maxDiscount,
        },
      };
    } catch (error) {
      console.error("validateCoupon error:", error);
      return { success: false, message: "Failed to validate coupon" };
    }
  }

  // ================= Apply Coupon (mark as used) =================
  async applyCoupon({ code, userId }) {
    try {
      const coupon = await Coupons.findOneAndUpdate(
        {
          code: code.toUpperCase(),
          isUsed: false,
          expiresAt: { $gt: new Date() },
        },
        {
          isUsed: true,
          usedBy: userId,
          usedAt: new Date(),
        },
        { new: true },
      );

      if (!coupon) {
        return { success: false, message: "Coupon already used or expired" };
      }

      return { success: true, data: coupon };
    } catch (error) {
      console.error("applyCoupon error:", error);
      return { success: false, message: "Failed to apply coupon" };
    }
  }

  // ================= Get Coupons by User (Admin view) =================
  async getCouponsByUser(userId) {
    try {
      const coupons = await Coupons.find({ assignedTo: userId })
        .populate("courseId", "title")
        .populate("createdBy", "name")
        .sort({ created_at: -1 })
        .lean();

      return { success: true, data: coupons };
    } catch (error) {
      console.error("getCouponsByUser error:", error);
      return { success: false, message: "Failed to fetch coupons" };
    }
  }
}
