import { getUsers } from "../actions";
import UsersPanel from "./UsersPanel";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] font-mono">User Management</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Manage roles, review activity counts, and enforce community bans or suspensions.</p>
      </div>

      {/* Users Panel container */}
      <UsersPanel initialUsers={users} />
    </div>
  );
}
