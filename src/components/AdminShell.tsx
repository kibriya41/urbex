"use client";

import { useState, useEffect, createContext, useContext } from "react";

// Context so children can read collapsed state if needed
const SidebarContext = createContext(false);
export const useSidebarCollapsed = () => useContext(SidebarContext);

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onResize = () => setCollapsed(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <SidebarContext.Provider value={collapsed}>
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ paddingLeft: collapsed ? "72px" : "260px" }}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}
