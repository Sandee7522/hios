import { Enrollments, Payments } from "@/models/schemaModal";
import mongoose from "mongoose";
import crypto from "crypto";

export default class PaymentServise {
  /* ================= ENROLL USER ================= */
  async enrollUserProcess(payload) {
    try {
      const { userId, courseId, totalPaid = 0, remainingAmount = 0 } = payload;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(courseId)
      ) {
        throw new Error("Invalid user or course ID");
      }

      const existing = await Enrollments.findOne({ userId, courseId });
      if (existing) {
        return {
          success: false,
          message: "User already enrolled in this course",
        };
      }

      const paymentStatus =
        remainingAmount === 0 ? "full" : totalPaid > 0 ? "partial" : "pending";

      const newEnrollment = await Enrollments.create({
        userId,
        courseId,
        totalPaid,
        remainingAmount,
        paymentStatus,
      });

      return {
        success: true,
        data: newEnrollment,
      };
    } catch (error) {
      console.error("enrollUserProcess Error:", error);
      throw error;
    }
  }

  /* ================= GET SINGLE ENROLLMENT ================= */
  async getEnrollment({ userId, courseId }) {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(courseId)
      ) {
        throw new Error("Invalid user or course ID");
      }

      const enrollment = await Enrollments.findOne({ userId, courseId })
        .populate("courseId", "title description price")
        .lean();

      if (!enrollment) {
        return {
          success: false,
          message: "Enrollment not found",
        };
      }

      return {
        success: true,
        data: enrollment,
      };
    } catch (error) {
      console.error("getEnrollment Error:", error);
      throw error;
    }
  }

  /* ================= GET ALL USER ENROLLMENTS ================= */
  async getUserEnrollments({ userId }) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }

      const enrollments = await Enrollments.find({ userId })
        .populate("courseId", "title description price thumbnail slug totalFee currency")
        .populate({ path: "courseId", populate: { path: "instructorId", select: "name" } })
        .lean();

      return {
        success: true,
        data: enrollments || [],
      };
    } catch (error) {
      console.error("getUserEnrollments Error:", error);
      throw error;
    }
  }

  /* ================= UPDATE PROGRESS ================= */
  async updateProgress(payload) {
    try {
      const { userId, courseId, progress, completedLessonId } = payload;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(courseId)
      ) {
        throw new Error("Invalid user or course ID");
      }

      const enrollment = await Enrollments.findOne({ userId, courseId });

      if (!enrollment) {
        return {
          success: false,
          message: "Enrollment not found",
        };
      }

      /* Update progress */
      if (typeof progress === "number") {
        enrollment.progress = Math.min(100, Math.max(0, progress));
      }

      enrollment.lastAccessedAt = new Date();

      /* Add completed lesson */
      if (
        completedLessonId &&
        mongoose.Types.ObjectId.isValid(completedLessonId) &&
        !enrollment.completedLessons.some(
          (id) => id.toString() === completedLessonId,
        )
      ) {
        enrollment.completedLessons.push(completedLessonId);
      }

      /* Mark completed */
      if (enrollment.progress >= 100) {
        enrollment.completedAt = enrollment.completedAt || new Date();
      }

      enrollment.updated_at = new Date();

      const updated = await enrollment.save();

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error("updateProgress Error:", error);
      throw error;
    }
  }

  /* ================= UPDATE PAYMENT ================= */
  async updatePayment(payload) {
    try {
      const { userId, courseId, amountPaid } = payload;

      const enrollment = await Enrollments.findOne({ userId, courseId });
      if (!enrollment) {
        return { success: false, message: "Enrollment not found" };
      }

      enrollment.totalPaid += amountPaid;
      enrollment.remainingAmount = Math.max(
        0,
        enrollment.remainingAmount - amountPaid,
      );

      enrollment.paymentStatus =
        enrollment.remainingAmount === 0 ? "full" : "partial";

      enrollment.updated_at = new Date();

      await enrollment.save();

      return {
        success: true,
        data: enrollment,
      };
    } catch (error) {
      console.error("updatePayment Error:", error);
      throw error;
    }
  }

  // ****************ADMIN APIs neeed to be implemented****************

  // Get all enrollments (global)

  // Get enrollment by userId

  // Force complete course

  // Issue certificate manually

  // =============================================================================
  //                         PAYMENT SERVICE
  // =============================================================================

  //   If you want next-level upgrade:

  // 🔥 Webhook handler for Razorpay

  // 🔥 Admin payment analytics API

  // 🔥 Partial payment system with 25% / 50% / 100%

  // 🔥 Payment dashboard with aggregation

  // 🔥 Clean Architecture (Controller → Service → Repository)

  async createPayment(payload) {
    console.log("Create Payment Payload:::::::::::::::::::::::", payload);
    try {
      const payment = await Payments.create(payload);

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      console.error("createPayment Error:", error);
      throw error;
    }
  }

  async verifyAndCompletePayment(payload) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload;

      const payment = await Payments.findOne({ razorpayOrderId }).session(
        session,
      );

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status === "completed") {
        throw new Error("Payment already completed");
      }

      //  Razorpay Signature Verification
      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZZER_PAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        throw new Error("Invalid Razorpay signature");
      }

      // Update payment
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = "completed";

      await payment.save({ session });

      // Update enrollment
      const enrollment = await Enrollments.findById(
        payment.enrollmentId,
      ).session(session);

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      enrollment.totalPaid += payment.amount;
      enrollment.remainingAmount = Math.max(
        0,
        enrollment.remainingAmount - payment.amount,
      );

      enrollment.paymentStatus =
        enrollment.remainingAmount === 0 ? "full" : "partial";

      await enrollment.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { success: true, data: payment };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("verifyAndCompletePayment Error:", error);
      throw error;
    }
  }

  async getPymentByOrderId(pyload) {
    console.log(
      "Get Payment By Order ID Payload:::::::::::::::::::::::",
      pyload,
    );
    try {
      const { razorpayOrderId } = pyload;

      const payment = await Payments.findOne({ razorpayOrderId });
      if (!payment) {
        return {
          success: false,
          message: "Payment not found",
        };
      }
      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      console.error("Error to get payment by order id:", error);
      throw error;
    }
  }

  async getPaymentsByuserId(payment) {
    console.log(
      "Get Payments By User ID Payload:::::::::::::::::::::::",
      payment,
    );
    try {
      const { userId } = payment;
      const payments = await Payments.find({ userId })
        .populate("courseId", "title description price")
        .sort({ created_at: -1 })
        .lean();

      return {
        success: true,
        data: payments,
      };
    } catch (error) {
      console.error("Error to get payments by user id:", error);
      throw error;
    }
  }

  async initiateRefund(payload) {
    try {
      const { enrollmentId, refundAmount, refundReason } = payload;

      const payment = await Payments.findOne({ enrollmentId });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status !== "completed") {
        throw new Error("Only completed payments can be refunded");
      }

      if (refundAmount > payment.amount) {
        throw new Error("Refund amount exceeds payment amount");
      }

      payment.status = "refunded";
      payment.refundAmount = refundAmount;
      payment.refundReason = refundReason;
      payment.refundedAt = new Date();

      await payment.save();

      return { success: true, data: payment };
    } catch (error) {
      console.error("initialRefund Error:", error);
      throw error;
    }
  }

  async makePaymentFailed(razorpayOrderId) {
    try {
      const payment = await Payments.findOneAndUpdate(
        { razorpayOrderId },
        { status: "failed" },
        { new: true },
      );

      if (!payment) {
        return { success: false, message: "Payment not found" };
      }

      return { success: true, data: payment };
    } catch (error) {
      console.error("makePaymentFailed Error:", error);
      throw error;
    }
  }
}



// thes services are not tested