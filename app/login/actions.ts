"use server";

// This file is kept for backwards compatibility but login is now handled by NextAuth
// See: /auth.ts for the actual authentication logic

export interface LoginState {
  error?: string;
  success?: boolean;
}

// Deprecated - login is now handled by NextAuth signIn
export async function login(
  _prevstate: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // This is no longer used - NextAuth handles login
  // Kept for type compatibility only
  return { error: "Please use the login form" };
}
