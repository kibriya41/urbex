import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";
import AdminShell from "@/components/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  // Safety redirect — middleware handles the initial gate, this is the server-side failsafe
  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role as string | undefined;
  if (role !== "admin" && role !== "moderator") {
    redirect("/");
  }

  // Load live badge counts for sidebar
  let pendingSpotsCount = 0;
  let openReportsCount = 0;

  try {
    pendingSpotsCount = await db
      .collection("spots")
      .countDocuments({ status: "Under Review", deletedAt: null });

    openReportsCount = await db
      .collection("reports")
      .countDocuments({ status: "open" });
  } catch (err) {
    console.error("Admin layout DB error:", err);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex">
      {/* Fixed Left Sidebar */}
      <AdminSidebar
        user={{
          name: session.user.name || "Admin",
          email: session.user.email,
          image: (session.user as any).image ?? null,
          role: role!,
        }}
        pendingSpotsCount={pendingSpotsCount}
        openReportsCount={openReportsCount}
      />

      {/* Responsive main area — padding synced to sidebar collapse state */}
      <AdminShell>
        {/* Dynamic breadcrumb topbar */}
        <AdminTopbar openReportsCount={openReportsCount} />

        {/* Page content */}
        <div className="flex-1 p-6 md:p-8 bg-[var(--background)]">
          {children}
        </div>
      </AdminShell>
    </div>
  );
}
