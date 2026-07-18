import Image from "next/image";
import Link from "next/link";

interface HeroStats {
  spotCount: number;
  userCount: number;
  cityCount: number;
}

export default function HeroSection({ stats }: { stats: HeroStats }) {
  const { spotCount, userCount, cityCount } = stats;

  return (
    <section
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/hero.png"
          alt="Abandoned building interior with shafts of light through broken windows"
          fill
          priority
          className="object-cover object-center grayscale brightness-50"
          sizes="100vw"
        />
        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-[#1C1B19]/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6 pt-14">
        {/* Eyebrow label */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs tracking-widest uppercase border border-white/20 text-white/60 rounded-[8px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <polyline points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          Urban exploration catalog
        </span>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-white">
          Find hidden places{" "}
          <br className="hidden sm:block" />
          <span className="text-[var(--rust)]">nearby</span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-white/70 max-w-xl leading-relaxed">
          A crowd-sourced catalog of abandoned buildings, forgotten ruins,
          rooftop viewpoints, and hidden urban gems — discovered and documented
          by explorers like you.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <Link
            href="/explore"
            id="hero-explore-cta"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            Explore the map
          </Link>
          <Link
            href="/post"
            id="hero-post-cta"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white border border-white/30 hover:border-white/60 hover:bg-white/5 rounded-[8px] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Post a spot
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mt-8 flex items-center gap-6 text-white/50 text-xs tracking-wide divide-x divide-white/20">
          <div className="text-center pr-6">
            <span className="block text-xl font-semibold text-white/80 tabular-nums">
              {spotCount.toLocaleString()}
            </span>
            spots cataloged
          </div>
          <div className="text-center px-6">
            <span className="block text-xl font-semibold text-white/80 tabular-nums">
              {userCount.toLocaleString()}
            </span>
            explorers
          </div>
          <div className="text-center pl-6">
            <span className="block text-xl font-semibold text-white/80 tabular-nums">
              {cityCount.toLocaleString()}
            </span>
            cities
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 inset-x-0 flex justify-center z-10">
        <div className="flex flex-col items-center gap-1 text-white/30 text-xs animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
          <span>scroll</span>
        </div>
      </div>
    </section>
  );
}
