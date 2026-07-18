import Link from "next/link";

const SAFETY_TIPS = [
  {
    id: 1,
    tip: "Always tell someone your planned location and estimated return time before entering any site.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.58 4.9 2 2 0 0 1 3.54 2.72h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l1.46-1.46a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    id: 2,
    tip: "Check weather forecasts before visiting outdoor ruins or rooftop viewpoints — wet surfaces are treacherous.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
        <line x1="8" y1="16" x2="8.01" y2="16" /><line x1="8" y1="20" x2="8.01" y2="20" />
        <line x1="12" y1="18" x2="12.01" y2="18" /><line x1="12" y1="22" x2="12.01" y2="22" />
        <line x1="16" y1="16" x2="16.01" y2="16" /><line x1="16" y1="20" x2="16.01" y2="20" />
      </svg>
    ),
  },
  {
    id: 3,
    tip: "Respect trespassing laws in your country. Some sites are legal to access — check riskTags on each spot listing.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    id: 4,
    tip: "Bring a torch, dust mask, and basic first aid kit. Structural instability, asbestos, and sharp debris are common hazards.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  },
];

interface CommunityCTAProps {
  spotCount: number;
  userCount: number;
  cityCount: number;
}

export default function CommunityCTA({ spotCount, userCount, cityCount }: CommunityCTAProps) {
  return (
    <section
      className="py-20 sm:py-28 bg-[var(--background)] border-t border-[var(--border)]"
      aria-labelledby="community-cta-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left: Safety tips */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Safety first
            </p>
            <h2
              id="community-cta-heading"
              className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] leading-snug mb-8"
            >
              Explore responsibly
            </h2>

            <ul className="flex flex-col gap-5">
              {SAFETY_TIPS.map((s) => (
                <li key={s.id} className="flex gap-4 items-start">
                  <div className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] text-[var(--rust)] shrink-0 mt-0.5">
                    {s.icon}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed pt-1.5">
                    {s.tip}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Join CTA card */}
          <div className="flex flex-col gap-6 border border-[var(--border)] bg-[var(--surface)] rounded-[8px] p-8">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 border border-[var(--rust)]/30 rounded-[8px] text-[var(--rust)] bg-[var(--rust)]/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Join {userCount > 0 ? `${userCount.toLocaleString()}+` : ""} explorers cataloging the world
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Create a free account to save your wishlist, post new spots you discover, write reviews, and access the full community map.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 py-4 border-y border-[var(--border)]">
              <div className="flex flex-col items-center flex-1">
                <span className="text-xl font-semibold text-[var(--text-primary)] tabular-nums">
                  {spotCount > 0 ? spotCount.toLocaleString() : "—"}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Spots</span>
              </div>
              <div className="w-px h-8 bg-[var(--border)]" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-xl font-semibold text-[var(--text-primary)] tabular-nums">
                  {userCount > 0 ? userCount.toLocaleString() : "—"}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Explorers</span>
              </div>
              <div className="w-px h-8 bg-[var(--border)]" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-xl font-semibold text-[var(--text-primary)] tabular-nums">
                  {cityCount > 0 ? cityCount.toLocaleString() : "—"}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Cities</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                id="community-cta-register"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Create free account
              </Link>
              <Link
                href="/post"
                id="community-cta-post"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--text-muted)] hover:bg-[var(--background)] rounded-[8px] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Submit a spot
              </Link>
            </div>

            <p className="text-[10px] text-[var(--text-muted)] text-center">
              No spam. No data selling. Just exploration.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
