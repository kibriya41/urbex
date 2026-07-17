"use client";

import { useState, useMemo } from "react";
import { takeReportAction } from "../actions";

interface ReportItem {
  id: string;
  type: string;
  targetId: string;
  reporterName: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
}

export default function ReportsTable({ initialReports }: { initialReports: ReportItem[] }) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleAction = async (
    reportId: string,
    actionType: "remove_content" | "warn_user" | "suspend_user" | "ban_user" | "dismiss",
    targetUserId: string | null = null,
    spotId: string | null = null
  ) => {
    if (confirm(`Are you sure you want to perform this action (${actionType})?`)) {
      setLoadingId(reportId);
      try {
        await takeReportAction(reportId, actionType, targetUserId, spotId);
        
        // Remove or update the report locally
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId
              ? { ...r, status: actionType === "dismiss" ? "dismissed" : "resolved" }
              : r
          )
        );
      } catch (err) {
        alert("Failed to complete report action.");
      } finally {
        setLoadingId(null);
      }
    }
  };

  // Extract unique reasons for the filter dropdown
  const uniqueReasons = useMemo(() => {
    const reasons = new Set(reports.map((r) => r.reason));
    return Array.from(reasons);
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchReason = reasonFilter === "all" || r.reason === reasonFilter;
      return matchStatus && matchReason;
    });
  }, [reports, statusFilter, reasonFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] px-3.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open Reports</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>

        {/* Reason Filter */}
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] px-3.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors cursor-pointer"
        >
          <option value="all">All Reasons</option>
          {uniqueReasons.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
      </div>

      {/* Reports Table container */}
      <div className="border border-[var(--border)] bg-[var(--surface)] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--text-muted)] font-mono uppercase text-[9px] tracking-wider">
                <th className="py-3 px-5 w-8"></th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Reason</th>
                <th className="py-3 px-5">Reporter</th>
                <th className="py-3 px-5">Submitted At</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                    No reports match the current filters.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const isExpanded = expandedId === report.id;
                  const isLoading = loadingId === report.id;

                  // Render status badges
                  let statusBadge = "bg-[var(--warning)]/5 border-[var(--warning)]/30 text-[var(--warning)]";
                  if (report.status === "resolved") {
                    statusBadge = "bg-[var(--moss)]/5 border-[var(--moss)]/30 text-[var(--moss)]";
                  } else if (report.status === "dismissed") {
                    statusBadge = "bg-[var(--text-muted)]/5 border-[var(--border)] text-[var(--text-muted)]";
                  }

                  return (
                    <span key={report.id} className="table-row-group">
                      {/* Base Row */}
                      <tr
                        onClick={() => toggleExpand(report.id)}
                        className="border-b border-[var(--border)] hover:bg-[var(--background)]/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-5 text-center">
                          <button
                            className="text-[var(--text-muted)] focus:outline-none"
                            aria-label={isExpanded ? "Collapse row" : "Expand row"}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </td>
                        <td className="py-3.5 px-5 font-mono uppercase text-[9px] tracking-wider text-[var(--rust)]">
                          {report.type}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-[var(--text-primary)]">
                          {report.reason}
                        </td>
                        <td className="py-3.5 px-5 text-[var(--text-muted)]">
                          {report.reporterName}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[var(--text-muted)]">
                          {new Date(report.createdAt).toLocaleDateString()}{" "}{new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border rounded-[4px] font-medium ${statusBadge}`}>
                            {report.status}
                          </span>
                        </td>
                      </tr>

                      {/* Expandable row */}
                      {isExpanded && (
                        <tr className="bg-[var(--background)] border-b border-[var(--border)]">
                          <td colSpan={6} className="p-5">
                            <div className="flex flex-col gap-4 max-w-2xl">
                              {/* Context Details */}
                              <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                                  Report Details / Context
                                </span>
                                <p className="text-xs text-[var(--text-primary)] bg-[var(--surface)] border border-[var(--border)] p-3 rounded-[8px] leading-relaxed whitespace-pre-wrap">
                                  {report.details || "No additional context or description provided."}
                                </p>
                              </div>

                              {/* Target Details */}
                              <div className="grid grid-cols-2 gap-4 text-[10px]">
                                <div>
                                  <span className="block font-bold text-[var(--text-muted)] uppercase tracking-wider">Target ID</span>
                                  <span className="font-mono mt-0.5 block text-[var(--text-primary)]">{report.targetId}</span>
                                </div>
                              </div>

                              {/* Interactive Actions (only if report is open) */}
                              {report.status === "open" && (
                                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4 mt-2">
                                  <button
                                    onClick={() => handleAction(report.id, "dismiss")}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-muted)] rounded-[6px] transition-colors focus:outline-none"
                                  >
                                    Dismiss Report
                                  </button>
                                  {report.type === "spot" && (
                                    <button
                                      onClick={() => handleAction(report.id, "remove_content", null, report.targetId)}
                                      disabled={isLoading}
                                      className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[6px] transition-colors focus:outline-none"
                                    >
                                      Remove Spot Content
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleAction(report.id, "warn_user", "temp-user-id")}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border border-[var(--warning)]/30 text-[var(--warning)] bg-[var(--warning)]/5 hover:bg-[var(--warning)] hover:text-white rounded-[6px] transition-colors focus:outline-none"
                                  >
                                    Warn Content Author
                                  </button>
                                  <button
                                    onClick={() => handleAction(report.id, "suspend_user", "temp-user-id")}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border border-[var(--rust)]/30 text-[var(--rust)] bg-[var(--rust)]/5 hover:bg-[var(--rust)] hover:text-white rounded-[6px] transition-colors focus:outline-none"
                                  >
                                    Suspend User Account
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </span>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
