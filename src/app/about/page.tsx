"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[var(--background)] pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
          
          {/* Hero Header */}
          <div className="border-b border-[var(--border)] pb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              About Urbex
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-2 font-mono uppercase tracking-wider">
              Documenting forgotten spaces. Reclaiming history.
            </p>
          </div>

          {/* Section: The Mission */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              The Mission
            </h2>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              Urbex is a minimalist, community-driven database dedicated to documenting abandoned ruins, viewpoints, and hidden urban gems. Inspired by letterboxd-style logging, we aim to provide explorers with a space to discover, catalog, and review spots that lie hidden in plain sight.
            </p>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              Whether it’s a decaying 19th-century textile factory, a forgotten Cold War bunker, or a crane overlooking industrial docks, we believe these places deserve to have their history recorded before they are reclaimed by nature or demolished.
            </p>
          </div>

          {/* Section: Code of Conduct */}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[var(--rust)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h2 className="text-xs font-semibold uppercase tracking-wider">
                Explorer Code of Conduct
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Urban exploration is built on mutual respect and preservation. To keep these sites accessible and protect the community, we adhere strictly to the following principles:
            </p>
            <ul className="list-disc pl-5 text-xs text-[var(--text-primary)] space-y-2 leading-relaxed">
              <li>
                <strong className="text-[var(--text-primary)]">Leave no trace:</strong> Take nothing but photographs, leave nothing but footprints. Never vandalize, spray paint, or damage structural features.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Respect the hazards:</strong> Structural integrity, asbestos, rotten floors, and security details are real dangers. Never explore alone in high-risk zones, and always wear appropriate gear.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Legal responsibility:</strong> Exploration of abandoned properties may involve trespassing risks. Urbex does not encourage trespassing. Always seek permission when required and explore at your own risk.
              </li>
            </ul>
          </div>

          {/* Section: How to Contribute */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              How to Contribute
            </h2>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              Urbex is built entirely by you. Registered explorers can submit new spots, share photos, and leave reports detailing current accessibility conditions, structural hazards, or security presence.
            </p>
            <div className="flex gap-3 mt-2">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--text-primary)] bg-[var(--surface)] rounded-[8px] transition-colors"
              >
                Browse Spots
              </Link>
              <Link
                href="/post"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors"
              >
                Post a Spot
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
