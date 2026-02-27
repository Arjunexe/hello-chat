"use server";

import Thread from "@/lib/models/Threads";
import Comment from "@/lib/models/Comments";
import Bookmark from "@/lib/models/Bookmark";
import User from "@/lib/models/User";
import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// ─── Thread Actions ──────────────────────────────────────────────

interface CreateThreadData {
  title: string;
  content?: string;
  imageUrl?: string | null;
}

export async function createThreadAction(data: CreateThreadData) {
  const { title, content, imageUrl } = data;

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

    return threads.map((thread: any) => ({
      id: thread._id.toString(),
      author: thread.author?.username || "Unknown",
      authorId: thread.author?._id?.toString() || null,
      title: thread.title,
      content: thread.content || "",
      image: thread.postImage || null,
      likedBy: (thread.likedBy || []).map((id: any) => id.toString()),
      likeCount: (thread.likedBy || []).length,
      createdAt: thread.createdAt?.toISOString() || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching threads:", error);
    return [];
  }
}

const THREADS_PER_PAGE = 6;

export async function getThreadsPaginated(cursor?: string, limit: number = THREADS_PER_PAGE) {
  try {
    await connectDB();

    const query = cursor ? { createdAt: { $lt: new Date(cursor) } } : {};

    const threads = await Thread.find(query)
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = threads.length > limit;
    const sliced = hasMore ? threads.slice(0, limit) : threads;

    const transformed = sliced.map((thread: any) => ({
      id: thread._id.toString(),
      author: thread.author?.username || "Unknown",
      authorId: thread.author?._id?.toString() || null,
      title: thread.title,
      content: thread.content || "",
      image: thread.postImage || null,
      likedBy: (thread.likedBy || []).map((id: any) => id.toString()),
      likeCount: (thread.likedBy || []).length,
      createdAt: thread.createdAt?.toISOString() || new Date().toISOString(),
    }));

    const nextCursor = sliced.length > 0
      ? sliced[sliced.length - 1].createdAt?.toISOString() || null
      : null;

    return { threads: transformed, nextCursor, hasMore };
  } catch (error) {
    console.error("Error fetching paginated threads:", error);
    return { threads: [], nextCursor: null, hasMore: false };
  }
}

// ─── Comment type for nested tree ────────────────────────────────

export type CommentNode = {
  id: string;
  user: string;
  text: string;
  parentId: string | null;
  createdAt: string;
  children: CommentNode[];
};

function buildCommentTree(flatComments: any[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  // First pass: create all nodes
  for (const c of flatComments) {
    map.set(c.id, { ...c, children: [] });
  }

  // Second pass: link children to parents
  for (const c of flatComments) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getThreadById(id: string) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const thread = await Thread.findById(id)
      .populate("author", "username")
      .lean();

    if (!thread) {
      return null;
    }

    // Get ALL comments for this thread (flat), sorted oldest first for tree building
    const comments = await Comment.find({ threadId: id })
      .populate("authorId", "username")
      .sort({ createdAt: 1 })
      .lean();

    const typedThread = thread as any;
    const typedComments = comments as any[];

    // Transform flat comments
    const flatComments = typedComments.map((c) => ({
      id: c._id.toString(),
      user: c.authorId?.username || "Unknown",
      text: c.text || "",
      parentId: c.parentId ? c.parentId.toString() : null,
      createdAt: c.createdAt?.toISOString() || new Date().toISOString(),
    }));

    // Build nested tree
    const commentTree = buildCommentTree(flatComments);

    return {
      id: typedThread._id.toString(),
      author: typedThread.author?.username || "Unknown",
      authorId: typedThread.author?._id?.toString() || null,
      title: typedThread.title,
      content: typedThread.content || "",
      image: typedThread.postImage || null,
      likedBy: (typedThread.likedBy || []).map((id: any) => id.toString()),
      likeCount: (typedThread.likedBy || []).length,
      createdAt: typedThread.createdAt?.toISOString() || new Date().toISOString(),
      comments: commentTree,
      commentCount: flatComments.length,
    };
  } catch (error) {
    console.error("Error fetching thread:", error);
    return null;
  }
}

// ─── Comment Actions ─────────────────────────────────────────────

interface AddCommentData {
  threadId: string;
  text: string;
  parentId?: string | null;
}

export async function addComment(data: AddCommentData) {
  const { threadId, text, parentId } = data;

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to comment" };
  }

  if (!text.trim()) {
    return { error: "Comment text is required" };
  }

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return { error: "Invalid thread ID" };
    }

    const thread = await Thread.findById(threadId);
    if (!thread) {
      return { error: "Thread not found" };
    }

    // Validate parentId if provided
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return { error: "Invalid parent comment ID" };
      }
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return { error: "Parent comment not found" };
      }
    }

    const newComment = new Comment({
      threadId: threadId,
      authorId: session.user.id,
      parentId: parentId || null,
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

// ─── Thread Management Actions ───────────────────────────────────

export async function deleteThreadAction(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to delete a thread" };
  }

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return { error: "Invalid thread ID" };
    }

    const thread = await Thread.findById(threadId);
    if (!thread) {
      return { error: "Thread not found" };
    }

    if (thread.author.toString() !== session.user.id) {
      return { error: "You can only delete your own threads" };
    }

    await Comment.deleteMany({ threadId: threadId });
    await Bookmark.deleteMany({ threadId: threadId });
    await Thread.findByIdAndDelete(threadId);

    revalidatePath("/thread");
    return { success: true };
  } catch (error) {
    console.error("Error deleting thread:", error);
    return { error: "System Error: Please try again later." };
  }
}

