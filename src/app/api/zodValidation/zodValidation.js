const { z } = require("zod");

/* =====================  CATEGORY VALIDATIONS  ===================== */

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    slug: z
      .string()
      .min(2)
      .max(100)
      .regex(
        /^[a-z0-9-]+$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),
    description: z.string().optional(),
    icon: z.string().url().optional().or(z.literal("")),
    isActive: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z
      .string()
      .min(2)
      .max(100)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    description: z.string().optional(),
    icon: z.string().url().optional().or(z.literal("")),
    isActive: z.boolean().optional(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
  }),
});

const categorySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(2),
  }),
});

/* =====================  COURSE VALIDATIONS  ===================== */

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(200),
    slug: z
      .string()
      .min(5)
      .max(200)
      .regex(
        /^[a-z0-9-]+$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      )
      .optional(),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    shortDescription: z.string().max(500).optional(),
    thumbnail: z.string().url().optional().or(z.literal("")),
    previewVideo: z.string().url().optional().or(z.literal("")),
    instructorId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid instructor ID"),
    categoryId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID")
      .optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    language: z.string().optional(),
    totalFee: z.number().min(0, "Total fee must be positive"),
    currency: z.string().length(3).optional(),
    partialPaymentEnabled: z.boolean().optional(),
    minimumPayment: z.number().min(0).optional(),
    duration: z
      .object({
        hours: z.number().min(0).optional(),
        minutes: z.number().min(0).max(59).optional(),
      })
      .optional(),
    requirements: z.array(z.string()).optional(),
    whatYouWillLearn: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    status: z
      .enum(["draft", "pending", "published", "archived", "rejected"])
      .optional(),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID"),
  }),
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    slug: z
      .string()
      .min(5)
      .max(200)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    description: z.string().min(20).optional(),
    shortDescription: z.string().max(500).optional(),
    thumbnail: z.string().url().optional().or(z.literal("")),
    previewVideo: z.string().url().optional().or(z.literal("")),
    categoryId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    language: z.string().optional(),
    totalFee: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    partialPaymentEnabled: z.boolean().optional(),
    minimumPayment: z.number().min(0).optional(),
    duration: z
      .object({
        hours: z.number().min(0).optional(),
        minutes: z.number().min(0).max(59).optional(),
      })
      .optional(),
    requirements: z.array(z.string()).optional(),
    whatYouWillLearn: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    status: z
      .enum(["draft", "pending", "published", "archived", "rejected"])
      .optional(),
  }),
});

export const getCoursesByFiltersSchema = z.object({
  query: z.object({
    categoryId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    instructorId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    status: z
      .enum(["draft", "pending", "published", "archived", "rejected"])
      .optional(),
    isPublished: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    language: z.string().optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const courseIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID"),
  }),
});

const courseSlugSchema = z.object({
  params: z.object({
    slug: z.string().min(5),
  }),
});

/* =====================  MODULE VALIDATIONS  ===================== */

export const createModuleSchema = z.object({
  body: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID"),
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z.string().optional(),
    order: z.number().int().min(0, "Order must be a positive integer"),
    isPublished: z.boolean().optional(),
  }),
});

export const updateModuleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid module ID"),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    order: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const moduleIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid module ID"),
  }),
});

export const getModulesByCourseSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID"),
  }),
});

export const reorderModulesSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID"),
  }),
  body: z.object({
    moduleOrders: z
      .array(
        z.object({
          moduleId: z.string().regex(/^[0-9a-fA-F]{24}$/),
          order: z.number().int().min(0),
        }),
      )
      .min(1, "At least one module order is required"),
  }),
});

/* =====================  LESSON VALIDATIONS  ===================== */

export const createLessonSchema = z.object({
  body: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID"),
    moduleId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid module ID")
      .optional(),
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z.string().optional(),
    content: z.string().optional(),
    contentType: z
      .enum(["video", "text", "quiz", "assignment", "document"])
      .optional(),
    videoUrl: z.string().url().optional().or(z.literal("")),
    videoDuration: z.number().min(0).optional(),
    attachments: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url(),
          type: z.string(),
          size: z.number().min(0),
        }),
      )
      .optional(),
    order: z.number().int().min(0, "Order must be a positive integer"),
    isFree: z.boolean().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const updateLessonSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lesson ID"),
  }),
  body: z.object({
    moduleId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    title: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    contentType: z
      .enum(["video", "text", "quiz", "assignment", "document"])
      .optional(),
    videoUrl: z.string().url().optional().or(z.literal("")),
    videoDuration: z.number().min(0).optional(),
    attachments: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url(),
          type: z.string(),
          size: z.number().min(0),
        }),
      )
      .optional(),
    order: z.number().int().min(0).optional(),
    isFree: z.boolean().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const lessonIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lesson ID"),
  }),
});

export const getLessonsByCourseSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID"),
  }),
});

export const getLessonsByModuleSchema = z.object({
  params: z.object({
    moduleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid module ID"),
  }),
});

export const reorderLessonsSchema = z.object({
  params: z.object({
    moduleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid module ID"),
  }),
  body: z.object({
    lessonOrders: z
      .array(
        z.object({
          lessonId: z.string().regex(/^[0-9a-fA-F]{24}$/),
          order: z.number().int().min(0),
        }),
      )
      .min(1, "At least one lesson order is required"),
  }),
});
