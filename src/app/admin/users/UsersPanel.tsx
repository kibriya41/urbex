"use client";

import { useState, useMemo } from "react";
import { updateUserRole, updateUserStatus } from "../actions";

interface UserItem {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  status: string;
  postCount: number;
  reportCount: number;
  createdAt: string;
}

export default function UsersPanel({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [updating, setUpdating] = useState(false);

  // Search filter
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const query = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
    );
  }, [users, search]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (confirm(`Change this user's role to ${newRole}?`)) {
      setUpdating(true);
      try {
        await updateUserRole(userId, newRole);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        if (selectedUser?.id === userId) {
          setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
        }
      } catch (err) {
        alert("Failed to update user role.");
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const isDestructive = newStatus === "suspended" || newStatus === "banned";
    const msg = isDestructive
      ? `Are you sure you want to ${newStatus.toUpperCase()} this user? They will lose catalog access.`
      : `Restore this user's status to ${newStatus}?`;

    if (confirm(msg)) {
      setUpdating(true);
      try {
        await updateUserStatus(userId, newStatus);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
        if (selectedUser?.id === userId) {
          setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } catch (err) {
        alert("Failed to update user status.");
      } finally {
        setUpdating(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Top Search bar */}
      <div className="max-w-xs relative">
        <input
          type="text"
          placeholder="Search user name, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[8px] pl-9 pr-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {/* Users table */}
      <div className="border border-[var(--border)] bg-[var(--surface)] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--text-muted)] font-mono uppercase text-[9px] tracking-wider">
                <th className="py-3 px-5">User</th>
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-center">Posts</th>
                <th className="py-3 px-5 text-center">Reports</th>
                <th className="py-3 px-5 text-right">Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  let statusBadge = "bg-[var(--moss)]/5 border-[var(--moss)]/30 text-[var(--moss)]";
                  if (u.status === "suspended") {
                    statusBadge = "bg-[var(--warning)]/5 border-[var(--warning)]/30 text-[var(--warning)]";
                  } else if (u.status === "banned") {
                    statusBadge = "bg-[var(--rust)]/5 border-[var(--rust)]/30 text-[var(--rust)]";
                  }

                  let roleBadge = "text-[var(--text-muted)] border-[var(--border)] bg-[var(--background)]";
                  if (u.role === "admin") {
                    roleBadge = "text-[var(--rust)] border-[var(--rust)]/30 bg-[var(--rust)]/5 font-semibold";
                  } else if (u.role === "moderator") {
                    roleBadge = "text-[var(--moss)] border-[var(--moss)]/30 bg-[var(--moss)]/5 font-semibold";
                  }

                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="border-b border-[var(--border)] hover:bg-[var(--background)] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-5 font-semibold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          {u.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.image}
                              alt={u.name}
                              className="w-6 h-6 rounded-full object-cover grayscale shrink-0 border border-[var(--border)]"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[8px] font-bold text-[var(--text-primary)] shrink-0">
                              {u.name.charAt(0)}
                            </div>
                          )}
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-[var(--text-muted)]">{u.email}</td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border rounded-[4px] ${roleBadge}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border rounded-[4px] font-medium ${statusBadge}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center text-[var(--text-primary)] font-mono">{u.postCount}</td>
                      <td className="py-3 px-5 text-center text-[var(--text-primary)] font-mono">{u.reportCount}</td>
                      <td className="py-3 px-5 text-right font-mono text-[var(--text-muted)]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer Backdrop */}
      {selectedUser && (
        <div
          onClick={() => setSelectedUser(null)}
          className="fixed inset-0 z-50 bg-[#1C1B19]/50 transition-opacity"
        />
      )}

      {/* Slide-over Detail Panel / Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-[var(--surface)] border-l border-[var(--border)] flex flex-col justify-between transition-transform duration-300 shadow-2xl ${
          selectedUser ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedUser ? (
          <>
            {/* Drawer Header */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] font-mono">
                User Details
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none"
                aria-label="Close panel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
              
              {/* User Identity */}
              <div className="flex items-center gap-4">
                {selectedUser.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedUser.image}
                    alt={selectedUser.name}
                    className="w-14 h-14 rounded-full object-cover grayscale border border-[var(--border)] shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-lg font-bold text-[var(--text-primary)] shrink-0">
                    {selectedUser.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="font-semibold text-sm text-[var(--text-primary)] truncate">{selectedUser.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)] truncate mt-1">{selectedUser.email}</span>
                </div>
              </div>

              {/* User statistics */}
              <div className="grid grid-cols-3 gap-2 border-y border-[var(--border)] py-4 text-center">
                <div>
                  <span className="block text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Posts</span>
                  <span className="text-sm font-semibold font-mono mt-0.5 block text-[var(--text-primary)]">{selectedUser.postCount}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Reports</span>
                  <span className="text-sm font-semibold font-mono mt-0.5 block text-[var(--text-primary)]">{selectedUser.reportCount}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Joined</span>
                  <span className="text-[10px] font-mono mt-1 block text-[var(--text-muted)]">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Role Controls */}
              <div className="flex flex-col gap-2">
                <label htmlFor="user-role-select" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Access Level / Role
                </label>
                <select
                  id="user-role-select"
                  value={selectedUser.role}
                  disabled={updating}
                  onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors cursor-pointer"
                >
                  <option value="user">User (Standard Access)</option>
                  <option value="moderator">Moderator (Moderation Queue Access)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              {/* Account Status / Moderation Controls */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Account Status Actions
                </span>
                <div className="flex flex-col gap-2">
                  {selectedUser.status !== "active" && (
                    <button
                      onClick={() => handleStatusChange(selectedUser.id, "active")}
                      disabled={updating}
                      className="w-full py-2 border border-[var(--moss)]/30 text-[var(--moss)] hover:bg-[var(--moss)]/5 font-semibold text-[10px] uppercase tracking-wider rounded-[8px] transition-colors focus:outline-none"
                    >
                      Activate User Account
                    </button>
                  )}
                  {selectedUser.status !== "suspended" && (
                    <button
                      onClick={() => handleStatusChange(selectedUser.id, "suspended")}
                      disabled={updating}
                      className="w-full py-2 border border-[var(--warning)]/30 text-[var(--warning)] hover:bg-[var(--warning)]/5 font-semibold text-[10px] uppercase tracking-wider rounded-[8px] transition-colors focus:outline-none"
                    >
                      Suspend User Account
                    </button>
                  )}
                  {selectedUser.status !== "banned" && (
                    <button
                      onClick={() => handleStatusChange(selectedUser.id, "banned")}
                      disabled={updating}
                      className="w-full py-2 text-white bg-[var(--rust)] hover:bg-[#9C4830] font-semibold text-[10px] uppercase tracking-wider rounded-[8px] transition-colors focus:outline-none"
                    >
                      Permanently Ban User
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[var(--border)] text-center text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
              Console Management
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-[var(--text-muted)]">Select a user to edit.</span>
          </div>
        )}
      </div>
    </div>
  );
}
