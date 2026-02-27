"use client";

import { useState, useEffect, useCallback } from "react";

interface ImageLightboxProps {
    src: string;
    alt: string;
    onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setIsVisible(true));

        // Lock body scroll
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(onClose, 200);
    }, [onClose]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleClose]);

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-200 ${isVisible ? "bg-black/90 backdrop-blur-md" : "bg-black/0"
                }`}
            onClick={handleClose}
        >
            {/* Close button */}
            <button
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={handleClose}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/* Image */}
            <img
                src={src}
                alt={alt}
                className={`max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl transition-all duration-200 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
