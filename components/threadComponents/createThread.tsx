"use client";

import { createThreadAction } from "@/app/thread/action";
import { uploadToChatroom } from "@/lib/cloudinary/cloudinaryUpload";
import { useState, ChangeEvent } from "react";

interface CreateThreadModalProps {
  onClose: () => void;
}

export default function CreateThreadModal({ onClose }: CreateThreadModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // Handle Image Upload (Preview only for now)
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  async function handleSubmit() {
    try {
      if (!title.trim()) {
        alert("Title is required");
        return;
      }
      let finalImageUrl: string | null = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const result = await uploadToChatroom(formData);
        finalImageUrl = result.url;
      }

      const result = await createThreadAction({
        title: title,
        content: content,
        imageUrl: finalImageUrl,
      });

      if (result?.error) {
        alert(result.error);
      } else {
        // Close modal on success - page will refresh due to revalidatePath
        onClose();
      }
    } catch (error) {
      console.log("error during handleUpload: ", error);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    // 1. Backdrop (covers the whole screen)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="w-full h-full md:h-auto md:max-w-xl border backdrop-blur-3xl border-neutral-700 md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Create New Topic</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">
              Title
            </label>
            <input
              type="text"
              placeholder="What's on your mind?"
              className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-600 outline-none placeholder:text-neutral-600 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Body Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">
              Details
            </label>
            <textarea
              rows={5}
              placeholder="Elaborate on your topic..."
              className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-600 outline-none placeholder:text-neutral-600 resize-none transition-all"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">
              Attachment
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center gap-3 w-full bg-neutral-800 hover:bg-neutral-700 p-3 rounded-lg cursor-pointer transition-colors border border-dashed border-neutral-700 hover:border-neutral-500"
              >
                <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center text-purple-400">
                  📷
                </div>
                <span className="text-sm text-neutral-300">
                  {selectedImage ? "Change Image" : "Add an Image"}
                </span>
              </label>
            </div>

            {/* Image Preview */}
            {selectedImage && (
              <div className="relative mt-4 rounded-lg overflow-hidden border border-neutral-700">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500/80 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all transform active:scale-95"
          >
            Post Topic
          </button>
        </div>
      </div>
    </div>
  );
}
