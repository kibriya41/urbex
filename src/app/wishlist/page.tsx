"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "@/lib/auth-client";

type Category = "abandoned building" | "ruins" | "viewpoint" | "hidden gem" | "underground";

interface Spot {
  id: string;
  title: string;
  location: string;
  category: Category;
  rating: number;
  reviewCount: number;
  image: string;
  riskTag?: string;
  description: string;
}

const CATEGORY_COLORS: Record<Category, string> = {
  "abandoned building": "text-[var(--rust)] border-[var(--rust)]/30 bg-[var(--rust)]/5",
  ruins: "text-[var(--moss)] border-[var(--moss)]/30 bg-[var(--moss)]/5",
  viewpoint: "text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/5",
  "hidden gem": "text-[var(--rust)] border-[var(--rust)]/30 bg-[var(--rust)]/5",
  underground: "text-[var(--text-muted)] border-[var(--border)] bg-[var(--background)]",
};

export default function WishlistPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      setLoading(false);
      return;
    }

    async function loadWishlist() {
      try {
        const res = await fetch("/api/wishlist?includeSpots=true");
        if (!res.ok) throw new Error("Failed to load wishlist");
        const data = await res.json();
        setSpots(data.spots || []);
      } catch (err: any) {
        console.error(err);
        setError("Could not retrieve wishlisted locations.");
      } finally {
        setLoading(false);
      }
    }

    loadWishlist();
  }, [session, sessionLoading]);

  const handleRemove = async (e: React.MouseEvent, spotId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (togglingId) return;
    setTogglingId(spotId);

    // Optimistic state update
    const previousSpots = [...spots];
    setSpots((prev) => prev.filter((s) => s.id !== spotId));

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      if (data.wishlisted) {
        // If somehow server says it was added, put it back
        setSpots(previousSpots);
      }
    } catch (err) {
      // Revert on error
      setSpots(previousSpots);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16 bg-[var(--background)]">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              Your wishlist
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Locations you plan to explore soon.
            </p>
          </div>

          {sessionLoading || (session && loading) ? (
            // Skeleton Loader
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col border border-[var(--border)] rounded-[8px] bg-[var(--surface)] overflow-hidden animate-pulse"
                >
                  <div className="h-44 w-full bg-[var(--border)]" />
                  <div className="p-4 flex flex-col gap-2">
                    <div className="h-3 w-24 bg-[var(--border)] rounded-[4px]" />
                    <div className="h-4 w-36 bg-[var(--border)] rounded-[4px]" />
                    <div className="h-3 w-20 bg-[var(--border)] rounded-[4px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : !session ? (
            // Not Logged In State
            <div className="text-center py-16 border border-[var(--border)] bg-[var(--surface)] rounded-[8px] px-6 max-w-md mx-auto w-full mt-4 flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-[8px] bg-[var(--rust)]/5 text-[var(--rust)] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Log in to view wishlist</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Keep track of hidden spots, viewpoint cranes, and abandoned factory sites by logging in.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors"
              >
                Log In
              </Link>
            </div>
          ) : error ? (
            // Error banner
            <div className="border border-[var(--rust)]/30 bg-[var(--rust)]/5 text-[var(--rust)] text-xs p-3 rounded-[8px] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          ) : spots.length === 0 ? (
            // Empty State
            <div className="text-center py-16 border border-[var(--border)] bg-[var(--surface)] rounded-[8px] px-6 max-w-md mx-auto w-full mt-4 flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-[8px] bg-[var(--text-muted)]/5 text-[var(--text-muted)] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="12 2 2 22 12 17 22 22 12 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Your wishlist is empty</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Start exploring cataloged spots and click the bookmark button to save them here.
                </p>
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors"
              >
                Explore Spots
              </Link>
            </div>
          ) : (
            // Grid of wishlisted spots
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {spots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.id}`}
                  className="group flex flex-col overflow-hidden border border-[var(--border)] rounded-[8px] bg-[var(--surface)] hover:border-[var(--text-primary)] transition-all"
                >
                  {/* Photo */}
                  <div className="relative h-44 w-full overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={spot.image}
                      alt={spot.title}
                      className="object-cover w-full h-full grayscale group-hover:grayscale-[50%] transition-all duration-500"
                    />
                    {spot.riskTag && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[8px] uppercase tracking-wider border border-white/20 bg-[#1C1B19]/70 text-white/70 rounded-[4px]">
                        {spot.riskTag}
                      </span>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="flex-1 flex flex-col p-4 justify-between gap-1 overflow-hidden">
                    <div className="flex flex-col gap-1 overflow-hidden">
                      {/* Upper row: category & rating */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider border rounded-[4px] font-medium ${CATEGORY_COLORS[spot.category] ?? "text-[var(--text-muted)] border-[var(--border)]"}`}
                        >
                          {spot.category}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-[var(--warning)]"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span className="font-semibold text-[var(--text-primary)]">{spot.rating.toFixed(1)}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--rust)] transition-colors truncate mt-1 block">
                        {spot.title}
                      </span>

                      {/* Location */}
                      <p className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] mt-1 truncate">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {spot.location}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-2 mt-2">
                      <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">
                        {spot.reviewCount} {spot.reviewCount === 1 ? "Review" : "Reviews"}
                      </span>
                      {/* Wishlist Remove Button */}
                      <button
                        aria-label="Remove from wishlist"
                        disabled={togglingId === spot.id}
                        className="text-[var(--rust)] hover:opacity-80 transition-opacity disabled:opacity-40"
                        onClick={(e) => handleRemove(e, spot.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
