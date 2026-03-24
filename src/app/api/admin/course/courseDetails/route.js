import { NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/config/database";
import { AdminAuthentication } from "@/utils/jwt";
import CourseServises from "@/services/courses";
import { success, serverError } from "@/utils/apiResponse";
import uploadMedia from "@/services/uploadMedia";

/* ================= VALIDATION ================= */
const courseDetailsSchema = z.object({
  courseId: z.string().min(1),
  instructorId: z.string().optional(),
  detailedDescription: z.string().optional(),
  courseOutline: z.string().optional(),
  teacherImg: z.string().optional(),
  teacherImgId: z.string().optional(),
  teacherName: z.string().optional(),
  teacherDesignation: z.string().optional(),
  teacherBio: z.string().optional(),
  demoVideo: z.string().optional(),
  syllabus: z.array(z.object({ title: z.string(), description: z.string().optional() })).optional(),
  faqs: z.array(z.object({ question: z.string(), answer: z.string().optional() })).optional(),
  targetAudience: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  certificateEnabled: z.boolean().optional(),
});

/* ================= POST — Create or Update ================= */
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

    const formData = await req.formData();

    /* ---------- teacher image upload ---------- */
    const teacherImgFile = formData.get("teacherImgFile");
    const oldTeacherImgId = formData.get("oldTeacherImgId") || null;

    let teacherImgUrl = formData.get("teacherImg") || undefined;
    let teacherImgId = formData.get("teacherImgId") || undefined;

    if (teacherImgFile && teacherImgFile.size > 0) {
      const uploadResult = await uploadMedia.uploadImages(
        teacherImgFile,
        "courses/teachers",
        oldTeacherImgId,
      );
      const imageData = uploadMedia.getUploadImage(uploadResult);
      if (imageData) {
        teacherImgUrl = imageData.url;
        teacherImgId = imageData.public_id;
      }
    }

    /* ---------- safe JSON parse ---------- */
    let syllabus = [];
    let faqs = [];
    let targetAudience = [];
    let prerequisites = [];

    try { syllabus = JSON.parse(formData.get("syllabus") || "[]"); } catch {}
    try { faqs = JSON.parse(formData.get("faqs") || "[]"); } catch {}
    try { targetAudience = JSON.parse(formData.get("targetAudience") || "[]"); } catch {}
    try { prerequisites = JSON.parse(formData.get("prerequisites") || "[]"); } catch {}

    /* ---------- build body ---------- */
    const body = {
      courseId: formData.get("courseId") || "",
      instructorId: formData.get("instructorId") || undefined,
      detailedDescription: formData.get("detailedDescription") || undefined,
      courseOutline: formData.get("courseOutline") || undefined,
      teacherImg: teacherImgUrl,
      teacherImgId,
      teacherName: formData.get("teacherName") || undefined,
      teacherDesignation: formData.get("teacherDesignation") || undefined,
      teacherBio: formData.get("teacherBio") || undefined,
      demoVideo: formData.get("demoVideo") || undefined,
      syllabus,
      faqs,
      targetAudience,
      prerequisites,
      certificateEnabled: formData.get("certificateEnabled") === "true",
    };

    /* ---------- validate ---------- */
    const validated = courseDetailsSchema.parse(body);

    /* ---------- service ---------- */
    const service = new CourseServises();
    const result = await service.createOrUpdateCourseDetails(validated);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 },
      );
    }

    return success(result.message, result.data);
  } catch (error) {
    console.error("Admin courseDetails error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 },
      );
    }

    return serverError();
  }
}

/* ================= GET — by courseId query param ================= */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "courseId is required" },
        { status: 400 },
      );
    }

    const service = new CourseServises();
    const result = await service.getCourseDetailsByCourseId(courseId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Get courseDetails error:", error);
    return serverError();
  }
}

/* ================= DELETE — by courseId in body ================= */
export async function DELETE(req) {
  try {
    await connectDB();

    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.code },
      );
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "courseId is required" },
        { status: 400 },
      );
    }

    const service = new CourseServises();
    const result = await service.deleteCourseDetails(courseId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 404 },
      );
    }

    return success(result.message);
  } catch (error) {
    console.error("Delete courseDetails error:", error);
    return serverError();
  }
}
