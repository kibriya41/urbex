"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Category = "abandoned building" | "ruins" | "viewpoint" | "hidden gem";

interface FormState {
  title: string;
  description: string;
  category: Category | "";
  address: string;
  latitude: string;
  longitude: string;
  riskTags: string[];
  photos: File[];
}

export default function PostSpotPage() {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "",
    address: "",
    latitude: "",
    longitude: "",
    riskTags: [],
    photos: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories: Category[] = [
    "abandoned building",
    "ruins",
    "viewpoint",
    "hidden gem",
  ];

  const availableRiskTags = [
    "trespassing risk",
    "permission needed",
    "safe access",
    "unstable structure",
    "patrolled area",
  ];

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCategorySelect = (category: Category) => {
    setForm((prev) => ({ ...prev, category }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
  };

  const handleRiskTagToggle = (tag: string) => {
    setForm((prev) => {
      const isSelected = prev.riskTags.includes(tag);
      const updatedTags = isSelected
        ? prev.riskTags.filter((t) => t !== tag)
        : [...prev.riskTags, tag];
      return { ...prev, riskTags: updatedTags };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setForm((prev) => ({ ...prev, photos: [...prev.photos, ...newFiles] }));
    }
  };

  const removePhoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) newErrors.title = "title is required";
    if (!form.description.trim()) newErrors.description = "description is required";
    if (!form.category) newErrors.category = "please select a category";
    if (!form.address.trim()) newErrors.address = "address is required";

    if (form.latitude && isNaN(Number(form.latitude))) {
      newErrors.latitude = "must be a valid number";
    }
    if (form.longitude && isNaN(Number(form.longitude))) {
      newErrors.longitude = "must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Convert all photos to Base64 strings concurrently
      const base64Images = await Promise.all(
        form.photos.map((photo) => fileToBase64(photo))
      );

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        address: form.address,
        latitude: form.latitude || null,
        longitude: form.longitude || null,
        riskTags: form.riskTags,
        images: base64Images,
      };

      const res = await fetch("/api/spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "failed to submit spot");
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrors((prev) => ({ ...prev, title: err.message || "failed to submit spot" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      address: "",
      latitude: "",
      longitude: "",
      riskTags: [],
      photos: [],
    });
    setSuccess(false);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[var(--background)] pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-3 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to exploration
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              Catalog a new spot
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1.5">
              Contribute to the crowd-sourced log. Under-review spots are visible to moderators first.
            </p>
          </div>

          {success ? (
            /* Success State */
            <div className="border border-[var(--border)] bg-[var(--surface)] p-8 rounded-[8px] text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-[8px] border border-[var(--moss)] bg-[var(--moss)]/5 flex items-center justify-center text-[var(--moss)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Spot submitted successfully
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
                  Thank you for contributing. The spot has been added as \"Under Review\" and will be verified by the community soon.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium border border-[var(--border)] hover:border-[var(--text-muted)] rounded-[8px] transition-colors bg-[var(--surface)]"
                >
                  Post another spot
                </button>
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors"
                >
                  Return home
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Privacy/Sensitivity Disclaimer */}
              <div className="border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-4 rounded-[8px] flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--warning)] shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="text-xs text-[var(--text-primary)]">
                  <span className="font-semibold block mb-0.5">Location privacy note</span>
                  For extremely sensitive, pristine, or hazardous locations, consider keeping details descriptive rather than sharing precise GPS coordinates to prevent vandalism or accidents.
                </div>
              </div>

              {/* Title & Description card */}
              <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
                <div>
                  <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Spot title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="e.g. Abandoned textile factory"
                    value={form.title}
                    onChange={handleTextChange}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
                  />
                  {errors.title && (
                    <span className="text-xs text-[var(--rust)] mt-1 block">{errors.title}</span>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Description & context *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Describe the spot's layout, history, current condition, and details on how to safely access it."
                    value={form.description}
                    onChange={handleTextChange}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors resize-y"
                  />
                  {errors.description && (
                    <span className="text-xs text-[var(--rust)] mt-1 block">{errors.description}</span>
                  )}
                </div>
              </div>

              {/* Category selector */}
              <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = form.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategorySelect(cat)}
                        className={`py-2.5 px-3 text-xs font-medium uppercase tracking-wider border rounded-[8px] transition-colors text-center ${
                          isSelected
                            ? "bg-[var(--rust)]/5 text-[var(--rust)] border-[var(--rust)]"
                            : "bg-[var(--background)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                {errors.category && (
                  <span className="text-xs text-[var(--rust)] mt-2 block">{errors.category}</span>
                )}
              </div>

              {/* Location Card */}
              <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
                <div>
                  <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Address / landmark locator *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="e.g. Leipzig Industrial District, Germany"
                      value={form.address}
                      onChange={handleTextChange}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] pl-9 pr-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  {errors.address && (
                    <span className="text-xs text-[var(--rust)] mt-1 block">{errors.address}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="latitude" className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Latitude (optional)
                    </label>
                    <input
                      type="text"
                      id="latitude"
                      name="latitude"
                      placeholder="e.g. 51.3396"
                      value={form.latitude}
                      onChange={handleTextChange}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
                    />
                    {errors.latitude && (
                      <span className="text-[10px] text-[var(--rust)] mt-0.5 block">{errors.latitude}</span>
                    )}
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Longitude (optional)
                    </label>
                    <input
                      type="text"
                      id="longitude"
                      name="longitude"
                      placeholder="e.g. 12.3731"
                      value={form.longitude}
                      onChange={handleTextChange}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
                    />
                    {errors.longitude && (
                      <span className="text-[10px] text-[var(--rust)] mt-0.5 block">{errors.longitude}</span>
                    )}
                  </div>
                </div>

                {/* Simulated Map Visual Box */}
                <div className="border border-[var(--border)] bg-[var(--background)] h-32 rounded-[8px] overflow-hidden flex flex-col items-center justify-center relative select-none">
                  {/* Subtle map pattern simulation using simple grid */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2A2823_1px,transparent_1px)] [background-size:16px_16px]" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[var(--text-muted)] z-10 animate-pulse"
                  >
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 15 9 18 3 15" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                  <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-2 font-medium z-10">
                    Location pin placement preview
                  </span>
                </div>
              </div>

              {/* Photos Card */}
              <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Upload photos (optional)
                  </label>
                  <div className="border border-dashed border-[var(--border)] hover:border-[var(--text-muted)] rounded-[8px] bg-[var(--background)] transition-colors relative flex flex-col items-center justify-center py-6 px-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--text-muted)] mb-2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      Click to choose or drag images here
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] mt-1">
                      Max file size 5MB. Supports JPG, PNG, WEBP.
                    </span>
                  </div>
                </div>

                {/* Previews container */}
                {form.photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {form.photos.map((photo, i) => {
                      const url = URL.createObjectURL(photo);
                      return (
                        <div
                          key={i}
                          className="relative aspect-square border border-[var(--border)] rounded-[6px] overflow-hidden bg-[var(--background)] group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt="preview"
                            className="object-cover w-full h-full grayscale"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 bg-[#1C1B19]/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Risk/Accessibility Tags Card */}
              <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Accessibility & risk notes (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableRiskTags.map((tag) => {
                    const isSelected = form.riskTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleRiskTagToggle(tag)}
                        className={`px-3 py-1.5 text-xs border rounded-[8px] font-medium transition-colors ${
                          isSelected
                            ? "bg-[var(--rust)]/5 text-[var(--rust)] border-[var(--rust)]"
                            : "bg-[var(--background)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/"
                  className="px-5 py-2.5 text-sm font-medium border border-[var(--border)] hover:border-[var(--text-muted)] rounded-[8px] transition-colors bg-[var(--surface)] text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors min-w-[120px] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-1 h-4.5 w-4.5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Post spot"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
