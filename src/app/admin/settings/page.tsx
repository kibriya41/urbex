import { getAdminSettings } from "../actions";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const configSettings = await getAdminSettings();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] font-mono">Console Settings</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Manage global classification categories, safety warning presets, and community policies.</p>
      </div>

      {/* Settings Form container */}
      <SettingsForm initialSettings={configSettings} />
    </div>
  );
}
