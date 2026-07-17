import Image from "next/image";
import Link from "next/link";

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

const FEATURED_SPOTS: Spot[] = [
  {
    id: "1",
    title: "Verlassene Textilfabrik",
    location: "Leipzig, Germany",
    category: "abandoned building",
    rating: 4.7,
    reviewCount: 38,
    image: "/spot-factory.png",
    riskTag: "trespassing risk",
  },
  {
    id: "2",
    title: "Roman wall ruins",
    location: "Chester, UK",
    category: "ruins",
    rating: 4.5,
    reviewCount: 61,
    image: "/spot-ruins.png",
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
  },
];

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

function SpotCard({ spot }: { spot: Spot }) {
  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group flex flex-col border border-[var(--border)] rounded-[8px] overflow-hidden bg-[var(--surface)] hover:border-[var(--text-muted)] transition-colors shrink-0 w-72 sm:w-auto"
    >
      {/* Photo */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={spot.image}
          alt={spot.title}
          fill
          className="object-cover grayscale group-hover:grayscale-[60%] transition-all duration-500"
          sizes="(max-width: 640px) 288px, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Risk tag badge */}
        {spot.riskTag && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] uppercase tracking-wider border border-white/20 bg-[#1C1B19]/70 text-white/70 rounded-[4px]">
            {spot.riskTag}
          </span>
        )}
        {/* Wishlist button */}
        <button
          aria-label="Add to wishlist"
          className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-[6px] border border-white/20 bg-[#1C1B19]/60 text-white/60 hover:text-white hover:border-white/40 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4">
        {/* Category tag */}
        <span
          className={`self-start px-2 py-0.5 text-[10px] uppercase tracking-wider border rounded-[4px] font-medium ${CATEGORY_COLORS[spot.category]}`}
        >
          {spot.category}
        </span>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--rust)] transition-colors">
          {spot.title}
        </h3>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
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
            <span className="text-[var(--text-primary)] font-medium">{spot.rating}</span>
            {" "}({spot.reviewCount})
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedSpots() {
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
            className="shrink-0 flex items-center gap-1.5 text-sm text-[var(--rust)] hover:text-[#9C4830] transition-colors"
          >
            View all
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* Horizontal scroll on mobile, 4-col grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
          {FEATURED_SPOTS.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      </div>
    </section>
  );
}
