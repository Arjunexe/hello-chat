"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

// Join the matchmaking queue and try to find a match
export async function joinQueue(): Promise<{ sessionId: string | null }> {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.name) {
        throw new Error("You must be logged in");
    }

    const userId = session.user.id;
    const username = session.user.name;

    // Check if user already has an active session
    const { data: existingSession } = await supabase
        .from("dm_sessions")
        .select("id")
        .eq("status", "active")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .limit(1)
        .maybeSingle();

    if (existingSession) {
        return { sessionId: existingSession.id };
    }

    // Remove any stale queue entries for this user
    await supabase.from("chat_queue").delete().eq("user_id", userId);

    // Check if someone else is already waiting
    const { data: waitingUser } = await supabase
        .from("chat_queue")
        .select("*")
        .neq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (waitingUser) {
        // Found a match! Create a session
        const { data: newSession, error: sessionError } = await supabase
            .from("dm_sessions")
            .insert({
                user1_id: waitingUser.user_id,
                user1_username: waitingUser.username,
                user2_id: userId,
                user2_username: username,
                status: "active",
            })
            .select("id")
            .single();

        if (sessionError) {
            console.error("Failed to create session:", sessionError);
            throw new Error("Failed to create chat session");
        }

        // Remove the matched user from queue
        await supabase.from("chat_queue").delete().eq("id", waitingUser.id);

        return { sessionId: newSession.id };
    }

    // No one waiting — add ourselves to the queue
    const { error: queueError } = await supabase.from("chat_queue").insert({
        user_id: userId,
        username: username,
    });

    if (queueError) {
        // Might be a unique constraint violation (already in queue)
        if (queueError.code === "23505") {
            return { sessionId: null }; // Already queued, just wait
        }
        console.error("Failed to join queue:", queueError);
        throw new Error("Failed to join queue");
    }

    return { sessionId: null }; // Waiting for a match
}

// Leave the matchmaking queue
export async function leaveQueue() {
    const session = await auth();
    if (!session?.user?.id) return;

    await supabase.from("chat_queue").delete().eq("user_id", session.user.id);
}

// End a 1v1 chat session
export async function endSession(sessionId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("You must be logged in");
    }

    const { error } = await supabase
        .from("dm_sessions")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", sessionId)
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`);

    if (error) {
        console.error("Failed to end session:", error);
        throw new Error("Failed to end session");
    }
}

// Send a DM in a session
export async function sendDM(sessionId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.name) {
        throw new Error("You must be logged in");
    }

    if (!content || content.trim().length === 0) {
        throw new Error("Message cannot be empty");
    }

    const { error } = await supabase.from("dm_messages").insert({
        session_id: sessionId,
        user_id: session.user.id,
        username: session.user.name,
        content: content.trim(),
    });

    if (error) {
        console.error("Failed to send DM:", error);
        throw new Error("Failed to send message");
    }
}

// Load older DM messages for pagination
export async function loadOlderDMs(sessionId: string, beforeTimestamp: string, limit: number = 50) {
    const { data, error } = await supabase
        .from("dm_messages")
        .select("*")
        .eq("session_id", sessionId)
        .lt("created_at", beforeTimestamp)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Failed to load older DMs:", error);
        throw new Error("Failed to load older messages");
    }

    return (data || []).reverse();
}
