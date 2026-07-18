import Link from "next/link";

const CATEGORY_DEFS = [
  {
    id: "abandoned-building",
    key: "abandoned building",
    label: "Abandoned Buildings",
    description: "Forgotten factories, asylums, and decaying estates frozen in time.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    href: "/explore?category=abandoned+building",
    accentClass: "text-[var(--rust)] bg-[var(--rust)]/8 border-[var(--rust)]/20",
  },
  {
    id: "ruins",
    key: "ruins",
    label: "Ruins & Heritage",
    description: "Ancient walls, overgrown foundations, and crumbling architecture.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 22h20" />
        <path d="M6 18V7l6-5 6 5v11" />
        <path d="M10 22v-4h4v4" />
        <path d="M6 10h2" /><path d="M16 10h2" />
      </svg>
    ),
    href: "/explore?category=ruins",
    accentClass: "text-[var(--moss)] bg-[var(--moss)]/8 border-[var(--moss)]/20",
  },
  {
    id: "viewpoint",
    key: "viewpoint",
    label: "Rooftop Viewpoints",
    description: "Reach city-high vantage points for breathtaking panoramic views.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 6l11-4 11 4" />
        <path d="M1 6v14h22V6" />
        <path d="M8 20V12h8v8" />
      </svg>
    ),
    href: "/explore?category=viewpoint",
    accentClass: "text-[var(--warning)] bg-[var(--warning)]/8 border-[var(--warning)]/20",
  },
  {
    id: "underground",
    key: "underground",
    label: "Underground & Tunnels",
    description: "Storm drains, catacombs, bunkers, and hidden subterranean networks.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 4c0 2.5-5 5-5 5s-5-2.5-5-5a5 5 0 0 1 10 0z" />
      </svg>
    ),
    href: "/explore?category=underground",
    accentClass: "text-[var(--text-muted)] bg-[var(--background)] border-[var(--border)]",
  },
  {
    id: "hidden-gem",
    key: "hidden gem",
    label: "Hidden Gems",
    description: "Off-the-radar finds — secret gardens, forgotten monuments, and local curiosities.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    href: "/explore?category=hidden+gem",
    accentClass: "text-[var(--rust)] bg-[var(--rust)]/8 border-[var(--rust)]/20",
  },
];

interface CategoryGridProps {
  byCategory: Record<string, number>;
  totalSpots: number;
}

export default function CategoryGrid({ byCategory, totalSpots }: CategoryGridProps) {
  return (
    <section
      className="py-20 sm:py-28 bg-[var(--background)] border-t border-[var(--border)]"
      aria-labelledby="categories-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-lg mb-12">
          <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Explore by type
          </p>
          <h2
            id="categories-heading"
            className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] leading-snug"
          >
            What are you looking for?
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_DEFS.map((cat) => {
            const count = byCategory[cat.key] ?? 0;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="group relative flex flex-col gap-4 p-6 border border-[var(--border)] bg-[var(--surface)] rounded-[8px] hover:border-[var(--text-muted)] transition-colors overflow-hidden"
              >
                {/* Count watermark */}
                <span className="absolute top-4 right-5 text-5xl font-bold text-[var(--border)] select-none tabular-nums leading-none transition-colors group-hover:text-[var(--text-muted)]/30">
                  {count}
                </span>

                {/* Icon */}
                <div className={`flex items-center justify-center w-10 h-10 border rounded-[8px] ${cat.accentClass}`}>
                  {cat.icon}
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5 group-hover:text-[var(--rust)] transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="mt-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[var(--rust)] transition-colors">
                  Browse spots
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="translate-x-0 group-hover:translate-x-1 transition-transform">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </Link>
            );
          })}

          {/* All Spots tile */}
          <Link
            href="/explore"
            className="group flex flex-col gap-4 p-6 border border-dashed border-[var(--border)] bg-transparent rounded-[8px] hover:border-[var(--rust)]/40 hover:bg-[var(--rust)]/3 transition-colors items-center justify-center text-center"
          >
            <div className="flex items-center justify-center w-10 h-10 border border-[var(--rust)]/30 rounded-[8px] text-[var(--rust)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                See everything
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Browse all {totalSpots > 0 ? `${totalSpots.toLocaleString()}+` : ""} spots on the full map.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
