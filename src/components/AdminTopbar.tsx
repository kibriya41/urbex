"use client";

import { usePathname } from "next/navigation";

const PAGE_MAP: Record<string, { title: string; crumb: string }> = {
  "/admin": { title: "Overview", crumb: "Overview" },
  "/admin/moderation": { title: "Moderation Queue", crumb: "Moderation" },
  "/admin/reports": { title: "Reports & Flags", crumb: "Reports" },
  "/admin/users": { title: "User Management", crumb: "Users" },
  "/admin/spots": { title: "Cataloged Spots", crumb: "Spots" },
  "/admin/settings": { title: "Console Settings", crumb: "Settings" },
};

export default function AdminTopbar({
  openReportsCount,
}: {
  openReportsCount: number;
}) {
  const pathname = usePathname();
  const page = PAGE_MAP[pathname] ?? { title: "Console", crumb: pathname.split("/").pop() ?? "" };

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] shrink-0">
          Control Room
        </span>
        <span className="text-[var(--border)] shrink-0">/</span>
        <span className="text-xs font-semibold text-[var(--text-primary)] font-mono truncate">
          {page.crumb}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Search */}
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search console..."
            className="bg-[var(--background)] border border-[var(--border)] rounded-[6px] px-3.5 py-1.5 pl-8 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors w-44"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="p-2 rounded-[6px] hover:bg-[var(--background)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
            aria-label="View notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {openReportsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--rust)] border border-[var(--surface)]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
