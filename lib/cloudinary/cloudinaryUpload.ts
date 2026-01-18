"use server";

import cloudinaryConfig from "./cloudinary";
import { revalidatePath } from "next/cache"; // Optional: To refresh your chat UI after upload

export async function uploadToChatroom(formData: FormData) {
  // Get the file from the form (expects <input name="image" type="file" />)
  const file = formData.get("image") as File | null;
  if (!file) {
    return { success: false, error: "No image selected" };
  }

  // Basic validation (add more if needed, like size < 5MB)
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Please select an image file" };
  }

  // Convert file to buffer (what Cloudinary needs)
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinaryConfig.uploader
        .upload_stream(
          {
            folder: "chatroom", // ← Creates/uploads to your new "chatroom" folder
            resource_type: "image",
            // Optional extras: public_id: 'custom-name', transformation: [{ width: 500, crop: 'scale' }]
          },
          (error, uploadResult) => {
            if (error) reject(error);
            else resolve(uploadResult);
          },
        )
        .end(buffer);
    });

    // Success! Return the secure URL (use this in your chat/DB)
    return {
      success: true,
      url: result.secure_url, // e.g., https://res.cloudinary.com/.../chatroom/your-image.jpg
      publicId: result.public_id, // For deleting later if needed
    };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Upload failed—check console" };
  }
}
