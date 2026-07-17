"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "@/lib/auth-client";

type Category = "abandoned building" | "ruins" | "viewpoint" | "hidden gem" | "underground";

interface Spot {
  id: string;
  title: string;
  description: string;
  category: Category;
  address: string;
  latitude?: string | number;
  longitude?: string | number;
  riskTags: string[];
  images: string[];
  rating: number;
  reviewCount: number;
}

interface Review {
  id?: string;
  userName: string;
  userImage?: string | null;
  rating: number;
  comment: string;
  createdAt: string | Date;
}

const CATEGORY_COLORS: Record<Category, string> = {
  "abandoned building": "text-[var(--rust)] border-[var(--rust)]/30 bg-[var(--rust)]/5",
  ruins: "text-[var(--moss)] border-[var(--moss)]/30 bg-[var(--moss)]/5",
  viewpoint: "text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/5",
  "hidden gem": "text-[var(--rust)] border-[var(--rust)]/30 bg-[var(--rust)]/5",
  underground: "text-[var(--text-muted)] border-[var(--border)] bg-[var(--background)]",
};

export default function SpotDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: session } = useSession();

  const [spot, setSpot] = useState<Spot | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review Form state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/spots/${id}`);
        if (!res.ok) {
          throw new Error("failed to retrieve spot details");
        }
        const data = await res.json();
        setSpot(data.spot);
        setReviews(data.reviews || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadData();
    }
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) {
      setReviewError("Please write a comment for your review.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      const res = await fetch(`/api/spots/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: userRating,
          comment: userComment,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      const data = await res.json();
      setReviews((prev) => [data.review, ...prev]);
      setUserComment("");
      setUserRating(5);

      // Reload spot average rating
      const reloadRes = await fetch(`/api/spots/${id}`);
      if (reloadRes.ok) {
        const reloadData = await reloadRes.json();
        setSpot(reloadData.spot);
      }
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[var(--background)] pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-6 w-6 text-[var(--rust)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Loading spot details...
            </span>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !spot) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[var(--background)] pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-8 rounded-[8px] max-w-md text-center flex flex-col gap-4">
            <div className="w-10 h-10 rounded-[8px] bg-[var(--rust)]/5 text-[var(--rust)] flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Spot not found
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {error || "The location you are trying to view does not exist in our catalog."}
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors"
            >
              Back to explore
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[var(--background)] pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
          
          {/* Breadcrumbs */}
          <div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Explore all spots
            </Link>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {spot.images && spot.images.length > 0 ? (
              spot.images.map((image, i) => (
                <div key={i} className="relative aspect-video sm:aspect-square border border-[var(--border)] rounded-[8px] overflow-hidden bg-[var(--surface)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`${spot.title} image ${i + 1}`}
                    className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              ))
            ) : (
              <div className="relative aspect-video sm:aspect-square border border-dashed border-[var(--border)] rounded-[8px] bg-[var(--surface)] flex flex-col items-center justify-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)] mb-2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">No photos uploaded</span>
              </div>
            )}
          </div>

          {/* Details split section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Left/Middle: Details & Review feeds */}
            <div className="md:col-span-2 flex flex-col gap-8">
              {/* Core Information Card */}
              <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border rounded-[4px] font-medium ${CATEGORY_COLORS[spot.category]}`}>
                    {spot.category}
                  </span>
                  {spot.riskTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[9px] uppercase tracking-wider border border-[var(--border)] text-[var(--text-muted)] rounded-[4px]">
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {spot.title}
                </h1>

                <div className="border-t border-[var(--border)] pt-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Description & history
                  </h2>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                    {spot.description}
                  </p>
                </div>
              </div>

              {/* Reviews & Discussion Section */}
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                    Reviews & comments
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Read updates, warnings, and tips from explorers who have visited.
                  </p>
                </div>

                {/* Submit review form */}
                <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                    Submit visit report
                  </h3>

                  {!session && (
                    <div className="border border-[var(--warning)]/20 bg-[var(--warning)]/5 p-3 rounded-[8px] text-[10px] text-[var(--text-primary)]">
                      You are not logged in. Your review will be posted anonymously. You can{" "}
                      <Link href="/login" className="text-[var(--rust)] hover:underline font-semibold">
                        Log in
                      </Link>{" "}
                      to post under your account.
                    </div>
                  )}

                  {reviewError && (
                    <div className="border border-[var(--rust)]/30 bg-[var(--rust)]/5 text-[var(--rust)] text-xs p-3 rounded-[8px]">
                      {reviewError}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                    {/* Star selection */}
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                        Your rating *
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className="text-[var(--border)] hover:scale-110 transition-transform"
                            aria-label={`Rate ${star} stars`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill={star <= userRating ? "var(--warning)" : "none"}
                              stroke={star <= userRating ? "var(--warning)" : "currentColor"}
                              strokeWidth="1.5"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Textarea */}
                    <div>
                      <label htmlFor="comment" className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                        Your review comment *
                      </label>
                      <textarea
                        id="comment"
                        rows={3}
                        placeholder="Share your experience: access tips, hazards, security notes, or current state..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors resize-y"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="self-end inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>

                {/* Reviews List */}
                <div className="flex flex-col gap-3">
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 border border-[var(--border)] bg-[var(--surface)] rounded-[8px]">
                      <span className="text-xs text-[var(--text-muted)]">No reviews submitted yet. Be the first to verify this spot!</span>
                    </div>
                  ) : (
                    reviews.map((rev, i) => (
                      <div key={i} className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-[8px] flex flex-col gap-2">
                        {/* Header metadata row */}
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-2">
                            {rev.userImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={rev.userImage} alt={rev.userName} className="w-5 h-5 rounded-full object-cover grayscale" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-[8px] font-bold text-[var(--text-primary)]">
                                {rev.userName.charAt(0)}
                              </div>
                            )}
                            <span className="text-xs font-semibold text-[var(--text-primary)]">{rev.userName}</span>
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <svg
                              key={s}
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill={s < rev.rating ? "var(--warning)" : "none"}
                              stroke={s < rev.rating ? "var(--warning)" : "var(--border)"}
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>

                        {/* Content text */}
                        <p className="text-xs text-[var(--text-primary)] leading-normal whitespace-pre-wrap">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

            {/* Right: Coordinates & Info cards */}
            <div className="flex flex-col gap-4">
              
              {/* Bookmark Wishlist Card */}
              <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
                <button
                  onClick={() => setIsWishlisted((w) => !w)}
                  className={`w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider border rounded-[8px] flex items-center justify-center gap-2 transition-colors ${
                    isWishlisted
                      ? "bg-[var(--rust)]/5 text-[var(--rust)] border-[var(--rust)]"
                      : "bg-[var(--background)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {isWishlisted ? "Wishlisted" : "Add to wishlist"}
                </button>
              </div>

              {/* Location Card */}
              <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Location details</h3>
                  
                  {/* Address */}
                  <div className="flex gap-2 items-start mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)] shrink-0 mt-0.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-xs text-[var(--text-primary)] leading-normal">
                      {spot.address}
                    </span>
                  </div>
                </div>

                {/* GPS Coordinates grid */}
                {(spot.latitude || spot.longitude) && (
                  <div className="grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-4 text-xs">
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Latitude</span>
                      <span className="font-mono text-[var(--text-primary)] block mt-0.5">{spot.latitude || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Longitude</span>
                      <span className="font-mono text-[var(--text-primary)] block mt-0.5">{spot.longitude || "N/A"}</span>
                    </div>
                  </div>
                )}

                {/* Status indicator */}
                <div className="border-t border-[var(--border)] pt-4 flex justify-between items-center text-xs">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</span>
                  <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border rounded-[4px] text-[var(--rust)] border-[var(--rust)]/30 bg-[var(--rust)]/5">
                    Under Review
                  </span>
                </div>
              </div>

              {/* Safety notice banner */}
              <div className="border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-4 rounded-[8px] flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--warning)] shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="text-[10px] text-[var(--text-primary)] leading-normal">
                  <span className="font-semibold block mb-0.5">Urbex safety warning</span>
                  Exploration of abandoned or restricted structures involves natural hazards. Always watch for unstable elements, respect security protocols, and explore at your own risk.
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
