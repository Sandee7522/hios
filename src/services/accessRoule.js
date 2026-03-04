import { AccessRules } from "@/models/schemaModal";
import mongoose from "mongoose";

// POST    /api/access-rule
// GET     /api/access-rule/course/:courseId
// GET     /api/access-rule/:ruleId
// PUT     /api/access-rule/:ruleId
// DELETE  /api/access-rule/:ruleId
// POST    /api/access-rule/check    ----------------- user
export default class AccessRuleService {
  async createAccessRule(payload) {
    try {
      const {
        courseId,
        lessonId,
        moduleId,
        requiredPaymentPercentage,
        requiredPaymentAmount,
        unlockCondition,
        prerequisiteLessons,
      } = payload;

      const rule = await AccessRules.create({
        courseId,
        lessonId,
        moduleId,
        requiredPaymentPercentage,
        requiredPaymentAmount,
        unlockCondition,
        prerequisiteLessons,
      });

      return {
        success: true,
        data: rule,
      };
    } catch (error) {
      console.error("createAccessRule Error:", error);
      throw error;
    }
  }

  async getAccessRulesByCourse(courseId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return { success: false, message: "Invalid course Id" };
      }

      const rules = await AccessRules.find({ courseId })
        .populate("lessonId", "title")
        .populate("moduleId", "title")
        .lean();

      return {
        success: true,
        data: rules,
      };
    } catch (error) {
      console.error("getAccessRulesByCourse Error:", error);
      throw error;
    }
  }

  async getAccessByRuleId(ruleId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(ruleId)) {
        return { success: false, message: "Invalid ruleId" };
      }

      const rule = await AccessRules.findById(ruleId).lean();

      if (!rule) {
        return { success: false, message: "Rule not found" };
      }

      return { success: true, data: rule };
    } catch (error) {
      console.error("getAccessByRuleId Error:", error);
      throw error;
    }
  }

  async updateAccessRule(ruleId, payload) {
    try {
      if (!mongoose.Types.ObjectId.isValid(ruleId)) {
        return { success: false, message: "Invalid rule Id" };
      }

      const updatedRule = await AccessRules.findByIdAndUpdate(
        ruleId,
        { $set: payload },
        { new: true },
      );

      if (!updatedRule) {
        return { success: false, message: "Rule not found" };
      }

      return { success: true, data: updatedRule };
    } catch (error) {
      console.error("updateAccessRule Error:", error);
      throw error;
    }
  }

  async deleteAccessRule(ruleId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(ruleId)) {
        return { success: false, message: "Invalid rule Id" };
      }

      const deletedRule = await AccessRules.findByIdAndDelete(ruleId);

      if (!deletedRule) {
        return { success: false, message: "Rule not found" };
      }

      return { success: true };
    } catch (error) {
      console.error("deleteAccessRule Error:", error);
      throw error;
    }
  }

  async checkAccessLesson(payload) {
    try {
      const { courseId, lessonId, enrollment } = payload;

      const rule = await AccessRules.findOne({
        courseId,
        lessonId,
      }).lean();

      if (!rule) {
        return { hasAccess: true }; // no rule means open access
      }

      let hasAccess = true;

      // ================= PAYMENT CONDITION =================
      if (
        rule.unlockCondition === "payment" ||
        rule.unlockCondition === "both"
      ) {
        const totalAmount =
          (enrollment?.totalPaid || 0) + (enrollment?.remainingAmount || 0);

        const paidPercentage =
          totalAmount > 0 ? (enrollment.totalPaid / totalAmount) * 100 : 0;

        if (
          rule.requiredPaymentPercentage &&
          paidPercentage < rule.requiredPaymentPercentage
        ) {
          hasAccess = false;
        }

        if (
          rule.requiredPaymentAmount &&
          enrollment.totalPaid < rule.requiredPaymentAmount
        ) {
          hasAccess = false;
        }
      }

      // ================= COMPLETION CONDITION =================
      if (
        rule.unlockCondition === "completion" ||
        rule.unlockCondition === "both"
      ) {
        if (rule.prerequisiteLessons?.length > 0) {
          const completedIds =
            enrollment?.completedLessons?.map((id) => id.toString()) || [];

          const allDone = rule.prerequisiteLessons.every((id) =>
            completedIds.includes(id.toString()),
          );

          if (!allDone) {
            hasAccess = false;
          }
        }
      }

      return { hasAccess, rule };
    } catch (error) {
      console.error("checkAccessLesson Error:", error);
      throw error;
    }
  }
}