export async function toggleLikeAction(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to like a thread" };
  }

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return { error: "Invalid thread ID" };
    }

    const thread = await Thread.findById(threadId);
    if (!thread) {
      return { error: "Thread not found" };
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const likedBy = thread.likedBy || [];
    const alreadyLiked = likedBy.some((id: mongoose.Types.ObjectId) => id.equals(userId));

    if (alreadyLiked) {
      await Thread.findByIdAndUpdate(threadId, { $pull: { likedBy: userId } });
    } else {
      await Thread.findByIdAndUpdate(threadId, { $addToSet: { likedBy: userId } });
    }

    const updatedThread = await Thread.findById(threadId);
    const newLikeCount = (updatedThread?.likedBy || []).length;
    const nowLiked = !alreadyLiked;

    revalidatePath("/thread");
    revalidatePath(`/thread/${threadId}`);

    return { success: true, liked: nowLiked, likeCount: newLikeCount };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { error: "System Error: Please try again later." };
  }
}

// ─── Bookmark Actions ────────────────────────────────────────────

export async function toggleBookmark(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to bookmark" };
  }

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return { error: "Invalid thread ID" };
    }

    const existing = await Bookmark.findOne({
      userId: session.user.id,
      threadId: threadId,
    });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return { success: true, bookmarked: false };
    } else {
      await Bookmark.create({ userId: session.user.id, threadId: threadId });
      return { success: true, bookmarked: true };
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { error: "System Error: Please try again later." };
  }
}

export async function getUserBookmarkIds() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    await connectDB();
    const bookmarks = await Bookmark.find({ userId: session.user.id }).lean();
    return bookmarks.map((b: any) => b.threadId.toString());
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
}

export async function getBookmarkedThreads() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    await connectDB();
    const bookmarks = await Bookmark.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const threadIds = bookmarks.map((b: any) => b.threadId);

    const threads = await Thread.find({ _id: { $in: threadIds } })
      .populate("author", "username")
      .lean();

    return threads.map((thread: any) => ({
      id: thread._id.toString(),
      author: thread.author?.username || "Unknown",
      authorId: thread.author?._id?.toString() || null,
      title: thread.title,
      content: thread.content || "",
      image: thread.postImage || null,
      likedBy: (thread.likedBy || []).map((id: any) => id.toString()),
      likeCount: (thread.likedBy || []).length,
      createdAt: thread.createdAt?.toISOString() || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching bookmarked threads:", error);
    return [];
  }
}

// ─── User Search (for @mentions) ─────────────────────────────────

export async function searchUsers(query: string) {
  if (!query || query.length < 1) return [];

  try {
    await connectDB();
    const users = await User.find({
      username: { $regex: `^${query}`, $options: "i" },
    })
      .select("username")
      .limit(5)
      .lean();

    return users.map((u: any) => ({
      id: u._id.toString(),
      username: u.username,
    }));
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}
