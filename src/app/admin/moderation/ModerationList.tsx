"use client";

import { useState } from "react";
import { approveSpot, rejectSpot, bulkApproveSpots, bulkRejectSpots } from "../actions";

interface SpotPending {
  id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  riskTags: string[];
  images: string[];
  createdAt: string;
}

export default function ModerationList({ initialSpots }: { initialSpots: SpotPending[] }) {
  const [spots, setSpots] = useState<SpotPending[]>(initialSpots);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Rejection Reason Modal States
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  // Bulk Rejection Reason States
  const [isBulkRejecting, setIsBulkRejecting] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(spots.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      await approveSpot(id);
      setSpots((prev) => prev.filter((s) => s.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      alert("Failed to approve spot.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectionReason("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId || !rejectionReason.trim()) return;
    setSubmittingReject(true);
    try {
      await rejectSpot(rejectingId, rejectionReason);
      setSpots((prev) => prev.filter((s) => s.id !== rejectingId));
      setSelectedIds((prev) => prev.filter((item) => item !== rejectingId));
      setRejectingId(null);
    } catch (err) {
      alert("Failed to reject spot.");
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setLoadingId("bulk");
    try {
      await bulkApproveSpots(selectedIds);
      setSpots((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    } catch (err) {
      alert("Failed bulk approval.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkRejectSubmit = async () => {
    if (selectedIds.length === 0 || !rejectionReason.trim()) return;
    setSubmittingReject(true);
    try {
      await bulkRejectSpots(selectedIds, rejectionReason);
      setSpots((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      setIsBulkRejecting(false);
    } catch (err) {
      alert("Failed bulk rejection.");
    } finally {
      setSubmittingReject(false);
    }
  };

  const allSelected = spots.length > 0 && selectedIds.length === spots.length;

  return (
    <div className="flex flex-col gap-6 relative pb-20">
      
      {/* Moderation table */}
      <div className="border border-[var(--border)] bg-[var(--surface)] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--text-muted)] font-mono uppercase text-[9px] tracking-wider">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="cursor-pointer"
                    aria-label="Select all spots"
                  />
                </th>
                <th className="py-3 px-4">Thumbnail</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {spots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                    No spots pending review. The moderation queue is clean!
                  </td>
                </tr>
              ) : (
                spots.map((spot) => {
                  const isSelected = selectedIds.includes(spot.id);
                  const isPending = loadingId === spot.id;
                  return (
                    <tr
                      key={spot.id}
                      className={`border-b border-[var(--border)] hover:bg-[var(--background)]/40 transition-colors ${
                        isSelected ? "bg-[var(--rust)]/5" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(spot.id, e.target.checked)}
                          className="cursor-pointer"
                          aria-label={`Select ${spot.title}`}
                        />
                      </td>
                      <td className="py-3 px-4 shrink-0">
                        <div className="w-16 h-10 rounded-[4px] border border-[var(--border)] overflow-hidden bg-[var(--background)]">
                          {spot.images && spot.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={spot.images[0]}
                              alt={spot.title}
                              className="w-full h-full object-cover grayscale"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-[var(--text-muted)] uppercase">
                              No Pic
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        {spot.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider border border-[var(--border)] rounded-[4px] bg-[var(--background)] text-[var(--text-muted)] font-medium">
                          {spot.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-muted)] max-w-xs truncate">
                        {spot.address}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {spot.riskTags.map((tag) => (
                            <span key={tag} className="px-1 text-[8px] border border-[var(--rust)]/10 text-[var(--rust)] rounded-[4px] bg-[var(--rust)]/5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(spot.id)}
                            disabled={isPending || loadingId === "bulk"}
                            className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border border-[var(--moss)]/30 text-[var(--moss)] bg-[var(--moss)]/5 hover:bg-[var(--moss)]/10 rounded-[6px] transition-colors focus:outline-none disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(spot.id)}
                            disabled={isPending || loadingId === "bulk"}
                            className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border border-[var(--rust)]/30 text-[var(--rust)] bg-[var(--rust)]/5 hover:bg-[var(--rust)] hover:text-white rounded-[6px] transition-all focus:outline-none disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%+130px)] z-40 bg-[#1C1B19] border border-[#3A3730] text-white py-3 px-6 rounded-[8px] flex items-center gap-6 animate-slide-up shadow-lg">
          <span className="text-xs font-mono text-[#EDEAE3]">
            {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              disabled={loadingId === "bulk"}
              className="px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--moss)] hover:bg-[#4C6842] rounded-[6px] transition-colors focus:outline-none disabled:opacity-50"
            >
              Bulk Approve
            </button>
            <button
              onClick={() => {
                setIsBulkRejecting(true);
                setRejectionReason("");
              }}
              disabled={loadingId === "bulk"}
              className="px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--rust)] hover:bg-[#9C4830] rounded-[6px] transition-colors focus:outline-none disabled:opacity-50"
            >
              Bulk Reject
            </button>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal (Individual) */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-[#1C1B19]/70 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] w-full max-w-md p-6 flex flex-col gap-4 shadow-xl">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] font-mono">
              Rejection Reason
            </h3>
            <div>
              <label htmlFor="individual-reason" className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Please specify why this spot is being rejected:
              </label>
              <textarea
                id="individual-reason"
                rows={3}
                placeholder="Vandalism risk, duplicates, private property details, unsafe details, etc..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setRejectingId(null)}
                disabled={submittingReject}
                className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--background)] rounded-[6px] transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={submittingReject || !rejectionReason.trim()}
                className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[6px] transition-colors focus:outline-none disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Rejection Reason Modal */}
      {isBulkRejecting && (
        <div className="fixed inset-0 z-50 bg-[#1C1B19]/70 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] w-full max-w-md p-6 flex flex-col gap-4 shadow-xl">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] font-mono">
              Bulk Rejection Reason ({selectedIds.length} items)
            </h3>
            <div>
              <label htmlFor="bulk-reason" className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Specify bulk rejection explanation:
              </label>
              <textarea
                id="bulk-reason"
                rows={3}
                placeholder="Multiple listings violation, generic photos, incorrect formatting, etc..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsBulkRejecting(false)}
                disabled={submittingReject}
                className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--background)] rounded-[6px] transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkRejectSubmit}
                disabled={submittingReject || !rejectionReason.trim()}
                className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[6px] transition-colors focus:outline-none disabled:opacity-50"
              >
                Reject All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
