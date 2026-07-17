import { getReports } from "../actions";
import ReportsTable from "./ReportsTable";

export default async function AdminReportsPage() {
  const reports = await getReports();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] font-mono">Reports & Flags</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Review items flagged for safety, property ownership, or guideline violations.</p>
      </div>

      {/* Reports Table container */}
      <ReportsTable initialReports={reports} />
    </div>
  );
}
