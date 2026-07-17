"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  lat: number; // percentage values for our mock SVG map
  lng: number; // percentage values for our mock SVG map
  description: string;
}

const CATEGORY_COLORS: Record<Category, string> = {
  "abandoned building": "text-[var(--rust)] border-[var(--rust)]/30 bg-[var(--rust)]/5",
  ruins: "text-[var(--moss)] border-[var(--moss)]/30 bg-[var(--moss)]/5",
  viewpoint: "text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/5",
  "hidden gem": "text-[var(--rust)] border-[var(--rust)]/30 bg-[var(--rust)]/5",
  underground: "text-[var(--text-muted)] border-[var(--border)] bg-[var(--background)]",
};

const SPOTS_DATABASE: Spot[] = [
  {
    id: "1",
    title: "Verlassene Textilfabrik",
    location: "Leipzig, Germany",
    category: "abandoned building",
    rating: 4.7,
    reviewCount: 38,
    image: "/spot-factory.png",
    riskTag: "trespassing risk",
    lat: 38,
    lng: 45,
    description: "A decaying 19th-century textile factory with collapsing roofs, rusted iron machinery, and spectacular skylight shafts.",
  },
  {
    id: "2",
    title: "Roman wall ruins",
    location: "Chester, UK",
    category: "ruins",
    rating: 4.5,
    reviewCount: 61,
    image: "/spot-ruins.png",
    lat: 28,
    lng: 32,
    description: "Deeply historical ruins of defensive walls built during Roman occupation, overgrown with moss and ivy.",
  },
  {
    id: "3",
    title: "Gaswerk rooftop",
    location: "Vienna, Austria",
    category: "viewpoint",
    rating: 4.9,
    reviewCount: 24,
    image: "/spot-viewpoint.png",
    riskTag: "permission needed",
    lat: 44,
    lng: 55,
    description: "An incredible viewpoint from the rusty crown of an old gasometer structure, offering a panoramic city view.",
  },
  {
    id: "4",
    title: "Flood tunnel network",
    location: "Bucharest, Romania",
    category: "underground",
    rating: 4.3,
    reviewCount: 19,
    image: "/spot-tunnel.png",
    riskTag: "trespassing risk",
    lat: 56,
    lng: 62,
    description: "A dry, subterranean brick stormwater bypass tunnel originating from the mid-20th century. High humidity.",
  },
  {
    id: "5",
    title: "Beelitz Military Hospital",
    location: "Beelitz, Germany",
    category: "abandoned building",
    rating: 4.8,
    reviewCount: 92,
    image: "/spot-factory.png", // Reuse existing generated images
    riskTag: "trespassing risk",
    lat: 32,
    lng: 48,
    description: "Massive sanatorium and military hospital complex famous for its architecture and rotting surgical rooms.",
  },
  {
    id: "6",
    title: "Buzludzha monument",
    location: "Kran, Bulgaria",
    category: "ruins",
    rating: 4.9,
    reviewCount: 104,
    image: "/spot-ruins.png",
    riskTag: "patrolled area",
    lat: 62,
    lng: 58,
    description: "The UFO-shaped abandoned monument on Mount Buzludzha, showcasing striking brutalist architectural elements.",
  },
  {
    id: "7",
    title: "Rooftop crane viewpoint",
    location: "Hamburg, Germany",
    category: "viewpoint",
    rating: 4.6,
    reviewCount: 14,
    image: "/spot-viewpoint.png",
    riskTag: "trespassing risk",
    lat: 30,
    lng: 42,
    description: "Climbable dockyard crane providing unparalleled sights of Hamburg harbor. Not for the faint of heart.",
  },
  {
    id: "8",
    title: "Abandoned canal lock",
    location: "Sainte-Marie, France",
    category: "hidden gem",
    rating: 4.4,
    reviewCount: 9,
    image: "/spot-tunnel.png",
    lat: 48,
    lng: 36,
    description: "A forgotten waterway junction, now dry and filled with dense forestry. A quiet, peaceful exploration spot.",
  },
];

