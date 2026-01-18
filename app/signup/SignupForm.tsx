"use client";

import { signup } from "../../app/signup/actions";
import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const initialState = { error: "", success: false };

export default function SignupForm() {
  const [password, setPassword] = useState("");
  const [passErrors, setPassError] = useState("");
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const router = useRouter();

  // Redirect on successful signup
  useEffect(() => {
    if (state.success) {
      router.push("/login");
    }
  }, [state.success, router]);

  async function handlePassword(value: string) {
    setPassword(value);
  }

  function passwordValid(value: string) {
    const passwordRegex = /^(?!\s*$).+/;
    if (!passwordRegex.test(value)) {
      setPassError("Password is required.");
    } else {
      if (!/[A-Z]/.test(value)) {
        setPassError("Password must contain at least one uppercase letter.");
        return;
      }
      if (!/[a-z]/.test(value)) {
        setPassError("Password must contain at least one lowercase letter.");
        return;
      }
      if (!/\d/.test(value)) {
        setPassError("Password must contain at least one digit.");
        return;
      }
      if (!/[@$#!%*?&]/.test(value)) {
        setPassError(
          "Password must contain at least one special character (@$!%*?&).",
        );
        return;
      }
      if (value.length < 6) {
        setPassError("Password must contain at least 6 characters");
        return;
      }
    }
    setPassError("");
    return;
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.success && (
        <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm">
          Account created! Redirecting to login...
        </div>
      )}

      <div>
        <label className="block text-sm text-white/70 mb-1">Username</label>
        <input
          type="text"
          name="username"
          placeholder="yourname"
          required
          className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-1">Email</label>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-1">Password</label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          required
          onChange={(e) => handlePassword(e.target.value)}
          onBlur={(e) => passwordValid(e.target.value)}
          className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {passErrors ? (
          <p className="text-red-500 pt-1 text-sm">{passErrors}</p>
        ) : null}

        {state.error ? (
          <p className="text-red-500 pt-1 text-sm">{state.error}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={!!passErrors || isPending}
        className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition py-3 font-medium text-white shadow-lg shadow-purple-600/30"
      >
        {isPending ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
