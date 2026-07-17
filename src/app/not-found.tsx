"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[var(--background)] pt-24 pb-16 flex items-center justify-center min-h-[70vh]">
        <div className="max-w-md mx-auto px-4 text-center flex flex-col items-center gap-6">
          
          {/* Compass Icon */}
          <div className="w-16 h-16 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] text-[var(--rust)] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-6xl font-mono font-semibold tracking-tight text-[var(--rust)]">
              404
            </h1>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Coordinates Lost
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-sm mt-1">
              The spot you are looking for has either been demolished, reclaimed by nature, or never existed in the first place.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--text-primary)] bg-[var(--surface)] rounded-[8px] transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors"
            >
              Back to Explore
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