export default function ExplorePage() {
  const [spots, setSpots] = useState<Spot[]>(SPOTS_DATABASE);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [sortBy, setSortBy] = useState<"popularity" | "rating" | "newest">("popularity");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [activeSpotId, setActiveSpotId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSpots() {
      try {
        const res = await fetch("/api/spots");
        if (res.ok) {
          const data = await res.ok ? await res.json() : [];
          if (Array.isArray(data) && data.length > 0) {
            setSpots(data);
          }
        }
      } catch (err) {
        console.error("Failed to load spots from API:", err);
      }
    }
    loadSpots();
  }, []);

  // Filtered and sorted spots
  const processedSpots = useMemo(() => {
    let result = [...spots];

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (spot) =>
          spot.title.toLowerCase().includes(query) ||
          spot.location.toLowerCase().includes(query) ||
          spot.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((spot) => spot.category === selectedCategory);
    }

    // Sort sorting logic
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "newest") {
      result.sort((a, b) => Number(b.id) - Number(a.id));
    } else {
      // popularity -> reviewCount
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [search, selectedCategory, sortBy]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen pt-14">
        {/* Main Content Area: Split pane layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Feed + Filters */}
          <main className="w-full lg:w-3/5 overflow-y-auto px-4 sm:px-6 py-6 border-r border-[var(--border)] flex flex-col gap-6 bg-[var(--background)]">
            
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                Explore spots
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Discover locations cataloged by other community members.
              </p>
            </div>

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
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[8px] pl-9 pr-3.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
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
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors appearance-none cursor-pointer"
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
                {(["abandoned building", "ruins", "viewpoint", "hidden gem", "underground"] as Category[]).map((cat) => (
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
            {processedSpots.length === 0 && (
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
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">No spots match search query</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-xs mx-auto">
                  Try adjusting filters or checking for typos. Or post the spot yourself to populate the catalog!
                </p>
              </div>
            )}

            {/* Feed Cards: Grid vs List layout modes */}
            <div
              className={
                layout === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                  : "flex flex-col gap-3"
              }
            >
              {processedSpots.map((spot) => {
                const isActive = activeSpotId === spot.id;
                return (
                  <div
                    key={spot.id}
                    onMouseEnter={() => setActiveSpotId(spot.id)}
                    onMouseLeave={() => setActiveSpotId(null)}
                    className={`group flex overflow-hidden border rounded-[8px] bg-[var(--surface)] transition-all ${
                      isActive ? "border-[var(--text-primary)]" : "border-[var(--border)]"
                    } ${layout === "grid" ? "flex-col" : "flex-row h-32 sm:h-36"}`}
                  >
                    {/* Photo */}
                    <div className={`relative shrink-0 ${layout === "grid" ? "h-40 w-full" : "h-full w-28 sm:w-44"}`}>
                      <Image
                        src={spot.image}
                        alt={spot.title}
                        fill
                        className="object-cover grayscale group-hover:grayscale-[50%] transition-all duration-500"
                        sizes="(max-width: 640px) 100vw, 30vw"
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
                            className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider border rounded-[4px] font-medium ${CATEGORY_COLORS[spot.category]}`}
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
                            <span className="font-semibold text-[var(--text-primary)]">{spot.rating}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <Link
                          href={`/spots/${spot.id}`}
                          className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--rust)] transition-colors truncate mt-1 block"
                        >
                          {spot.title}
                        </Link>

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
                          {spot.reviewCount} Reviews
                        </span>
                        {/* Save Button */}
                        <button
                          aria-label="Add to wishlist"
                          className="text-[var(--text-muted)] hover:text-[var(--rust)] transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* Right Panel: Interactive Mock Map (Visible on Desktop / Toggle overlay on Mobile) */}
          <aside
            className={`w-full lg:w-2/5 border-l border-[var(--border)] bg-[#E9E5DD] dark:bg-[#151412] relative overflow-hidden flex flex-col ${
              showMapMobile ? "fixed inset-0 z-50 pt-14 flex" : "hidden lg:flex"
            }`}
          >
            {/* Mobile close map button */}
            {showMapMobile && (
              <button
                onClick={() => setShowMapMobile(false)}
                className="absolute top-4 right-4 z-50 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-[8px] p-2 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            {/* Map Canvas - Simulated with styled SVG */}
            <div className="flex-1 w-full h-full relative select-none">
              {/* Map background grids and land simulation */}
              <svg className="absolute inset-0 w-full h-full text-[var(--border)]" xmlns="http://www.w3.org/2000/svg">
                {/* Simulated Grid Lines */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.25" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Landmass Outlines (Vector Art mock representation) */}
                <path d="M 50 100 Q 120 180 200 120 T 350 200 T 500 150 T 700 300" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.3" />
                <path d="M 10 320 Q 150 400 300 350 T 600 500 T 800 420" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.3" />
              </svg>

              {/* Pin pointers */}
              {processedSpots.map((spot) => {
                const isActive = activeSpotId === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => {
                      setActiveSpotId(spot.id);
                      // Scroll to specific item in list
                      const element = document.getElementById(spot.id);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    onMouseEnter={() => setActiveSpotId(spot.id)}
                    onMouseLeave={() => setActiveSpotId(null)}
                    style={{ top: `${spot.lat}%`, left: `${spot.lng}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group"
                  >
                    {/* Ring highlight */}
                    <div
                      className={`absolute w-8 h-8 rounded-full border transition-all duration-300 ${
                        isActive
                          ? "scale-100 border-[var(--rust)] bg-[var(--rust)]/10"
                          : "scale-50 border-transparent group-hover:scale-100 group-hover:border-[var(--text-muted)] group-hover:bg-[var(--surface)]/10"
                      }`}
                    />
                    
                    {/* Pin core */}
                    <div
                      className={`w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-[var(--rust)] scale-110"
                          : "bg-[var(--text-primary)] group-hover:bg-[var(--rust)]"
                      }`}
                    />

                    {/* Hover text label */}
                    <span
                      className={`absolute bottom-full mb-2 bg-[var(--surface)] border border-[var(--border)] text-[9px] uppercase tracking-wider font-semibold py-1 px-2 rounded-[4px] shadow-sm pointer-events-none transition-opacity duration-200 whitespace-nowrap z-30 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {spot.title}
                    </span>
                  </button>
                );
              })}

              {/* Floating controls */}
              <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1 text-[10px] text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-2.5">
                <span className="font-semibold text-[var(--text-primary)] mb-1">MAPPED REGIONS</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--rust)]" />
                  <span>Leipzig / Hamburg (GER)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--moss)]" />
                  <span>Vienna (AUT) / Chester (UK)</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile floating map toggle button */}
        <button
          onClick={() => setShowMapMobile(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-[var(--rust)] hover:bg-[#9C4830] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-[8px] flex items-center gap-1.5 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 15 9 18 3 15" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
          Map view
        </button>
      </div>
    </>
  );
}
