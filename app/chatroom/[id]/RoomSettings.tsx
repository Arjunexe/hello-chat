"use client";

import { useState, useRef, useEffect } from "react";
import { updateChatroom } from "../actions";

interface RoomSettingsProps {
    chatroomId: string;
    currentName: string;
    currentDescription: string;
}

export default function RoomSettings({ chatroomId, currentName, currentDescription }: RoomSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [isOpen]);

    // Reset success message after 2 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;

        try {
            await updateChatroom(chatroomId, name, description);
            setSuccess(true);
            // Close after a brief delay to show success
            setTimeout(() => setIsOpen(false), 1200);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            {/* Settings gear button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                title="Room Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                Settings
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => {
                            if (!isSubmitting) setIsOpen(false);
                        }}
                    />

                    <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-purple-600/10">
                        <h3 className="text-lg font-bold text-white mb-1">Room Settings</h3>
                        <p className="text-sm text-neutral-400 mb-6">
                            Edit your chatroom&apos;s name and description.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="settings-name" className="block text-xs font-medium text-neutral-300 mb-1.5">
                                    Room Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    ref={nameInputRef}
                                    id="settings-name"
                                    name="name"
                                    type="text"
                                    required
                                    maxLength={50}
                                    defaultValue={currentName}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="settings-desc" className="block text-xs font-medium text-neutral-300 mb-1.5">
                                    Description <span className="text-neutral-500">(optional)</span>
                                </label>
                                <textarea
                                    id="settings-desc"
                                    name="description"
                                    rows={3}
                                    maxLength={200}
                                    defaultValue={currentDescription}
                                    placeholder="What's this room about?"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                                />
                            </div>

                            {error && (
                                <p className="text-red-400 text-xs font-medium">{error}</p>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Settings saved!
                                </div>
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
                                            Saving...
                                        </span>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
