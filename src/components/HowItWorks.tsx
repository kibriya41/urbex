const STEPS = [
  {
    id: 1,
    label: "Discover a spot",
    description:
      "Browse the map or feed to find abandoned buildings, ruins, viewpoints, and hidden urban gems near you.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: 2,
    label: "Add to wishlist",
    description:
      "Bookmark spots you want to visit with a single tap. Organise your personal exploration list.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 3,
    label: "Visit and review",
    description:
      "Once you've been there, share your experience — rate the spot, write a review, and upload photos.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      className="py-20 sm:py-28 bg-[var(--background)]"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="max-w-lg mb-12">
          <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] leading-snug"
          >
            Three steps to start exploring
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[var(--border)] rounded-[8px] overflow-hidden">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className={`relative p-8 bg-[var(--surface)] flex flex-col gap-5 ${
                i < STEPS.length - 1
                  ? "border-b md:border-b-0 md:border-r border-[var(--border)]"
                  : ""
              }`}
            >
              {/* Step number */}
              <span className="absolute top-6 right-6 text-4xl font-bold text-[var(--border)] select-none tabular-nums leading-none">
                0{step.id}
              </span>

              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 border border-[var(--border)] rounded-[8px] text-[var(--rust)]">
                {step.icon}
              </div>

              {/* Label + description */}
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                  {step.label}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
