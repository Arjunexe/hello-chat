"use client";

import { useState, useRef, useEffect } from "react";
import { createChatroom } from "./actions";

export default function CreateChatroomForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const formRef = useRef<HTMLFormElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [isOpen]);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError("");
        try {
            await createChatroom(formData);
            formRef.current?.reset();
            setIsOpen(false);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Room
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => {
                    if (!isSubmitting) setIsOpen(false);
                }}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-purple-600/10 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-white mb-1">Create a Chatroom</h3>
                <p className="text-sm text-neutral-400 mb-6">
                    Start a new room for your crew to hang out.
                </p>

                <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="chatroom-name" className="block text-xs font-medium text-neutral-300 mb-1.5">
                            Room Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            ref={nameInputRef}
                            id="chatroom-name"
                            name="name"
                            type="text"
                            required
                            maxLength={50}
                            placeholder="e.g. General, Gaming, Music"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="chatroom-desc" className="block text-xs font-medium text-neutral-300 mb-1.5">
                            Description <span className="text-neutral-500">(optional)</span>
                        </label>
                        <textarea
                            id="chatroom-desc"
                            name="description"
                            rows={2}
                            maxLength={200}
                            placeholder="What's this room about?"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs font-medium">{error}</p>
                    )}

                    <div className="flex items-center justify-end gap-3 mt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating...
                                </span>
                            ) : (
                                "Create Room"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
