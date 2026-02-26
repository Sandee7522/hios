import { Categories, Courses, Lessons, Modules } from "@/models/schemaModal";
import mongoose from "mongoose";
import slugify from "slugify";

export default class CourseServises {
  //   ?*************************                       *********************************
  //                                CATEGORIES SERVICES
  //   ?*************************                       *********************************

  async createCategory(payload) {
    try {
      const { name, slug, description, icon, isActive } = payload;
      const exists = await Categories.findOne({ slug });
      if (exists) {
        return {
          success: false,
          message: "Slug already exists",
        };
      }

      const category = await Categories.create({
        name,
        slug,
        description,
        icon,
        isActive,
      });

      return {
        success: true,
        data: category,
      };
    } catch (error) {
      console.log("Create service error:", error);
      throw error;
    }
  }

  // ================= GET ALL CATEGORY ================
  async getAllCategory(payload) {
    try {
      const {
        search,
        page = 1,
        pageSize = 10,
        sort = "asc",
        sortBy = "created_at",
        isActive,
      } = payload;

      const query = {};

      if (typeof isActive === "boolean") {
        query.isActive = isActive;
      }

      if (search && typeof search === "string") {
        query.$or = [
          { name: { $regex: search.trim(), $options: "i" } },
          { slug: { $regex: search.trim(), $options: "i" } },
          { description: { $regex: search.trim(), $options: "i" } },
        ];
      }

      const pageNumber = Math.max(Number(page) || 1, 1);
      const limit = Math.min(Number(pageSize) || 10, 100);
      const skip = (pageNumber - 1) * limit;

      const allowedSortFields = ["created_at", "updated_at", "name", "slug"];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : "created_at";
      const sortOrder = sort === "desc" ? -1 : 1;

      const [categories, total] = await Promise.all([
        Categories.find(query)
          .select("-__v")
          .sort({ [sortField]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean(),
        Categories.countDocuments(query),
      ]);

      return {
        success: true,
        data: categories,
        pagination: {
          total,
          page: pageNumber,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Get all category error:", error);
      throw error;
    }
  }

  // ================= GET CATEGORY BY ID ================
  async getCategoryById(id) {
    try {
      //  ObjectId validation
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return { success: false, error: "Invalid category ID" };
      }

      const category = await Categories.findById(id).select("-__v").lean();

      if (!category) {
        return { success: false, error: "Category not found" };
      }

      return { success: true, data: category };
    } catch (error) {
      console.error("Get category by id error:", error);
      throw error;
    }
  }

  // ================= GET CATEGORY BY SLUG ================
  async getCategoryBySlug(slug) {
    try {
      if (!slug || typeof slug !== "string") {
        return { success: false, error: "Invalid slug" };
      }

      const category = await Categories.findOne({ slug }).select("-__v").lean();

      if (!category) {
        return { success: false, error: "Category not found" };
      }

      return { success: true, data: category };
    } catch (error) {
      console.error("Get category by slug error:", error);
      throw error;
    }
  }

  // ================= UPDATE CATEGORY BY ID ================
  async updateCategoryById(payload) {
    try {
      const { categoryId, name, slug, description, icon, isActive } = payload;

      const category = await Categories.findByIdAndUpdate(
        categoryId,
        {
          name,
          slug,
          description,
          icon,
          isActive,
        },
        { new: true },
      );
      if (!category) {
        return {
          success: false,
          error: "Category not found",
        };
      }
      return {
        success: true,
        data: category,
      };
    } catch (error) {
      console.error("Update category by id error:", error);
      throw error;
    }
  }
  // ================ DELETE CATEGORY BY ID ================
  async deleteCategoryById(categoryId) {
    try {
      const category = await Categories.findByIdAndDelete(categoryId);
      if (!category) {
        return {
          success: false,
          error: "Category not found",
        };
      }
      return {
        success: true,
        data: category,
      };
    } catch (error) {
      console.error("Delete category by id error:", error);
      throw error;
    }
  }

  //   ?*************************                       *********************************
  //                                 For Courses
  //   ?*************************                       *********************************

  // ================= CREATE COURSE ================
  async createCourse(payload) {
    try {
      const {
        title,
        slug,
        description,
        shortDescription,
        thumbnail,
        thumbnailId,
        previewVideo,
        instructorId,
        categoryId,
        level,
        courseLanguage,
        price,
        discount,
        totalFee,
        currency,
        partialPaymentEnabled,
        minimumPayment,
        duration,
        requirements,
        whatYouWillLearn,
        tags,
        status,
        isPublished,
        publishedAt,
      } = payload;

      // 🔒 ObjectId validation
      if (!mongoose.Types.ObjectId.isValid(instructorId)) {
        return { success: false, error: "Invalid instructorId" };
      }

      if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
        return { success: false, error: "Invalid categoryId" };
      }

      // ✅ slug generate
      const finalSlug = slug
        ? slugify(slug, { lower: true, strict: true })
        : slugify(title, { lower: true, strict: true });

      // ✅ duplicate check
      const existing = await Courses.findOne({ slug: finalSlug }).lean();
      if (existing) {
        return { success: false, error: "Course slug already exists" };
      }

      // ✅ auto publish date
      let finalPublishedAt = publishedAt;
      if (isPublished && !publishedAt) {
        finalPublishedAt = new Date();
      }

      // ✅ create
      const course = await Courses.create({
        title: title.trim(),
        slug: finalSlug,
        description,
        shortDescription,
        thumbnail,
        thumbnailId,
        previewVideo,
        instructorId,
        categoryId,
        level,
        courseLanguage,
        price,
        discount,
        totalFee,
        currency,
        partialPaymentEnabled,
        minimumPayment,
        duration,
        requirements,
        whatYouWillLearn,
        tags,
        status,
        isPublished,
        publishedAt: finalPublishedAt,
      });

      // 🔥 Populate instructor name and category name
      const populatedCourse = await Courses.findById(course._id)
        .populate({
          path: "instructorId",
          select: "name", // Only name
        })
        .populate({
          path: "categoryId",
          select: "name", // Only name
        })
        .lean();

      return {
        success: true,
        data: populatedCourse,
      };
    } catch (error) {
      console.error("Create course service error:", error);
      return { success: false, error: "Failed to create course" };
    }
  }

  async getAllCourses(payload = {}) {
    try {
      const {
        search,
        page = 1,
        pageSize = 10,
        sort = "asc",
        sortBy = "created_at",
        level,
        categoryId,
        instructorId,
        isPublished,
        minPrice,
        maxPrice,
      } = payload;

      const pageNumber = Math.max(Number(page) || 1, 1);
      const limit = Math.min(Number(pageSize) || 10, 100);
      const skip = (pageNumber - 1) * limit;

      const query = {};

      // 🔍 search
      if (search) {
        query.$or = [
          { title: { $regex: search.trim(), $options: "i" } },
          { description: { $regex: search.trim(), $options: "i" } },
        ];
      }

      // 🎯 filters
      if (level) query.level = level;
      if (categoryId) query.categoryId = categoryId;
      if (instructorId) query.instructorId = instructorId;
      if (typeof isPublished === "boolean") query.isPublished = isPublished;

      // 💰 price filter
      if (minPrice || maxPrice) {
        query.totalFee = {};
        if (minPrice) query.totalFee.$gte = Number(minPrice);
        if (maxPrice) query.totalFee.$lte = Number(maxPrice);
      }

      const sortOrder = sort === "desc" ? -1 : 1;

      const [courses, total] = await Promise.all([
        Courses.find(query)
          .select("-__v")
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .populate({
            path: "instructorId",
            select: "name", // Only name
          })
          .populate({
            path: "categoryId",
            select: "name", // Only name
          })
          .lean(),
        Courses.countDocuments(query),
      ]);

      return {
        success: true,
        data: courses,
        pagination: {
          total,
          page: pageNumber,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Get all courses error:", error);
      return { success: false, error: "Failed to fetch courses" };
    }
  }
  // ================ GET COURSE BY SLUG ================
  async getCourseById(courseId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return {
          success: false,
          error: "Invalid course ID",
        };
      }

      const course = await Courses.findById(courseId)
        .select("-__v")
        .populate({
          path: "instructorId",
          select: "name email profile",
        })
        .populate({
          path: "categoryId",
          select: "name slug icon",
        })
        .lean(); // correct place

      if (!course) {
        return {
          success: false,
          error: "Course not found",
        };
      }

      return {
        success: true,
        data: course,
      };
    } catch (error) {
      console.error("Get course by id error:", error);
      return {
        success: false,
        error: "Failed to fetch course",
      };
    }
  }

  async getCourseBySlug(slug) {
    try {
      if (!slug) {
        return {
          success: false,
          error: "Slug is required",
        };
      }

      const course = await Courses.findOne({ slug })
        .select("-__v")
        .populate({
          path: "instructorId",
          select: "name email profile",
        })
        .populate({
          path: "categoryId",
          select: "name slug icon",
        })
        .lean();

      if (!course) {
        return {
          success: false,
          error: "Course not found",
        };
      }

      return {
        success: true,
        data: course,
      };
    } catch (error) {
      console.error("getCourseBySlug error:", error);
      return {
        success: false,
        error: "Internal server error",
      };
    }
  }
  async updateCourse(id, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid course ID",
        };
      }

      const updatePayload = {
        ...data,
        updated_at: new Date(),
      };

      const course = await Courses.findByIdAndUpdate(id, updatePayload, {
        new: true, // return updated doc
        runValidators: true,
        lean: true, // ⚡ faster response
      }).select("-__v");

      if (!course) {
        return {
          success: false,
          error: "Course not found",
        };
      }

      return {
        success: true,
        data: course,
      };
    } catch (error) {
      console.error("❌ updateCourse error:", error);

      if (error.code === 11000) {
        return {
          success: false,
          error: "Slug already exists",
        };
      }

      return {
        success: false,
        error: "Internal server error",
      };
    }
  }
  //  constructor({ Courses, Modules, Lessons }) {
  //     this.Course = Courses;
  //     this.Module = Modules;
  //     this.Lesson = Lessons;
  //   }

  // ================= DELETE COURSE =================
  async deleteCourse(courseId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return { success: false, error: "Invalid course id" };
      }

      // 🔥 parallel delete
      await Promise.all([
        this.Module.deleteMany({ courseId }).session(session),
        this.Lesson.deleteMany({ courseId }).session(session),
      ]);

      const course =
        await this.Course.findByIdAndDelete(courseId).session(session);

      if (!course) {
        await session.abortTransaction();
        return { success: false, error: "Course not found" };
      }

      await session.commitTransaction();

      return {
        success: true,
        message: "Course, lessons and modules deleted successfully",
      };
    } catch (error) {
      await session.abortTransaction();
      return { success: false, error: error.message };
    } finally {
      session.endSession();
    }
  }

  // ================= PUBLISH =================
  async publishCourse(courseId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return { success: false, error: "Invalid course id" };
      }

      const course = await Courses.findByIdAndUpdate(
        courseId,
        {
          $set: {
            status: "published",
            isPublished: true,
            publishedAt: new Date(),
            updated_at: new Date(),
          },
        },
        { new: true, lean: true },
      );

      if (!course) {
        return { success: false, error: "Course not found" };
      }

      return { success: true, data: course };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ================= UNPUBLISH =================
  async unpublishCourse(courseId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return { success: false, error: "Invalid course id" };
      }

      const course = await Courses.findByIdAndUpdate(
        courseId,
        {
          $set: {
            status: "draft",
            isPublished: false,
            updated_at: new Date(),
          },
        },
        { new: true, lean: true },
      );

      if (!course) {
        return { success: false, error: "Course not found" };
      }

      return { success: true, data: course };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  //   ?*************************                       *********************************
  //                                 MODULE SERVICES
  //   ?*************************                       *********************************

  async createModule(payload) {
    try {
      const { courseId, title, description, isPublished } = payload;

      const existingModule = await Modules.findOne({
        courseId,
        title: { $regex: new RegExp(`^${title}$`, "i") },
      });
      if (existingModule) {
        return {
          status: 400,
          success: false,
          message: "Module with this title already exists in the course",
          data: {},
        };
      }

      // Get last module order for this course
      const lastModule = await Modules.findOne({ courseId }).sort({
        order: -1,
      });

      const nextOrder = lastModule ? lastModule.order + 1 : 1;

      // Create module
      const module = await Modules.create({
        courseId,
        title,
        description,
        order: nextOrder,
        isPublished: isPublished ?? true,
      });

      return {
        status: 201,
        success: true,
        message: "Module created successfully",
        data: module,
      };
    } catch (error) {
      console.log("Create module error:", error);
      throw error;
    }
  }

  // ================= GET MODULES BY COURSE =================
  async moduleByCourseId(courseId) {
    try {
      const modules = await Modules.find({ courseId }).sort({ order: 1 });

      return {
        status: 200,
        success: true,
        message: "Modules fetched successfully",
        data: modules,
      };
    } catch (error) {
      console.log("moduleByCourseId error:", error);
      throw error;
    }
  }

  // ================= GET MODULE BY ID =================
  async getModulById(id) {
    try {
      const module = await Modules.findById(id);

      if (!module) {
        return {
          status: 404,
          success: false,
          message: "Module not found",
          data: {},
        };
      }

      return {
        status: 200,
        success: true,
        message: "Module fetched successfully",
        data: module,
      };
    } catch (error) {
      console.log("getModulById error:", error);
      throw error;
    }
  }

  // ================= UPDATE MODULE =================
  async updateModule(id, data) {
    try {
      data.updated_at = Date.now();

      const module = await Modules.findByIdAndUpdate(id, data, {
        new: true,
      });

      if (!module) {
        return {
          status: 404,
          success: false,
          message: "Module not found",
          data: {},
        };
      }

      return {
        status: 200,
        success: true,
        message: "Module updated successfully",
        data: module,
      };
    } catch (error) {
      console.log("updateModule error:", error);
      throw error;
    }
  }

  // ================= DELETE MODULE =================
  async deleteModule(id) {
    try {
      const module = await Modules.findByIdAndDelete(id);

      if (!module) {
        return {
          status: 404,
          success: false,
          message: "Module not found",
          data: {},
        };
      }

      // 🔥 OPTIONAL: reorder remaining modules
      // await this._reorderAfterDelete(module.courseId);

      return {
        status: 200,
        success: true,
        message: "Module deleted successfully",
        data: {},
      };
    } catch (error) {
      console.log("deleteModule error:", error);
      throw error;
    }
  }

  // ================= REORDER MODULES (DRAG & DROP) =================
  async reorderModules(courseId, moduleOrders) {
    try {
      if (!courseId || !Array.isArray(moduleOrders)) {
        return {
          status: 400,
          success: false,
          message: "Invalid reorder payload",
          data: {},
        };
      }

      const bulkOps = moduleOrders.map((item) => ({
        updateOne: {
          filter: { _id: item.moduleId, courseId },
          update: { order: item.order, updated_at: Date.now() },
        },
      }));

      await Modules.bulkWrite(bulkOps);

      return {
        status: 200,
        success: true,
        message: "Modules reordered successfully",
        data: {},
      };
    } catch (error) {
      console.log("reorderModules error:", error);
      throw error;
    }
  }

  // ================= PRIVATE HELPER =================
  // async _reorderAfterDelete(courseId) {
  //   const modules = await this.Module.find({ courseId }).sort({ order: 1 });

  //   const bulkOps = modules.map((m, index) => ({
  //     updateOne: {
  //       filter: { _id: m._id },
  //       update: { order: index + 1 },
  //     },
  //   }));

  //   if (bulkOps.length) {
  //     await this.Module.bulkWrite(bulkOps);
  //   }
  // }

  //   ?*************************                       *********************************
  //                                 LESSON SERVICES
  //   ?*************************                       *********************************

  // ================= CREATE LESSON =================
  async createLesson(payload) {
    try {
      const {
        courseId,
        moduleId,
        title,
        description,
        content,
        videoUrl,
        isPublished,
      } = payload;

      // 🔹 Find last lesson order inside same module/course
      const lastLesson = await Lessons.findOne({ courseId, moduleId }).sort({
        order: -1,
      });

      // 🔹 Auto increment order
      const nextOrder = lastLesson ? lastLesson.order + 1 : 1;

      // 🔹 Create lesson
      const lesson = await Lessons.create({
        courseId,
        moduleId,
        title,
        description,
        content,
        videoUrl,
        order: nextOrder,
        isPublished: isPublished ?? false,
      });

      return lesson;
    } catch (error) {
      console.log("createLesson error", error);
      throw error;
    }
  }

  // ================= GET LESSONS BY COURSE =================
  async getLessonByCourse(courseId) {
    try {
      // 🔹 Fetch and sort
      const lessons = await Lessons.find({ courseId }).sort({ order: 1 });

      return {
        status: 200,
        success: true,
        message: "Lessons fetched by course",
        data: lessons,
      };
    } catch (error) {
      console.log("getLessonByCourse error", error);
      throw error;
    }
  }

  // ================= GET LESSONS BY MODULE =================
  async getLessonByModule(moduleId) {
    try {
      const lessons = await Lessons.find({ moduleId }).sort({ order: 1 });

      if (!lessons) {
        return {
          status: 404,
          success: false,
          message: "Lessons not found",
          data: {},
        };
      }
      return {
        status: 200,
        success: true,
        message: "Lessons fetched by module",
        data: lessons,
      };
    } catch (error) {
      console.log("getLessionByModule error", error);
      throw error;
    }
  }

  // ================= GET LESSON BY ID =================
  async getLessonById(id) {
    try {
      const lesson = await Lessons.findById(id);

      if (!lesson) {
        return {
          status: 404,
          success: false,
          message: "Lesson not found",
          data: {},
        };
      }

      return {
        status: 200,
        success: true,
        message: "Lesson fetched successfully",
        data: lesson,
      };
    } catch (error) {
      console.log("getLessionById error", error);
      throw error;
    }
  }

  // ================= UPDATE LESSON =================
  async updateLesson(payload) {
    try {
      const { id, ...updateData } = payload;

      if (!id) {
        return {
          status: 400,
          success: false,
          message: "lesson id required",
          data: {},
        };
      }

      // 🔹 Update timestamp
      updateData.updated_at = Date.now();

      // 🔹 Update lesson
      const lesson = await Lessons.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!lesson) {
        return {
          status: 404,
          success: false,
          message: "Lesson not found",
          data: {},
        };
      }

      return {
        status: 200,
        success: true,
        message: "Lesson updated successfully",
        data: lesson,
      };
    } catch (error) {
      console.log("updateLesson error", error);
      throw error;
    }
  }

  // ================= DELETE LESSON =================
  async deleteLesson(id) {
    try {
      const lesson = await Lessons.findByIdAndDelete(id);

      if (!lesson) {
        return {
          status: 404,
          success: false,
          message: "Lesson not found",
          data: {},
        };
      }
      return {
        status: 200,
        success: true,
        message: "Lesson deleted successfully",
        data: {},
      };
    } catch (error) {
      console.log("deleteLesson error", error);
      throw error;
    }
  }

  // ================= REORDER LESSONS (DRAG & DROP) =================
  // async reOrderLesson(payload) {
  //   try {
  //     const { moduleId, lessonOrders } = payload;

  //     if (!moduleId || !Array.isArray(lessonOrders)) {
  //       return {
  //         status: 400,
  //         success: false,
  //         message: "Invalid reorder payload",
  //         data: {},
  //       };
  //     }

  //     // 🔹 Prepare bulk operations (fast update)
  //     const bulkOps = lessonOrders.map((item) => ({
  //       updateOne: {
  //         filter: { _id: item.lessonId, moduleId },
  //         update: { order: item.order, updated_at: Date.now() },
  //       },
  //     }));

  //     await this.Lesson.bulkWrite(bulkOps);

  //     return {
  //       status: 200,
  //       success: true,
  //       message: "Lessons reordered successfully",
  //       data: {},
  //     };
  //   } catch (error) {
  //     console.log("reOrderLession error", error);
  //     throw error;
  //   }
  // }
}
