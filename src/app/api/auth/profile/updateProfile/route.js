import { VerifyToken } from "@/utils/jwt";
import { apiResponse, serverError } from "@/utils/apiResponse";
import connectDB from "@/config/database";
import AuthService from "@/services/auth";
import uploadMedia from "@/services/uploadMedia";

export async function POST(req) {
  try {
    await connectDB();
    await VerifyToken(req);

    const formData = await req.formData(); // ✅ FormData for image support

    const profileFile = formData.get("profileImage");
    const oldPublicId = formData.get("oldProfilePublicId") || null;

    let imageUrl = null;
    let imagePublicId = null;

    if (profileFile && profileFile.size > 0) {
      const uploadResult = await uploadMedia.uploadImages(profileFile, "profiles", oldPublicId);
      const imageData = uploadMedia.getUploadImage(uploadResult);

      if (imageData) {
        imageUrl = imageData.url;
        imagePublicId = imageData.public_id;
      }
    }

    let address = {};
    let socialLinks = [];
    try { address = JSON.parse(formData.get("address") || "{}"); } catch {}
    try { socialLinks = JSON.parse(formData.get("socialLinks") || "[]"); } catch {}

    const body = {
      user_id: formData.get("user_id"),
      username: formData.get("username"),
      bio: formData.get("bio") || undefined,
      phone: formData.get("phone") || undefined,
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      address,
      socialLinks,
      ...(imageUrl && { profileImage: imageUrl }),
      ...(imagePublicId && { profileImageId: imagePublicId }),
    };

    console.log("body:", body);

    const service = new AuthService();
    const result = await service.updateProfile(body);

    return apiResponse(result.status, result.message, result.data);
  } catch (error) {
    console.error(error);
    return serverError();
  }
}