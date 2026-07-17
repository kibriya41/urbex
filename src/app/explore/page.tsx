"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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

const CATEGORIES: Category[] = ["abandoned building", "ruins", "viewpoint", "hidden gem", "underground"];

export default function ExplorePage() {
  const { data: session } = useSession();

  // ── Data state ──────────────────────────────────────────────────────────
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Wishlist state ────────────────────────────────────────────────────
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── UI filters ────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [sortBy, setSortBy] = useState<"popularity" | "rating" | "newest">("popularity");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [activeSpotId, setActiveSpotId] = useState<string | null>(null);

  // ── Fetch spots from API ──────────────────────────────────────────────
  useEffect(() => {
    async function loadSpots() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/spots");
        if (!res.ok) throw new Error("Failed to load spots");
        const data = await res.json();
        if (Array.isArray(data)) {
          setSpots(data);
        }
      } catch (err: any) {
        console.error("Failed to load spots:", err);
        setError("Failed to load spots from the server.");
      } finally {
        setLoading(false);
      }
    }
    loadSpots();
  }, []);

  // ── Fetch user wishlist on session ready ─────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) {
      setWishlistedIds(new Set());
      return;
    }
    async function loadWishlist() {
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.spotIds)) {
          setWishlistedIds(new Set(data.spotIds));
        }
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      }
    }
    loadWishlist();
  }, [session?.user?.id]);

  // ── Toggle wishlist ───────────────────────────────────────────────────
  const handleWishlistToggle = useCallback(
    async (e: React.MouseEvent, spotId: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!session?.user?.id) {
        // Redirect to login if not signed in
        window.location.href = "/login";
        return;
      }

      if (togglingId) return; // prevent rapid double-clicks
      setTogglingId(spotId);

      // Optimistic update
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
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        // Reconcile with server response
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
        // Revert optimistic update on failure
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
    },
    [session?.user?.id, togglingId]
  );

  // ── Filtered and sorted spots ─────────────────────────────────────────
  const processedSpots = useMemo(() => {
    let result = [...spots];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (spot) =>
          spot.title.toLowerCase().includes(query) ||
          spot.location.toLowerCase().includes(query) ||
          spot.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((spot) => spot.category === selectedCategory);
    }

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "newest") {
      // Treat mock IDs last, real IDs (longer strings) as newer
      result.sort((a, b) => {
        const aIsReal = a.id.length > 6;
        const bIsReal = b.id.length > 6;
        if (aIsReal && !bIsReal) return -1;
        if (!aIsReal && bIsReal) return 1;
        return 0;
      });
    } else {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [spots, search, selectedCategory, sortBy]);

  // ── Skeleton loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-16 bg-[var(--background)]">
          <main className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-6">
            <div>
              <div className="h-8 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-[8px] animate-pulse" />
              <div className="h-4 w-72 bg-[var(--surface)] border border-[var(--border)] rounded-[8px] animate-pulse mt-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
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
          </main>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16 bg-[var(--background)]">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-6">

          {/* Page Header */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                Explore spots
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {loading ? "Loading catalog..." : `${spots.length} location${spots.length !== 1 ? "s" : ""} cataloged by the community`}
              </p>
            </div>
            <Link
              href="/post"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Post a spot
            </Link>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="border border-[var(--rust)]/30 bg-[var(--rust)]/5 text-[var(--rust)] text-xs p-3 rounded-[8px] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Filter controls */}
          <div className="flex flex-col gap-3">
            {/* Search & Sort & View toggle */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search name, location, keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[8px] pl-9 pr-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Sort dropdown */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "popularity" | "rating" | "newest")}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors appearance-none cursor-pointer"
                >
                  <option value="popularity">Sort: Popular</option>
                  <option value="rating">Sort: Top rated</option>
                  <option value="newest">Sort: Newest</option>
                </select>

                {/* Grid/List Layout Toggle */}
                <div className="border border-[var(--border)] rounded-[8px] bg-[var(--surface)] flex p-0.5 overflow-hidden">
                  <button
                    onClick={() => setLayout("grid")}
                    aria-label="Grid view"
                    className={`p-1.5 rounded-[6px] transition-colors ${
                      layout === "grid"
                        ? "bg-[var(--background)] text-[var(--rust)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setLayout("list")}
                    aria-label="List view"
                    className={`p-1.5 rounded-[6px] transition-colors ${
                      layout === "list"
                        ? "bg-[var(--background)] text-[var(--rust)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Category selector row */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 text-xs border rounded-[8px] font-medium transition-colors shrink-0 uppercase tracking-wider ${
                  selectedCategory === "all"
                    ? "bg-[var(--rust)]/5 text-[var(--rust)] border-[var(--rust)]"
                    : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs border rounded-[8px] font-medium transition-colors shrink-0 uppercase tracking-wider ${
                    selectedCategory === cat
                      ? "bg-[var(--rust)]/5 text-[var(--rust)] border-[var(--rust)]"
                      : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {!loading && processedSpots.length === 0 && (
            <div className="text-center py-16 border border-[var(--border)] bg-[var(--surface)] rounded-[8px] px-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--text-muted)] mx-auto mb-3"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">No spots match your search</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-xs mx-auto">
                Try adjusting filters or checking for typos. Or{" "}
                <Link href="/post" className="text-[var(--rust)] hover:underline">
                  post the spot yourself
                </Link>{" "}
                to populate the catalog!
              </p>
            </div>
          )}

          {/* Feed Cards: Grid vs List layout modes */}
          <div
            className={
              layout === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {processedSpots.map((spot) => {
              const isActive = activeSpotId === spot.id;
              const isWishlisted = wishlistedIds.has(spot.id);
              const isToggling = togglingId === spot.id;

              return (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.id}`}
                  onMouseEnter={() => setActiveSpotId(spot.id)}
                  onMouseLeave={() => setActiveSpotId(null)}
                  className={`group flex overflow-hidden border rounded-[8px] bg-[var(--surface)] transition-all ${
                    isActive ? "border-[var(--text-primary)]" : "border-[var(--border)]"
                  } ${layout === "grid" ? "flex-col" : "flex-row h-32 sm:h-36"}`}
                >
                  {/* Photo */}
                  <div className={`relative shrink-0 overflow-hidden ${layout === "grid" ? "h-44 w-full" : "h-full w-28 sm:w-44"}`}>
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

                      {/* Description (List view only) */}
                      {layout === "list" && (
                        <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1 leading-normal">
                          {spot.description}
                        </p>
                      )}

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
                      {/* Wishlist Save Button */}
                      <button
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        disabled={isToggling}
                        className={`transition-colors disabled:opacity-40 ${
                          isWishlisted
                            ? "text-[var(--rust)]"
                            : "text-[var(--text-muted)] hover:text-[var(--rust)]"
                        }`}
                        onClick={(e) => handleWishlistToggle(e, spot.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill={isWishlisted ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </main>
      </div>
      <Footer />
    </>
  );
}
