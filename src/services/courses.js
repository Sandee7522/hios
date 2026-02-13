import { Categories, Courses } from "@/models/schemaModal";
import mongoose from "mongoose";
import slugify from "slugify";

export default class CourseServise {
  //   ?*************************                       *********************************
  //                                CATEGORIES SERVICES
  //   ?*************************                       *********************************

  async createCategory(payload) {
    try {
      const { name, slug, description, icon, isActive } = payload;

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
      console.log("Create sevice error:", error);
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
      } = options;

      const query = {};

      // isActive filter (safe)
      if (typeof filters.isActive === "boolean") {
        query.isActive = filters.isActive;
      }

      //  filter (indexed + regex safe)
      if (search && typeof search === "string") {
        query.$or = [
          { name: { $regex: search.trim(), $options: "i" } },
          { slug: { $regex: search.trim(), $options: "i" } },
          { description: { $regex: search.trim(), $options: "i" } },
        ];
      }

      //pagination safe
      const pageNumber = Math.max(Number(page) || 1, 1);
      const limit = Math.min(Number(pageSize) || 10, 100);
      const skip = (pageNumber - 1) * limit;

      //sorting safe whitelist
      const allowedSortFields = ["created_at", "updated_at", "name", "slug"];

      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : "created_at";

      const sortOrder = sort === "desc" ? -1 : 1;

      const [categories, total] = await Promise.all([
        this.Category.find(query)
          .select("-__v")
          .sort({ [sortField]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.Category.countDocuments(query),
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

      const category = await this.Category.findById(id).select("-__v").lean();

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

      const category = await this.Category.findOne({ slug })
        .select("-__v")
        .lean();

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
        thumbnail,
        previewVideo,
        instructorId,
        categoryId,
        level,
        language,
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

      const finalSlug = slug
        ? slugify(slug, { lower: true, strict: true })
        : slugify(title, { lower: true, strict: true });

      const existing = await Courses.findOne({ slug: finalSlug }).lean();
      if (existing) {
        return { success: false, error: "Course slug already exists" };
      }

      const course = await Courses.create({
        title: title.trim(),
        slug: finalSlug,
        description,
        thumbnail,
        previewVideo,
        instructorId,
        categoryId,
        level,
        language,
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
      });

      return {
        success: true,
        data: course.toObject(),
      };
    } catch (error) {
      console.error("Create course service error:", error);
      return { success: false, error: "Failed to create course" };
    }
  }

  // ================ GET COURSE BY SLUG ================
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

  async getCourseById(courseId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return {
          success: false,
          error: "Invalid course ID",
        };
      }

      const course = await Courses.findById(courseId)
        .select("-__v") // remove unnecessary field
        .populate({
          path: "instructorId",
          select: "name email profile",
          options: { lean: true },
        })
        .populate({
          path: "categoryId",
          select: "name slug icon",
          options: { lean: true },
        })
        .lean(); // ⚡ BIG performance boost

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
      console.error(" Get course by id error:", error);
      throw error;
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

      const course = await this.Course.findOne({ slug })
        .select("-__v")
        .populate({
          path: "instructorId",
          select: "name email profile",
          options: { lean: true },
        })
        .populate({
          path: "categoryId",
          select: "name slug icon",
          options: { lean: true },
        })
        .lean(); // ⚡ BIG speed boost

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
      console.error("❌ getCourseBySlug error:", error);
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

      const course = await this.Course.findByIdAndUpdate(id, updatePayload, {
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
  async deleteCourse(id) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return { success: false, error: "Invalid course id" };
      }

      // ⚡ Parallel deletion (2x faster)
      await Promise.all([
        this.Module.deleteMany({ courseId: id }).session(session),
        this.Lesson.deleteMany({ courseId: id }).session(session),
      ]);

      const course = await this.Course.findByIdAndDelete(id).session(session);

      if (!course) {
        await session.abortTransaction();
        return { success: false, error: "Course not found" };
      }

      await session.commitTransaction();

      return {
        success: true,
        message: "Course and associated content deleted successfully",
      };
    } catch (error) {
      await session.abortTransaction();
      return { success: false, error: error.message };
    } finally {
      session.endSession();
    }
  }
  async publishCourse(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return { success: false, error: "Invalid course id" };
      }

      const course = await this.Course.findByIdAndUpdate(
        id,
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
  async unpublishCourse(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return { success: false, error: "Invalid course id" };
      }

      const course = await this.Course.findByIdAndUpdate(
        id,
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
}
