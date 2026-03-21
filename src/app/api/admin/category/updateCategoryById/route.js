import connectDB from "@/config/database";
import CourseServises from "@/services/courses";
import { serverError, success } from "@/utils/apiResponse";
import { AdminAuthentication } from "@/utils/jwt";
import { NextResponse } from "next/server";
import * as z from "zod";
import uploadMedia from "@/services/uploadMedia";
const updateCategorySchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  name: z.string().min(2).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional(),
  icon: z.string().url().optional().or(z.literal("")),
  iconId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req) {
  try {
    await connectDB();
    const admin = await AdminAuthentication(req);
    if (!admin.status) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        { status: admin.code },
      );
    }

    const formData = await req.formData();

    const iconFile = formData.get("iconFile");
    const oldIconPublicId = formData.get("oldIconPublicId") || null;
    let iconUrl = formData.get("icon") || "";
    let iconId = formData.get("iconId") || "";

    if (iconFile && iconFile.size > 0) {
      const uploadResult = await uploadMedia.uploadImages(
        iconFile,
        "categories/icons",
        oldIconPublicId,
      );
      const imageData = uploadMedia.getUploadImage(uploadResult);
      if (imageData) {
        iconUrl = imageData.url || "";
        iconId = imageData.public_id || "";
      }
    }

    const payload = {
      categoryId: formData.get("categoryId") || "",
      name: formData.get("name") || undefined,
      slug: formData.get("slug") || undefined,
      description: formData.get("description") || "",
      icon: iconUrl || "",
      iconId: iconId || undefined,
      isActive: String(formData.get("isActive")) === "true",
    };
    const validation = updateCategorySchema.safeParse(payload);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const service = new CourseServises();
    const result = await service.updateCategoryById(validation.data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error,
        },
        { status: 404 },
      );
    }

    return success("Category updated successfully", result.data);
  } catch (error) {
    console.log("updateCategory route error", error);
    return serverError();
  }
}
