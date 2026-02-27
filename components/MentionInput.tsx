"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchUsers } from "@/app/thread/action";

interface MentionInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    compact?: boolean;
}

interface UserSuggestion {
    id: string;
    username: string;
}

export default function MentionInput({
    value,
    onChange,
    placeholder,
    className = "",
    compact = false,
}: MentionInputProps) {
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionStart, setMentionStart] = useState(-1);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleChange = useCallback(
        (text: string) => {
            onChange(text);

            // Find if we're typing a mention
            const el = inputRef.current;
            if (!el) return;

            const cursorPos = el.selectionStart || 0;
            const textBeforeCursor = text.slice(0, cursorPos);

            // Find the last @ that starts a mention
            const lastAtIndex = textBeforeCursor.lastIndexOf("@");

            if (lastAtIndex >= 0) {
                const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " ";
                // @ must be at start or after a space
                if (lastAtIndex === 0 || charBeforeAt === " " || charBeforeAt === "\n") {
                    const query = textBeforeCursor.slice(lastAtIndex + 1);
                    // Only search if the query doesn't contain spaces (it's a single word)
                    if (!query.includes(" ") && query.length > 0) {
                        setMentionQuery(query);
                        setMentionStart(lastAtIndex);
                        setSelectedIndex(0);

                        // Debounced search
                        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                        searchTimeoutRef.current = setTimeout(async () => {
                            const results = await searchUsers(query);
                            setSuggestions(results);
                            setShowSuggestions(results.length > 0);
                        }, 200);
                        return;
                    }
                }
            }

            // No active mention
            setShowSuggestions(false);
            setMentionQuery("");
        },
        [onChange],
    );

    const insertMention = useCallback(
        (username: string) => {
            if (mentionStart < 0) return;

            const before = value.slice(0, mentionStart);
            const el = inputRef.current;
            const cursorPos = el?.selectionStart || value.length;
            const after = value.slice(cursorPos);

            const newValue = `${before}@${username} ${after}`;
            onChange(newValue);
            setShowSuggestions(false);
            setMentionQuery("");
            setMentionStart(-1);

            // Focus back on input
            setTimeout(() => {
                if (el) {
                    const newCursorPos = before.length + username.length + 2; // +2 for @ and space
                    el.setSelectionRange(newCursorPos, newCursorPos);
                    el.focus();
                }
            }, 0);
        },
        [value, mentionStart, onChange],
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === "Enter" && suggestions[selectedIndex]) {
            e.preventDefault();
            insertMention(suggestions[selectedIndex].username);
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    // Close suggestions on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative flex-1">
            <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={className}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute bottom-full left-0 mb-1 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                    {suggestions.map((user, index) => (
                        <button
                            key={user.id}
                            onClick={() => insertMention(user.username)}
                            className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${index === selectedIndex
                                    ? "bg-purple-600/30 text-white"
                                    : "text-neutral-300 hover:bg-white/5"
                                }`}
                        >
                            <span className="w-6 h-6 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">
                                {user.username[0].toUpperCase()}
                            </span>
                            @{user.username}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
