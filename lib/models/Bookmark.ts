import mongoose, { model, models, Schema, Document } from "mongoose";

export interface IBookmark extends Document {
    userId: mongoose.Types.ObjectId;
    threadId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        threadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
            required: true,
        },
    },
    { timestamps: true },
);

// Compound unique index — one bookmark per user per thread
BookmarkSchema.index({ userId: 1, threadId: 1 }, { unique: true });

const Bookmark = models.Bookmark || model<IBookmark>("Bookmark", BookmarkSchema);

export default Bookmark;
