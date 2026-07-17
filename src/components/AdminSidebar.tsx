"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role: string;
  };
  pendingSpotsCount: number;
  openReportsCount: number;
}

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Overview",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/admin/moderation",
    label: "Moderation Queue",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    countKey: "moderation" as const,
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
    countKey: "reports" as const,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/spots",
    label: "Spots",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({
  user,
  pendingSpotsCount,
  openReportsCount,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#1C1B19] border-r border-[#3A3730] flex flex-col justify-between transition-all duration-300 text-white ${
        isCollapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Top Brand Area */}
      <div className="flex flex-col">
        <div className="h-16 px-4 flex items-center gap-3 border-b border-[#3A3730]">
          <div className="w-8 h-8 rounded-[8px] bg-[var(--rust)] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight text-[#EDEAE3]">Urbex Control</span>
              <span className="text-[9px] uppercase tracking-wider text-[var(--rust)] font-bold mt-0.5">Control Room</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 p-3 mt-4" aria-label="Admin Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            const count = item.countKey === "moderation" ? pendingSpotsCount : item.countKey === "reports" ? openReportsCount : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[8px] transition-all group ${
                  isActive
                    ? "bg-[var(--rust)]/10 text-[var(--rust)] border-l-2 border-[var(--rust)] font-semibold"
                    : "text-[#726C60] hover:text-[#EDEAE3] hover:bg-[#26241F]"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className={`shrink-0 ${isActive ? "text-[var(--rust)]" : "text-inherit"}`}>
                  {item.icon}
                </div>
                
                {!isCollapsed && (
                  <span className="text-xs tracking-wide flex-1">{item.label}</span>
                )}

                {count > 0 && !isCollapsed && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-[4px] bg-[var(--rust)] text-white">
                    {count}
                  </span>
                )}
                {count > 0 && isCollapsed && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--rust)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area (Profile + Collapse Toggle) */}
      <div className="flex flex-col border-t border-[#3A3730]">
        
        {/* User Card */}
        <div className="p-3 flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover grayscale shrink-0 border border-[#3A3730]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#26241F] border border-[#3A3730] flex items-center justify-center text-[10px] uppercase font-bold text-[#EDEAE3] shrink-0">
                {user.name.charAt(0)}
              </div>
            )}
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden leading-tight">
                <span className="text-xs font-semibold text-[#EDEAE3] truncate">{user.name}</span>
                <span className={`self-start text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-[4px] mt-1 ${
                  user.role === "admin"
                    ? "text-[var(--rust)] bg-[var(--rust)]/10"
                    : "text-[var(--moss)] bg-[var(--moss)]/10"
                }`}>
                  {user.role}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-[6px] text-[#726C60] hover:text-[var(--rust)] hover:bg-[#26241F] transition-colors"
              title="Logout from Admin"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>

        {/* Collapse Sidebar Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-10 border-t border-[#3A3730] hover:bg-[#26241F] transition-colors flex items-center justify-center text-[#726C60] hover:text-[#EDEAE3] focus:outline-none"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
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
            className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          >
            <polyline points="11 17 6 12 11 7" />
            <polyline points="18 17 13 12 18 7" />
          </svg>
        </button>

      </div>
    </aside>
  );
}
