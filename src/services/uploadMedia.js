import { v2 as cloudinary } from "cloudinary";

/* ================= CLOUDINARY CONFIG ================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("[UploadMedia] Cloudinary configured");

/* ================= BASE MEDIA CLASS ================= */
class UploadMedia {
  /* ---------- SMART upload (auto replace support) ---------- */
  async uploadImages(file, folder = "uploads", oldPublicId = null) {
    try {
      console.log("[UploadMedia] uploadImages called");

      if (!file) {
        console.warn("[UploadMedia] No file provided");
        return null;
      }

      if (file.size === 0) {
        console.warn("[UploadMedia] Empty file received");
        return null;
      }

      // 🔥 STEP 1: delete old image (if provided)
      if (oldPublicId) {
        try {
          console.log("[UploadMedia] Deleting old image:", oldPublicId);
          await cloudinary.uploader.destroy(oldPublicId);
          console.log("[UploadMedia] Old image deleted");
        } catch (deleteError) {
          console.error(
            "[UploadMedia] Failed to delete old image:",
            deleteError,
          );
          // ❗ continue upload even if delete fails
        }
      }

      // debug info
      console.log("[UploadMedia] File info:", {
        name: file.name,
        size: file.size,
        type: file.type,
        folder,
      });

      // 🔥 STEP 2: upload new image
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder,
              resource_type: "image",
            },
            (error, uploadResult) => {
              if (error) {
                console.error("[UploadMedia] Cloudinary error:", error);
                return reject(error);
              }

              console.log("[UploadMedia] Upload success");
              resolve(uploadResult);
            },
          )
          .end(buffer);
      });

      // ✅ IMPORTANT: return both for overwrite tracking
      return {
        url: result?.secure_url || "",
        public_id: result?.public_id || "",
      };
    } catch (error) {
      console.error("[UploadMedia] uploadImages exception:", error);
      throw new Error("Image upload failed");
    }
  }

  /* ---------- safe image getter ---------- */
  /* ---------- safe image getter ---------- */
  getUploadImage(uploadResult) {
    try {
      if (!uploadResult || typeof uploadResult !== "object") {
        console.warn("[UploadMedia] getUploadImage: result missing or invalid");
        return null;
      }
      return uploadResult; // ✅ return the full { url, public_id } object
    } catch (error) {
      console.error("[UploadMedia] getUploadImage exception:", error);
      return null;
    }
  }
}

/* ================= EXPORTS ================= */
export default new UploadMedia();
export { cloudinary };
