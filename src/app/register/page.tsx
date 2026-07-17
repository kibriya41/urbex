"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("all fields except image are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signUp.email({
        email,
        password,
        name,
        image: imagePreview || undefined, // Base64 string for better-auth custom avatar
        callbackURL: "/",
      });
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("registration error:", err);
      setError(err.message || "failed to register account. please try again.");
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
                Create an account
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-1.5">
                Join urbex to catalog and save abandoned places.
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
              {/* Image Picker */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-20 h-20 rounded-full border border-[var(--border)] bg-[var(--background)] overflow-hidden group flex items-center justify-center">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Avatar preview" className="object-cover w-full h-full grayscale" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)]">
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                      <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                      <path d="M6.168 18.849a6 6 0 0 1 11.664 0" />
                    </svg>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Upload profile image"
                  />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  Upload profile picture
                </span>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
                />
              </div>

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
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Password
                </label>
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
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </form>

            <div className="text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)] pt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--rust)] hover:underline">
                Log in
              </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
