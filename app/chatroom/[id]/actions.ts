"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function sendMessage(chatroomId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.name) {
        throw new Error("You must be logged in to send messages");
    }

    if (!content || content.trim().length === 0) {
        throw new Error("Message cannot be empty");
    }

    const { error } = await supabase.from("messages").insert({
        chatroom_id: chatroomId,
        user_id: session.user.id,
        username: session.user.name,
        content: content.trim(),
    });

    if (error) {
        console.error("Failed to send message:", error);
        throw new Error("Failed to send message");
    }
}

export async function loadOlderMessages(chatroomId: string, beforeTimestamp: string, limit: number = 50) {
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chatroom_id", chatroomId)
        .lt("created_at", beforeTimestamp)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Failed to load older messages:", error);
        throw new Error("Failed to load older messages");
    }

    // Reverse to get chronological order (we fetched newest-first for the limit)
    return (data || []).reverse();
}
