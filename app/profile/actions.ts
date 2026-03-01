"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Thread from "@/lib/models/Threads";
import Comment from "@/lib/models/Comments";

export async function getProfileData() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    await connectDB();

    const [user, threadCount, commentCount] = await Promise.all([
        User.findById(session.user.id).select("username email createdAt").lean(),
        Thread.countDocuments({ author: session.user.id }),
        Comment.countDocuments({ authorId: session.user.id }),
    ]);

    if (!user) {
        throw new Error("User not found");
    }

    return {
        username: (user as any).username,
        email: (user as any).email,
        joinedAt: (user as any).createdAt?.toISOString() || new Date().toISOString(),
        stats: {
            threads: threadCount,
            comments: commentCount,
        },
    };
}
