import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import uploadMedia from "@/services/uploadMedia";
import { serverError, success, validationError } from "@/utils/apiResponse";
import { VerifyToken } from "@/utils/jwt";
import { z } from "zod";

/* ================= VALIDATION ================= */
const createProfileSchema = z.object({
  user_id: z.string().min(1),
  username: z.string().min(1),
  bio: z.string().optional(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Invalid international phone number")
    .optional(),
  dateOfBirth: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }),
  socialLinks: z.array(z.string().url()).optional(),
  profileImage: z.string().optional(),
  profileImageId: z.string().optional(), // ✅ added
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

    /* ---------- files ---------- */
    const profileFile = formData.get("profileImage");

    /* ---------- OPTIONAL ---------- */
    const oldPublicId = formData.get("oldProfilePublicId") || null;

    /* ---------- upload (only if file exists) ---------- */
    let imageUrl = null;
    let imagePublicId = null; // ✅ track public_id

    if (profileFile && profileFile.size > 0) {
      const uploadResult = await uploadMedia.uploadImages(
        profileFile,
        "profiles",
        oldPublicId,
      );

      const imageData = uploadMedia.getUploadImage(uploadResult); // ✅ now returns { url, public_id }

      if (imageData) {
        imageUrl = imageData.url; // ✅ extract url
        imagePublicId = imageData.public_id; // ✅ extract public_id
      }
    }

    /* ---------- safe JSON parse ---------- */
    let address = {};
    let socialLinks = [];

    try {
      address = JSON.parse(formData.get("address") || "{}");
    } catch {}

    try {
      socialLinks = JSON.parse(formData.get("socialLinks") || "[]");
    } catch {}

    /* ---------- build params ---------- */
    const params = {
      user_id: formData.get("user_id") || "",
      username: formData.get("username") || "",
      bio: formData.get("bio") || undefined,
      phone: formData.get("phone") || undefined,
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      address,
      socialLinks,
      profileImage: imageUrl || undefined,
      profileImageId: imagePublicId || undefined,
    };

    console.log("PARAMS:", params);

    /* ---------- validate ---------- */
    const validation = createProfileSchema.safeParse(params);

    if (!validation.success) {
      const errors = validation.error.issues.map((e) => e.message);
      return validationError(errors, 422);
    }

    /* ---------- service ---------- */
    const service = new AuthService();
    const result = await service.createProfile(validation.data);

    return success(result.message, result.data);
  } catch (error) {
    console.error(error);
    return serverError(error.message);
  }
}
