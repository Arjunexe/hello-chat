"use server";

import userModel from "@/lib/models/User";
import { connectDB } from "@/lib/db";

export interface SignupState {
  error?: string;
  success?: boolean;
}

export async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const userName = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!userName || userName.length < 4 || userName.length > 10) {
    return { error: "Username must be between 4 and 10 characters long." };
  }

  if (!email || !emailRegex.test(email)) {
    return { error: "Please provide a valid email address." };
  }

  try {
    await connectDB();
    const newUser = new userModel({
      username: userName,
      email: email,
      password: password,
    });

    await newUser.save();

    return { success: true };
  } catch (error: any) {
    console.error("Something went wrong during Signup action", error);
    return { error: "System Error: Please try again later." };
  }
}
