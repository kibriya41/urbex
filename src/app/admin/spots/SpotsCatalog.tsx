"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toggleSpotFeatured, softDeleteSpot, approveSpot, rejectSpot } from "../actions";

interface SpotItem {
  id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  rating: number;
  reviewCount: number;
  image: string;
  featured: boolean;
  status: string;
  createdAt: string;
}

export default function SpotsCatalog({ initialSpots }: { initialSpots: SpotItem[] }) {
  const [spots, setSpots] = useState<SpotItem[]>(initialSpots);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    setTogglingId(id);
    const nextFeatured = !currentFeatured;
    
    // Optimistic toggle
    setSpots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, featured: nextFeatured } : s))
    );

    try {
      await toggleSpotFeatured(id, nextFeatured);
    } catch (err) {
      alert("Failed to toggle featured status.");
      // Revert optimistic toggle
      setSpots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, featured: currentFeatured } : s))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this spot? It will be soft-deleted and hidden from explore.")) {
      setTogglingId(id);
      try {
        await softDeleteSpot(id);
        setSpots((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        alert("Failed to delete spot.");
      } finally {
        setTogglingId(null);
      }
    }
  };

  const handleUnpublish = async (id: string) => {
    if (confirm("Unpublish this spot? It will revert to 'Under Review' status.")) {
      setTogglingId(id);
      try {
        // Change status back to pending
        await rejectSpot(id, "Unpublished by moderator.");
        setSpots((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "Rejected" } : s))
        );
      } catch (err) {
        alert("Failed to unpublish spot.");
      } finally {
        setTogglingId(null);
      }
    }
  };

  // Filtered spots
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchSearch =
        !search.trim() ||
        spot.title.toLowerCase().includes(search.toLowerCase()) ||
        spot.address.toLowerCase().includes(search.toLowerCase());

      const matchCategory = categoryFilter === "all" || spot.category === categoryFilter;
      const matchStatus = statusFilter === "all" || spot.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [spots, search, categoryFilter, statusFilter]);

  // Extract unique categories
  const categories = ["abandoned building", "ruins", "viewpoint", "hidden gem", "underground"];

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="max-w-xs relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search spot title, address..."
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] px-3.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] px-3.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Under Review">Under Review</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Spots Catalog table */}
      <div className="border border-[var(--border)] bg-[var(--surface)] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--text-muted)] font-mono uppercase text-[9px] tracking-wider">
                <th className="py-3 px-5 w-10 text-center">Star</th>
                <th className="py-3 px-5">Spot</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Address</th>
                <th className="py-3 px-5 text-center">Rating</th>
                <th className="py-3 px-5 text-center">Reviews</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpots.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--text-muted)]">
                    No spots match the criteria.
                  </td>
                </tr>
              ) : (
                filteredSpots.map((spot) => {
                  const isToggling = togglingId === spot.id;

                  let statusBadge = "bg-[var(--moss)]/5 border-[var(--moss)]/30 text-[var(--moss)]";
                  if (spot.status === "Under Review") {
                    statusBadge = "bg-[var(--warning)]/5 border-[var(--warning)]/30 text-[var(--warning)]";
                  } else if (spot.status === "Rejected") {
                    statusBadge = "bg-[var(--rust)]/5 border-[var(--rust)]/30 text-[var(--rust)]";
                  }

                  return (
                    <tr
                      key={spot.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--background)] transition-colors"
                    >
                      <td className="py-3 px-5 text-center">
                        <button
                          onClick={() => handleToggleFeatured(spot.id, spot.featured)}
                          disabled={isToggling}
                          className={`focus:outline-none transition-colors ${
                            spot.featured
                              ? "text-[var(--warning)] hover:text-[var(--text-muted)]"
                              : "text-[var(--border)] hover:text-[var(--warning)]"
                          }`}
                          aria-label={spot.featured ? "Unfeature spot" : "Feature spot"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill={spot.featured ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      </td>
                      <td className="py-3 px-5 font-semibold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-[4px] border border-[var(--border)] overflow-hidden bg-[var(--background)] shrink-0">
                            {spot.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={spot.image}
                                alt={spot.title}
                                className="w-full h-full object-cover grayscale"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[6px] text-[var(--text-muted)] uppercase">
                                No Pic
                              </div>
                            )}
                          </div>
                          <span className="truncate max-w-[120px]" title={spot.title}>
                            {spot.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider border border-[var(--border)] rounded-[4px] bg-[var(--background)] text-[var(--text-muted)] font-medium">
                          {spot.category}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-[var(--text-muted)] max-w-xs truncate" title={spot.address}>
                        {spot.address}
                      </td>
                      <td className="py-3 px-5 text-center text-[var(--text-primary)] font-mono">
                        {spot.rating.toFixed(1)}
                      </td>
                      <td className="py-3 px-5 text-center text-[var(--text-primary)] font-mono">
                        {spot.reviewCount}
                      </td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border rounded-[4px] font-medium ${statusBadge}`}>
                          {spot.status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {spot.status === "Active" ? (
                            <button
                              onClick={() => handleUnpublish(spot.id)}
                              disabled={isToggling}
                              className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--background)] rounded-[6px] transition-colors focus:outline-none disabled:opacity-50"
                            >
                              Unpublish
                            </button>
                          ) : (
                            <Link
                              href={`/spots/${spot.id}`}
                              className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--background)] rounded-[6px] transition-colors"
                            >
                              View Details
                            </Link>
                          )}
                          <button
                            onClick={() => handleSoftDelete(spot.id)}
                            disabled={isToggling}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--rust)] focus:outline-none disabled:opacity-50"
                            aria-label="Soft delete spot"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
