"use client";

/**
 * Compresses an image file to fit within maxSizeMB
 * Uses Canvas API to resize and compress with JPEG quality
 */
export async function compressImage(
    file: File,
    maxSizeMB: number = 4,
    maxWidthOrHeight: number = 1920,
    quality: number = 0.8
): Promise<File> {
    // If already small enough, return as-is
    if (file.size <= maxSizeMB * 1024 * 1024) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            // Cleanup object URL immediately after load
            URL.revokeObjectURL(objectUrl);

            // Calculate new dimensions (maintain aspect ratio)
            let { width, height } = img;

            if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
                if (width > height) {
                    height = (height / width) * maxWidthOrHeight;
                    width = maxWidthOrHeight;
                } else {
                    width = (width / height) * maxWidthOrHeight;
                    height = maxWidthOrHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);

            // Try different quality levels to fit under maxSize
            const tryCompress = (currentQuality: number) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Compression failed"));
                            return;
                        }

                        const maxBytes = maxSizeMB * 1024 * 1024;

                        // If still too large and quality can be reduced, try again
                        if (blob.size > maxBytes && currentQuality > 0.3) {
                            tryCompress(currentQuality - 0.1);
                            return;
                        }

                        // Create new File from blob
                        const compressedFile = new File([blob], file.name, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        });

                        console.log(
                            `Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
                        );

                        resolve(compressedFile);
                    },
                    "image/jpeg",
                    currentQuality
                );
            };

            tryCompress(quality);
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to load image"));
        };

        img.src = objectUrl;
    });
}
