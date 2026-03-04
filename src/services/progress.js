// User watches video
// ↓
// Call upsertProgress()
// ↓
// Store timeSpent + lastPosition
// ↓
// If video ends → markLessonCompleted()
// ↓
// Course progress auto-calculated

import { Progress } from "@/models/schemaModal";
import mongoose from "mongoose";

export default class ProgressService {
  /* ================= UPSERT PROGRESS ================= */
  async upsertProgress(payload) {
    try {
      const {
        userId,
        courseId,
        lessonId,
        status = "in-progress",
        progressPercentage = 0,
        timeSpent = 0,
        lastPosition = 0,
      } = payload;

      /* ===== Validate IDs ===== */
      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(courseId) ||
        !mongoose.Types.ObjectId.isValid(lessonId)
      ) {
        throw new Error("Invalid userId, courseId or lessonId");
      }

      const updated = await Progress.findOneAndUpdate(
        { userId, courseId, lessonId },
        {
          $set: {
            status,
            progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
            timeSpent,
            lastPosition,
            updatedAt: new Date(),
          },
        },
        {
          new: true,
          upsert: true,
        },
      );

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error("upsertProgress Error:", error);
      throw error;
    }
  }

  /* ================= GET SINGLE LESSON PROGRESS ================= */
  async getLessonProgress(payload) {
    try {
      const { userId, courseId, lessonId } = payload;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(courseId) ||
        !mongoose.Types.ObjectId.isValid(lessonId)
      ) {
        throw new Error("Invalid IDs");
      }

      const progress = await Progress.findOne({
        userId,
        courseId,
        lessonId,
      }).lean();

      return {
        success: true,
        data: progress || null,
      };
    } catch (error) {
      console.error("getLessonProgress Error:", error);
      throw error;
    }
  }

  /* ================= GET COURSE PROGRESS ================= */
  async getCourseProgress(payload) {
    try {
      const { userId, courseId } = payload;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(courseId)
      ) {
        throw new Error("Invalid IDs");
      }

      const lessons = await Progress.find({
        userId,
        courseId,
      }).lean();

      const totalLessons = lessons.length;

      const completedLessons = lessons.filter(
        (l) => l.status === "completed",
      ).length;

      const overallProgress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        success: true,
        data: {
          totalLessons,
          completedLessons,
          overallProgress,
          lessons,
        },
      };
    } catch (error) {
      console.error("getCourseProgress Error:", error);
      throw error;
    }
  }

  /* ================= MARK LESSON COMPLETED ================= */
  async markLessonCompleted(payload) {
    try {
      const { userId, courseId, lessonId } = payload;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(courseId) ||
        !mongoose.Types.ObjectId.isValid(lessonId)
      ) {
        throw new Error("Invalid IDs");
      }

      const updated = await Progress.findOneAndUpdate(
        { userId, courseId, lessonId },
        {
          $set: {
            status: "completed",
            progressPercentage: 100,
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { new: true, upsert: true },
      );

      return {
        success: true,
        data: updated,
      };
    } catch (error) {
      console.error("markLessonCompleted Error:", error);
      throw error;
    }
  }


}
