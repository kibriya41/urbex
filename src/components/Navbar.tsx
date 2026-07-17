"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/post", label: "Post a spot" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = useSession();

  // Better-Auth stores custom role in additionalFields — cast to access it
  const userRole = (session?.user as any)?.role as string | undefined;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled || pathname !== "/"
          ? "bg-[var(--background)] border-b border-[var(--border)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--rust)] shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <polyline points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span className="text-[var(--text-primary)] font-semibold tracking-tight text-base leading-none">
            urbex
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors pb-0.5 ${
                  isActive
                    ? "text-[var(--rust)] border-b border-[var(--rust)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            aria-label="Search"
            className="hidden md:flex items-center justify-center w-8 h-8 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Dynamic right menu actions based on auth session */}
          {!isPending && (
            <>
              {session?.user ? (
                /* Authenticated State */
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((d) => !d)}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border)] overflow-hidden hover:border-[var(--text-primary)] transition-colors focus:outline-none"
                    aria-label="User menu"
                  >
                    {session.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="object-cover w-full h-full grayscale"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-[var(--text-primary)] uppercase">
                        {session.user.name?.charAt(0)}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-[8px] py-1.5 flex flex-col z-50">
                      <div className="px-3.5 py-2 border-b border-[var(--border)] text-xs">
                        <span className="font-semibold block text-[var(--text-primary)] truncate">
                          {session.user.name}
                        </span>
                        <span className="text-[var(--text-muted)] truncate block mt-0.5">
                          {session.user.email}
                        </span>
                      </div>
                      {/* Admin Dashboard shortcut — only for admin/moderator */}
                      {(userRole === "admin" || userRole === "moderator") && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="px-3.5 py-2 text-xs font-semibold text-[var(--rust)] hover:bg-[var(--rust)]/5 transition-colors text-left flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="px-3.5 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors text-left"
                      >
                        My wishlist
                      </Link>
                      <Link
                        href="/post"
                        onClick={() => setDropdownOpen(false)}
                        className="px-3.5 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors text-left"
                      >
                        Post a spot
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="px-3.5 py-2 text-xs text-[var(--rust)] hover:bg-[var(--background)] transition-colors text-left border-t border-[var(--border)]"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Unauthenticated State */
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 transition-colors border border-[var(--border)] rounded-[8px] hover:border-[var(--text-muted)]"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors"
                  >
                    Quick start
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden flex items-center justify-center w-8 h-8 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--background)] border-b border-[var(--border)] px-4 pb-4 pt-2 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => { setMenuOpen(false); }}
                className={`py-2.5 text-sm border-b border-[var(--border)] last:border-b-0 transition-colors ${
                  isActive
                    ? "text-[var(--rust)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {!isPending && session?.user && (
            <>
              {/* Admin dashboard — mobile, only for admin/moderator */}
              {(userRole === "admin" || userRole === "moderator") && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-sm font-semibold border-b border-[var(--border)] text-[var(--rust)] hover:text-[#9C4830] transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-sm border-b border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                My wishlist
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="py-2.5 text-sm text-[var(--rust)] text-left transition-colors"
              >
                Log out
              </button>
            </>
          )}

          {!isPending && !session?.user && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] border border-[var(--border)] rounded-[8px] hover:border-[var(--text-muted)] transition-colors"
              >
                Sign up
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors"
              >
                Quick start
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
