import Link from "next/link";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background gradient */}

      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/55 via-black to-black" />

      <div className="absolute inset-0 bg-gradient-to-bl from-purple-900/40 via-transparent to-transparent" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-8">
        <h1 className="text-3xl font-semibold text-white mb-2">
          Create account
        </h1>

        <p className="text-white/60 mb-8">
          Join <span className="text-purple-400">All-Chat</span> today
        </p>

        <SignupForm />

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
