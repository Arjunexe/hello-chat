"use server";

import Thread from "@/lib/models/Threads";
import Comment from "@/lib/models/Comments";
import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// Ensure User model is registered for populate
import "@/lib/models/User";

interface CreateThreadData {
  title: string;
  content?: string;
  imageUrl?: string | null;
}

export async function createThreadAction(data: CreateThreadData) {
  const { title, content, imageUrl } = data;

  // Get session to get the author
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to create a thread" };
  }

  try {
    await connectDB();
    const newThread = new Thread({
      author: session.user.id,
      title: title,
      content: content,
      postImage: imageUrl,
    });
    await newThread.save();
    revalidatePath("/thread");
    return { success: true, threadId: newThread._id.toString() };
  } catch (error) {
    console.error("Something went wrong during creating the thread", error);
    return { error: "System Error: Please try again later." };
  }
}

export async function getThreads() {
  try {
    await connectDB();
    const threads = await Thread.find()
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .lean();

    // Transform MongoDB documents to plain objects
    return threads.map((thread: any) => ({
      id: thread._id.toString(),
      author: thread.author?.username || "Unknown",
      authorId: thread.author?._id?.toString() || null,
      title: thread.title,
      content: thread.content || "",
      image: thread.postImage || null,
      likes: thread.likes || "0",
      createdAt: thread.createdAt?.toISOString() || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching threads:", error);
    return [];
  }
}

export async function getThreadById(id: string) {
  try {
    await connectDB();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const thread = await Thread.findById(id)
      .populate("author", "username")
      .lean();

    if (!thread) {
      return null;
    }

    // Get comments for this thread
    const comments = await Comment.find({ threadId: id })
      .populate("authorId", "username")
      .sort({ createdAt: -1 })
      .lean();

    const typedThread = thread as any;
    const typedComments = comments as any[];

    return {
      id: typedThread._id.toString(),
      author: typedThread.author?.username || "Unknown",
      authorId: typedThread.author?._id?.toString() || null,
      title: typedThread.title,
      content: typedThread.content || "",
      image: typedThread.postImage || null,
      likes: typedThread.likes || "0",
      createdAt: typedThread.createdAt?.toISOString() || new Date().toISOString(),
      comments: typedComments.map((c) => ({
        id: c._id.toString(),
        user: c.authorId?.username || "Unknown",
        text: c.text || (Array.isArray(c.comment) ? c.comment[0] : c.comment) || "",
        createdAt: c.createdAt?.toISOString() || new Date().toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching thread:", error);
    return null;
  }
}

interface AddCommentData {
  threadId: string;
  text: string;
}

export async function addComment(data: AddCommentData) {
  const { threadId, text } = data;

  // Get session to get the author
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to comment" };
  }

  if (!text.trim()) {
    return { error: "Comment text is required" };
  }

  try {
    await connectDB();

    // Validate thread exists
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return { error: "Invalid thread ID" };
    }

    const thread = await Thread.findById(threadId);
    if (!thread) {
      return { error: "Thread not found" };
    }

    const newComment = new Comment({
      threadId: threadId,
      authorId: session.user.id,
      text: text.trim(),
    });
    await newComment.save();

    revalidatePath(`/thread/${threadId}`);
    return { success: true, commentId: newComment._id.toString() };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { error: "System Error: Please try again later." };
  }
}
