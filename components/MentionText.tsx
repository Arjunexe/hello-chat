import React from "react";

interface MentionTextProps {
    text: string;
    className?: string;
}

export default function MentionText({ text, className = "" }: MentionTextProps) {
    // Split text by @mentions pattern and highlight them
    const parts = text.split(/(@\w+)/g);

    return (
        <p className={className}>
            {parts.map((part, i) => {
                if (part.match(/^@\w+$/)) {
                    return (
                        <span key={i} className="text-purple-400 font-medium">
                            {part}
                        </span>
                    );
                }
                return <React.Fragment key={i}>{part}</React.Fragment>;
            })}
        </p>
    );
}
