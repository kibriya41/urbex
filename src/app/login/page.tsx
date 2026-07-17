"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("both fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn.email({
        email,
        password,
        callbackURL: "/",
      });
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("login error:", err);
      setError(err.message || "failed to log in. please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[var(--background)] pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md px-4">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-8 rounded-[8px] flex flex-col gap-6">
            
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                Log in to your account
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-1.5">
                Welcome back. Explore and log your findings.
              </p>
            </div>

            {error && (
              <div className="border border-[var(--rust)]/30 bg-[var(--rust)]/5 text-[var(--rust)] text-xs p-3 rounded-[8px] flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Password
                  </label>
                  <Link href="/forgot" className="text-xs text-[var(--rust)] hover:underline">
                    Forgot?
                  </Link>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)] pt-4">
              Don't have an account?{" "}
              <Link href="/register" className="text-[var(--rust)] hover:underline">
                Sign up
              </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
