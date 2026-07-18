const TESTIMONIALS = [
  {
    id: 1,
    quote:
      "Found an 1890s textile mill nobody had documented for decades. The light shafts through the collapsed roof were unlike anything I've ever photographed.",
    name: "Maren H.",
    role: "Urban photographer · Berlin",
    initial: "M",
    spotType: "Abandoned Building",
  },
  {
    id: 2,
    quote:
      "Urbex helped me plan a weekend trip around three Roman sites within 40 km of each other. The community safety notes were genuinely lifesaving.",
    name: "Tom R.",
    role: "History enthusiast · Chester",
    initial: "T",
    spotType: "Ruins",
  },
  {
    id: 3,
    quote:
      "I've been exploring rooftops for five years. This is the first platform where the community actually cares about access rights and responsible exploration.",
    name: "Selin A.",
    role: "Urbex veteran · Vienna",
    initial: "S",
    spotType: "Viewpoint",
  },
];

export default function Testimonials() {
  return (
    <section
      className="py-20 sm:py-28 bg-[var(--surface)] border-t border-[var(--border)]"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-lg mb-12">
          <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Explorer voices
          </p>
          <h2
            id="testimonials-heading"
            className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] leading-snug"
          >
            Stories from the community
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-5 p-6 border border-[var(--border)] bg-[var(--background)] rounded-[8px]"
            >
              {/* Opening quote mark */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-[var(--rust)]/30 shrink-0"
                aria-hidden="true"
              >
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
              </svg>

              {/* Quote */}
              <blockquote className="text-sm text-[var(--text-primary)] leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--rust)]/10 border border-[var(--rust)]/20 text-[var(--rust)] text-xs font-bold uppercase select-none">
                  {t.initial}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{t.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{t.role}</p>
                </div>
                <span className="ml-auto text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 border border-[var(--border)] rounded-[4px] text-[var(--text-muted)] shrink-0">
                  {t.spotType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
