"use client";
import { useState } from "react";
import CreateThreadModal from "../threadComponents/createThread";

function ThreadButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
      >
        <span>+ New Topic</span>
        {/* You can inline the SVG or make it a component */}
        <svg
          className="w-4 h-4 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </button>

      {isOpen && <CreateThreadModal onClose={() => setIsOpen(false)} />}
    </>
  );
}

export default ThreadButton;
