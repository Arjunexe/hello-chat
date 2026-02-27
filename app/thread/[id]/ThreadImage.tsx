"use client";

import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";

interface ThreadImageProps {
    src: string;
    alt: string;
}

export default function ThreadImage({ src, alt }: ThreadImageProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    return (
        <>
            <div
                className="relative rounded-xl overflow-hidden border border-white/10 h-[400px] md:h-[500px] cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
            >
                {/* Blurred background fill */}
                <div
                    className="absolute inset-0 scale-110"
                    style={{
                        backgroundImage: `url(${src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(20px)",
                    }}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/30" />
                {/* Actual image */}
                <img
                    src={src}
                    alt={alt}
                    className="relative z-10 w-full h-full object-contain"
                />
            </div>

            {lightboxOpen && (
                <ImageLightbox
                    src={src}
                    alt={alt}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </>
    );
}
