import mongoose, { model, Schema, Document } from "mongoose";

export interface IComment extends Document {
  threadId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId | null;
  text: string;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  { timestamps: true },
);

// Index for efficient querying of comments by thread
CommentSchema.index({ threadId: 1, createdAt: 1 });

// Force re-register model to pick up schema changes during hot reload
if (mongoose.models.Comment) {
  delete mongoose.models.Comment;
}

const Comment = model<IComment>("Comment", CommentSchema);

export default Comment;
