import { VerifyToken } from "@/utils/jwt";
import { apiResponse, serverError } from "@/utils/apiResponse";
import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import uploadMedia from "@/services/uploadMedia";

export async function POST(req) {
  try {
    await connectDB();

    const auth = await VerifyToken(req);
    if (!auth.status) {
      return apiResponse(auth.code || 401, auth.message);
    }

    const formData = await req.formData();

    /* ---------- Cloudinary upload ---------- */
    const profileFile = formData.get("profileImage");
    const oldPublicId = formData.get("oldProfilePublicId") || null;

    let imageUrl = null;
    let imagePublicId = null;

    if (profileFile && profileFile.size > 0) {
      console.log("[UpdateProfile] Uploading image to Cloudinary...");
      const uploadResult = await uploadMedia.uploadImages(profileFile, "profiles", oldPublicId);
      const imageData = uploadMedia.getUploadImage(uploadResult);
      if (imageData) {
        imageUrl = imageData.url;
        imagePublicId = imageData.public_id;
        console.log("[UpdateProfile] Image uploaded:", imageUrl);
      }
    }

    /* ---------- parse JSON fields ---------- */
    let address = {};
    let socialLinks = {};
    try { address = JSON.parse(formData.get("address") || "{}"); } catch {}
    try { socialLinks = JSON.parse(formData.get("socialLinks") || "{}"); } catch {}

    const body = {
      user_id: auth.data.user._id.toString(),
      username: formData.get("username") || undefined,
      bio: formData.get("bio") || undefined,
      phone: formData.get("phone") || undefined,
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      gender: formData.get("gender") || undefined,
      address,
      socialLinks,
      ...(imageUrl && { profileImage: imageUrl }),
      ...(imagePublicId && { profileImageId: imagePublicId }),
    };

    console.log("[UpdateProfile] Body:", body);

    const service = new AuthService();
    const result = await service.updateProfile(body);

    return apiResponse(result.status, result.message, result.data);
  } catch (error) {
    console.error("[UpdateProfile] Error:", error);
    return serverError();
  }
}
