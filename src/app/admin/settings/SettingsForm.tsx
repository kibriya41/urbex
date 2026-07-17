"use client";

import { useState } from "react";
import { updateAdminSettings } from "../actions";

interface SettingsData {
  categories: string[];
  safetyTags: string[];
  guidelines: string;
}

export default function SettingsForm({ initialSettings }: { initialSettings: SettingsData }) {
  const [categories, setCategories] = useState<string[]>(initialSettings.categories);
  const [safetyTags, setSafetyTags] = useState<string[]>(initialSettings.safetyTags);
  const [guidelines, setGuidelines] = useState(initialSettings.guidelines);

  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCategory.trim().toLowerCase();
    if (clean && !categories.includes(clean)) {
      setCategories((prev) => [...prev, clean]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTag.trim().toLowerCase();
    if (clean && !safetyTags.includes(clean)) {
      setSafetyTags((prev) => [...prev, clean]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSafetyTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError("");
    try {
      await updateAdminSettings(categories, safetyTags, guidelines);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to update configuration settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {success && (
        <div className="border border-[var(--moss)]/30 bg-[var(--moss)]/5 text-[var(--moss)] text-xs p-3 rounded-[8px] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 8 12 12 14 14" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          Settings updated successfully.
        </div>
      )}

      {error && (
        <div className="border border-[var(--rust)]/30 bg-[var(--rust)]/5 text-[var(--rust)] text-xs p-3 rounded-[8px] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Category Management */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] font-mono">
            Category Options
          </h2>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Add or remove categories used to classify urban spots.</p>
        </div>

        {/* Chips container */}
        <div className="flex flex-wrap gap-2 py-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] rounded-[6px] font-mono"
            >
              {cat}
              <button
                type="button"
                onClick={() => handleRemoveCategory(cat)}
                className="text-[var(--text-muted)] hover:text-[var(--rust)] focus:outline-none"
                aria-label={`Remove category ${cat}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        {/* Input to add */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new category..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] rounded-[8px] transition-colors focus:outline-none"
          >
            Add
          </button>
        </form>
      </div>

      {/* Safety/Risk Tag Management */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] font-mono">
            Safety & Risk Tags
          </h2>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Manage default hazard tag options (e.g. trespassing risk, patrolled area).</p>
        </div>

        {/* Chips container */}
        <div className="flex flex-wrap gap-2 py-2">
          {safetyTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] rounded-[6px] font-mono"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-[var(--text-muted)] hover:text-[var(--rust)] focus:outline-none"
                aria-label={`Remove tag ${tag}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        {/* Input to add */}
        <form onSubmit={handleAddTag} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] rounded-[8px] transition-colors focus:outline-none"
          >
            Add
          </button>
        </form>
      </div>

      {/* Guidelines Editor */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] font-mono">
            Safety & Guidelines text
          </h2>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Customize the default markdown/disclaimer notice visible on about/detail screens.</p>
        </div>

        <textarea
          rows={6}
          placeholder="Enter default guidelines notice text..."
          value={guidelines}
          onChange={(e) => setGuidelines(e.target.value)}
          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors resize-y leading-relaxed"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="self-end inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors disabled:opacity-50 focus:outline-none shadow-sm"
      >
        {saving ? "Saving Changes..." : "Save Settings"}
      </button>

    </div>
  );
}
