import { model, models, Schema } from "mongoose";
import mongoose from "mongoose";

export interface Thread extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  postImage: string;
  likes: string;
  createdAt: Date;
}

const ThreadSchema = new Schema<Thread>(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: false,
      trim: true,
    },

    postImage: {
      type: String,
      required: false,
    },

    likes: {
      type: String,
      required: false,
    },
  },

  { timestamps: true },
);

const Thread = models.Thread || model<Thread>("Thread", ThreadSchema);

export default Thread;
