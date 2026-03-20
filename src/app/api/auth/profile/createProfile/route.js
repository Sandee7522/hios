import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import uploadMedia from "@/services/uploadMedia";
import { serverError, success, validationError } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import { z } from "zod";

/* ================= VALIDATION ================= */
const createProfileSchema = z.object({
  user_id: z.string().min(1),
  username: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
  socialLinks: z
    .object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  profileImage: z.string().optional(),
  profileImageId: z.string().optional(),
});

/* ================= POST ================= */
export async function POST(req) {
  try {
    await connectDB();

    const auth = await VerifyToken(req);
    if (!auth.status) {
      return validationError([auth.message], auth.code);
    }

    const formData = await req.formData();

    /* ---------- file upload via Cloudinary ---------- */
    const profileFile = formData.get("profileImage");
    const oldPublicId = formData.get("oldProfilePublicId") || null;

    let imageUrl = null;
    let imagePublicId = null;

    if (profileFile && profileFile.size > 0) {
      console.log("[CreateProfile] Uploading image to Cloudinary...");
      const uploadResult = await uploadMedia.uploadImages(
        profileFile,
        "profiles",
        oldPublicId,
      );
      const imageData = uploadMedia.getUploadImage(uploadResult);
      if (imageData) {
        imageUrl = imageData.url;
        imagePublicId = imageData.public_id;
        console.log("[CreateProfile] Image uploaded:", imageUrl);
      }
    }

    /* ---------- parse JSON fields ---------- */
    let address = {};
    let socialLinks = {};
    try { address = JSON.parse(formData.get("address") || "{}"); } catch {}
    try { socialLinks = JSON.parse(formData.get("socialLinks") || "{}"); } catch {}

    /* ---------- build params ---------- */
    const params = {
      user_id: auth.data.user._id.toString(),
      username: formData.get("username") || undefined,
      bio: formData.get("bio") || undefined,
      phone: formData.get("phone") || undefined,
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      gender: formData.get("gender") || undefined,
      address,
      socialLinks,
      profileImage: imageUrl || undefined,
      profileImageId: imagePublicId || undefined,
    };

    console.log("[CreateProfile] Params:", params);

    /* ---------- validate ---------- */
    const validation = createProfileSchema.safeParse(params);
    if (!validation.success) {
      const errors = validation.error.issues.map((e) => e.message);
      console.error("[CreateProfile] Validation errors:", errors);
      return validationError(errors, 422);
    }

    /* ---------- service ---------- */
    const service = new AuthService();
    const result = await service.createProfile(validation.data);

    return success(result.message, result.data);
  } catch (error) {
    console.error("[CreateProfile] Error:", error);
    return serverError(error.message);
  }
}
