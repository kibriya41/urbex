"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

type Category =
  | "abandoned building"
  | "ruins"
  | "viewpoint"
  | "hidden gem"
  | "underground";

const CATEGORY_COLORS: Record<Category, string> = {
  "abandoned building": "text-[var(--rust)] border-[var(--rust)]/30 bg-[var(--rust)]/5",
  ruins: "text-[var(--moss)] border-[var(--moss)]/30 bg-[var(--moss)]/5",
  viewpoint: "text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/5",
  "hidden gem": "text-[var(--rust)] border-[var(--rust)]/30 bg-[var(--rust)]/5",
  underground: "text-[var(--text-muted)] border-[var(--border)] bg-[var(--background)]",
};

type Spot = {
  id: string;
  title: string;
  location: string;
  category: Category;
  rating: number;
  reviewCount: number;
  image: string;
  riskTag?: string;
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={
            i < full
              ? "text-[var(--warning)]"
              : i === full && partial >= 0.5
              ? "text-[var(--warning)] opacity-50"
              : "text-[var(--border)]"
          }
          fill={i < full || (i === full && partial >= 0.5) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function SpotCard({
  spot,
  isWishlisted,
  onToggleWishlist,
  togglingId,
}: {
  spot: Spot;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent, spotId: string) => void;
  togglingId: string | null;
}) {
  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group flex flex-col border border-[var(--border)] rounded-[8px] overflow-hidden bg-[var(--surface)] hover:border-[var(--text-muted)] transition-colors shrink-0 w-72 sm:w-auto"
    >
      {/* Photo */}
      <div className="relative h-44 w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={spot.image}
          alt={spot.title}
          className="object-cover w-full h-full grayscale group-hover:grayscale-[60%] transition-all duration-500"
        />
        {/* Risk tag badge */}
        {spot.riskTag && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] uppercase tracking-wider border border-white/20 bg-[#1C1B19]/70 text-white/70 rounded-[4px]">
            {spot.riskTag}
          </span>
        )}
        {/* Wishlist button */}
        <button
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={togglingId === spot.id}
          onClick={(e) => onToggleWishlist(e, spot.id)}
          className={`absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-[6px] border border-white/20 transition-colors focus:outline-none ${
            isWishlisted
              ? "bg-[var(--rust)] text-white border-[var(--rust)]"
              : "bg-[#1C1B19]/60 text-white/60 hover:text-white hover:border-white/40"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4">
        {/* Category tag */}
        <span
          className={`self-start px-2 py-0.5 text-[10px] uppercase tracking-wider border rounded-[4px] font-medium ${CATEGORY_COLORS[spot.category] ?? "text-[var(--text-muted)] border-[var(--border)]"}`}
        >
          {spot.category}
        </span>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--rust)] transition-colors truncate">
          {spot.title}
        </h3>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-[var(--text-muted)] truncate">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {spot.location}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[var(--border)]">
          <StarRating rating={spot.rating} />
          <span className="text-xs text-[var(--text-muted)]">
            <span className="text-[var(--text-primary)] font-medium">{spot.rating.toFixed(1)}</span>
            {" "}({spot.reviewCount})
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedSpots() {
  const { data: session } = useSession();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetch("/api/spots");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // Pick first 4 spots as featured
            setSpots(data.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Failed to load featured spots", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setWishlistedIds(new Set());
      return;
    }
    async function loadWishlist() {
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.spotIds)) {
            setWishlistedIds(new Set(data.spotIds));
          }
        }
      } catch (err) {
        console.error("Failed to load wishlist status", err);
      }
    }
    loadWishlist();
  }, [session]);

  const handleToggleWishlist = async (e: React.MouseEvent, spotId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    if (togglingId) return;
    setTogglingId(spotId);

    // Optimistic UI toggle
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (next.has(spotId)) {
        next.delete(spotId);
      } else {
        next.add(spotId);
      }
      return next;
    });

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId }),
      });
      if (!res.ok) throw new Error("Failed to save wishlist");
      const data = await res.json();
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        if (data.wishlisted) {
          next.add(spotId);
        } else {
          next.delete(spotId);
        }
        return next;
      });
    } catch (err) {
      // Revert optimistic change
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        if (next.has(spotId)) {
          next.delete(spotId);
        } else {
          next.add(spotId);
        }
        return next;
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <section
      className="py-20 sm:py-28 bg-[var(--surface)] border-t border-[var(--border)]"
      aria-labelledby="featured-spots-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header row */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Featured spots
            </p>
            <h2
              id="featured-spots-heading"
              className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] leading-snug"
            >
              Recently cataloged places
            </h2>
          </div>
          <Link
            href="/explore"
            className="shrink-0 flex items-center gap-1.5 text-sm text-[var(--rust)] hover:text-[#9C4830] transition-colors font-semibold uppercase tracking-wider text-xs"
          >
            View all
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* Horizontal scroll on mobile, 4-col grid on desktop */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col border border-[var(--border)] rounded-[8px] bg-[var(--background)] overflow-hidden animate-pulse h-80"
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
        ) : spots.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-[8px]">
            <span className="text-xs text-[var(--text-muted)]">No spots have been added yet. Be the first to catalog a spot!</span>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
            {spots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                isWishlisted={wishlistedIds.has(spot.id)}
                onToggleWishlist={handleToggleWishlist}
                togglingId={togglingId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
