import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { InstructorAuthentication } from "@/utils/jwt";
import { success, serverError } from "@/utils/apiResponse";
import CourseServices from "@/services/courses";
import uploadMedia from "@/services/uploadMedia"; // ✅ added

/* ================= VALIDATION ================= */
const createCourseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().min(10),
  shortDescription: z.string().optional(),
  thumbnail: z.string().url().optional().or(z.literal("")),
  thumbnailId: z.string().optional(), // ✅ added

  previewVideo: z.string().url().optional().or(z.literal("")),

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
});

/* ================= INSTRUCTOR CREATE ================= */
export async function POST(req) {
  try {
    await connectDB();

    const instructor = await InstructorAuthentication(req);
    if (!instructor.status) {
      return NextResponse.json(
        { success: false, message: instructor.message },
        { status: instructor.code },
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
      thumbnail: thumbnailUrl || formData.get("thumbnail") || undefined, // ✅ uploaded or existing url
      thumbnailId: thumbnailId || formData.get("thumbnailId") || undefined, // ✅ public_id
      previewVideo: formData.get("previewVideo") || undefined,

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
    };

    console.log("BODY:", body);

    /* ---------- validate ---------- */
    const validatedData = createCourseSchema.parse(body);

    // ✅ instructorId from token (not from body — security)
    validatedData.instructorId = instructor.data._id;

    /* ---------- service ---------- */
    const service = new CourseServices();
    const result = await service.createCourse(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 },
      );
    }

    return success("Course created successfully", result.data);
  } catch (error) {
    console.error("Instructor create course error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 },
      );
    }

    return serverError();
  }
}
