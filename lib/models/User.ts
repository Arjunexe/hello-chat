import { Schema, models, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

// 1. Define the Interface (The "Type" part)
export interface IUser extends Document {
  username: string;
  email: string;
  password: string; // Optional because sometimes you might select users without password
  createdAt: Date;
  updatedAt: Date;
}

// 2. Pass the Interface to the Schema (Generics)
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

// 3. Export with the Type
// models - specific to nextjs, it has a list of all the models created
// model -
const User = models.User || model<IUser>("User", UserSchema);

export default User;
