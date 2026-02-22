import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { AdminAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";
import uploadMedia from "@/services/uploadMedia";

/* ================= VALIDATION ================= */
const createCourseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().min(10),
  shortDescription: z.string().optional(),
  thumbnail: z.string().url().optional().or(z.literal("")),
  thumbnailId: z.string().optional(), // ✅ added
  previewVideo: z.string().url().optional().or(z.literal("")),

  instructorId: z.string().min(1),
  categoryId: z.string().optional(),

  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  courseLanguage: z.string().optional(),

  price: z.coerce.number().min(0),
  discount: z.coerce.number().optional(),
  totalFee: z.coerce.number().min(0),
  currency: z.string().optional(),

  partialPaymentEnabled: z.boolean().optional(),
  minimumPayment: z.coerce.number().optional(),

  duration: z
    .object({
      hours: z.coerce.number().optional(),
      minutes: z.coerce.number().optional(),
    })
    .optional(),

  requirements: z.array(z.string()).optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  status: z
    .enum(["draft", "pending", "published", "archived", "rejected"])
    .optional(),

  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().optional(),
});

/* ================= POST ================= */
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

    const formData = await req.formData(); // ✅ FormData instead of req.json()

    /* ---------- thumbnail upload ---------- */
    const thumbnailFile = formData.get("thumbnail");
    const oldThumbnailPublicId = formData.get("oldThumbnailPublicId") || null;

    let thumbnailUrl = null;
    let thumbnailId = null;

    if (thumbnailFile && thumbnailFile.size > 0) {
      const uploadResult = await uploadMedia.uploadImages(
        thumbnailFile,
        "courses/thumbnails",
        oldThumbnailPublicId,
      );

      const imageData = uploadMedia.getUploadImage(uploadResult);

      if (imageData) {
        thumbnailUrl = imageData.url; // ✅ cloudinary url
        thumbnailId = imageData.public_id; // ✅ cloudinary public_id
      }
    }

    /* ---------- safe JSON parse ---------- */
    let duration = {};
    let requirements = [];
    let whatYouWillLearn = [];
    let tags = [];

    try {
      duration = JSON.parse(formData.get("duration") || "{}");
    } catch {}
    try {
      requirements = JSON.parse(formData.get("requirements") || "[]");
    } catch {}
    try {
      whatYouWillLearn = JSON.parse(formData.get("whatYouWillLearn") || "[]");
    } catch {}
    try {
      tags = JSON.parse(formData.get("tags") || "[]");
    } catch {}

    /* ---------- build body ---------- */
    const body = {
      title: formData.get("title") || "",
      slug: formData.get("slug") || undefined,
      description: formData.get("description") || "",
      shortDescription: formData.get("shortDescription") || undefined,
      thumbnail: thumbnailUrl || formData.get("thumbnail") || undefined, // ✅ uploaded url or existing url
      thumbnailId: thumbnailId || formData.get("thumbnailId") || undefined, // ✅ public_id
      previewVideo: formData.get("previewVideo") || undefined,

      instructorId: formData.get("instructorId") || "",
      categoryId: formData.get("categoryId") || undefined,

      level: formData.get("level") || undefined,
      courseLanguage: formData.get("courseLanguage") || undefined,

      price: formData.get("price") || 0,
      discount: formData.get("discount") || undefined,
      totalFee: formData.get("totalFee") || 0,
      currency: formData.get("currency") || undefined,

      partialPaymentEnabled: formData.get("partialPaymentEnabled") === "true",
      minimumPayment: formData.get("minimumPayment") || undefined,

      duration,
      requirements,
      whatYouWillLearn,
      tags,

      status: formData.get("status") || undefined,
      isPublished: formData.get("isPublished") === "true",
      publishedAt: formData.get("publishedAt") || undefined,
    };

    console.log("BODY:", body);

    /* ---------- validate ---------- */
    const validatedData = createCourseSchema.parse(body);

    /* ---------- service ---------- */
    const service = new CourseServises();
    const result = await service.createCourse(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 },
      );
    }

    return success("Course created successfully", result.data);
  } catch (error) {
    console.error("Admin create course error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 },
      );
    }

    return serverError();
  }
}
