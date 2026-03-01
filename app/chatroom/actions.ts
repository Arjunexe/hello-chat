"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createChatroom(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.name) {
        throw new Error("You must be logged in to create a chatroom");
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name || name.trim().length === 0) {
        throw new Error("Chatroom name is required");
    }

    const { error } = await supabase.from("chatrooms").insert({
        name: name.trim(),
        description: description?.trim() || null,
        created_by: session.user.id,
        created_by_username: session.user.name,
    });

    if (error) {
        console.error("Failed to create chatroom:", error);
        throw new Error("Failed to create chatroom");
    }

    revalidatePath("/chatroom");
}

export async function deleteChatroom(chatroomId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("You must be logged in");
    }

    // Only allow the creator to delete
    const { data: chatroom } = await supabase
        .from("chatrooms")
        .select("created_by")
        .eq("id", chatroomId)
        .single();

    if (!chatroom || chatroom.created_by !== session.user.id) {
        throw new Error("You can only delete chatrooms you created");
    }

    const { error } = await supabase
        .from("chatrooms")
        .delete()
        .eq("id", chatroomId);

    if (error) {
        console.error("Failed to delete chatroom:", error);
        throw new Error("Failed to delete chatroom");
    }

    revalidatePath("/chatroom");
}

export async function updateChatroom(chatroomId: string, name: string, description: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("You must be logged in");
    }

    if (!name || name.trim().length === 0) {
        throw new Error("Room name is required");
    }

    // Only allow the creator to edit
    const { data: chatroom } = await supabase
        .from("chatrooms")
        .select("created_by")
        .eq("id", chatroomId)
        .single();

    if (!chatroom || chatroom.created_by !== session.user.id) {
        throw new Error("You can only edit chatrooms you created");
    }

    const { error } = await supabase
        .from("chatrooms")
        .update({
            name: name.trim(),
            description: description?.trim() || null,
        })
        .eq("id", chatroomId);

    if (error) {
        console.error("Failed to update chatroom:", error);
        throw new Error("Failed to update chatroom");
    }

    revalidatePath(`/chatroom/${chatroomId}`);
    revalidatePath("/chatroom");
}
