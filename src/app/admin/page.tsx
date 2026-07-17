import { getAdminOverview } from "./actions";

// Helper function to format ISO strings to simple relative times or formats
function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default async function AdminOverviewPage() {
  const data = await getAdminOverview();

  // Statistics definitions matching cards layouts
  const statCards = [
    {
      label: "Pending Review",
      value: data.pendingSpotsCount,
      borderColor: "border-t-[var(--warning)]",
      textColor: "text-[var(--warning)]",
      bgLight: "bg-[var(--warning)]/5",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Open Reports",
      value: data.openReportsCount,
      borderColor: "border-t-[var(--rust)]",
      textColor: "text-[var(--rust)]",
      bgLight: "bg-[var(--rust)]/5",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      ),
    },
    {
      label: "Total Spots",
      value: data.totalSpotsCount,
      borderColor: "border-t-[var(--moss)]",
      textColor: "text-[var(--moss)]",
      bgLight: "bg-[var(--moss)]/5",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      label: "Total Users",
      value: data.totalUsersCount,
      borderColor: "border-t-[var(--text-primary)]",
      textColor: "text-[var(--text-primary)]",
      bgLight: "bg-[var(--text-primary)]/5",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: "Signups This Week",
      value: data.newSignupsCount,
      borderColor: "border-t-[var(--text-muted)]",
      textColor: "text-[var(--text-muted)]",
      bgLight: "bg-[var(--text-muted)]/5",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Title block */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] font-mono">Overview</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Console dashboard statistics and active logs.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`border border-[var(--border)] bg-[var(--surface)] p-4 rounded-[8px] flex flex-col justify-between gap-3 border-t-4 ${card.borderColor}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] font-medium">
                {card.label}
              </span>
              <div className={`w-6 h-6 rounded-[4px] flex items-center justify-center ${card.textColor} ${card.bgLight} shrink-0`}>
                {card.icon}
              </div>
            </div>
            <span className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] font-mono">
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="border border-[var(--border)] bg-[var(--surface)] rounded-[8px] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] font-mono">
            Recent Console Audit Logs
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--text-muted)] font-mono uppercase text-[9px] tracking-wider">
                <th className="py-3 px-5 font-semibold">Moderator</th>
                <th className="py-3 px-5 font-semibold">Action</th>
                <th className="py-3 px-5 font-semibold">Target type</th>
                <th className="py-3 px-5 font-semibold">Note</th>
                <th className="py-3 px-5 font-semibold text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                    No actions logged in the control room yet.
                  </td>
                </tr>
              ) : (
                data.recentActivity.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--background)] transition-colors"
                  >
                    <td className="py-3.5 px-5 font-semibold text-[var(--text-primary)]">
                      {log.adminName}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[var(--rust)]">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-5 uppercase text-[10px] tracking-wide text-[var(--text-muted)]">
                      {log.targetType}
                    </td>
                    <td className="py-3.5 px-5 text-[var(--text-primary)] max-w-xs truncate" title={log.note}>
                      {log.note}
                    </td>
                    <td className="py-3.5 px-5 text-[var(--text-muted)] text-right font-mono">
                      {formatRelativeTime(log.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
