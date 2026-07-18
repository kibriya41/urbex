"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string | null;
}

interface Spot {
  id: string;
  title: string;
  location: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
  riskTag?: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

interface WeatherInfo {
  temp: number;
  windspeed: number;
  weathercode: number;
  loading: boolean;
  error: boolean;
}

export default function ProfilePage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<"settings" | "weather">("settings");

  // Editable fields
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wishlist spots for weather checks
  const [wishlistSpots, setWishlistSpots] = useState<Spot[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherInfo>>({});

  // Custom coordinates search
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");
  const [customWeather, setCustomWeather] = useState<WeatherInfo | null>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.replace("/login");
    }
  }, [session, sessionLoading, router]);

  // Load profile data
  useEffect(() => {
    if (!session?.user) return;

    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Failed to load profile");
        const data: UserProfile = await res.json();
        setProfile(data);
        setName(data.name || "");
        setImagePreview(data.image || null);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Could not load profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [session]);

  // Fetch wishlisted spots
  useEffect(() => {
    if (!session?.user || activeTab !== "weather") return;

    async function fetchWishlist() {
      setWishlistLoading(true);
      try {
        const res = await fetch("/api/wishlist?includeSpots=true");
        if (!res.ok) throw new Error("Failed to load wishlist");
        const data = await res.json();
        setWishlistSpots(data.spots || []);
      } catch (err) {
        console.error("Wishlist load error:", err);
      } finally {
        setWishlistLoading(false);
      }
    }

    fetchWishlist();
  }, [session, activeTab]);

  // Fetch weather for wishlist spots when wishlistSpots loads
  useEffect(() => {
    if (wishlistSpots.length === 0) return;

    async function fetchWeatherForSpot(spot: Spot) {
      const lat = spot.latitude;
      const lng = spot.longitude;
      if (lat === undefined || lng === undefined || lat === null || lng === null) return;

      setWeatherData((prev) => ({
        ...prev,
        [spot.id]: { temp: 0, windspeed: 0, weathercode: 0, loading: true, error: false },
      }));

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
        );
        if (!response.ok) throw new Error();
        const data = await response.json();
        const cw = data.current_weather;
        setWeatherData((prev) => ({
          ...prev,
          [spot.id]: {
            temp: cw.temperature,
            windspeed: cw.windspeed,
            weathercode: cw.weathercode,
            loading: false,
            error: false,
          },
        }));
      } catch (err) {
        setWeatherData((prev) => ({
          ...prev,
          [spot.id]: { temp: 0, windspeed: 0, weathercode: 0, loading: false, error: true },
        }));
      }
    }

    wishlistSpots.forEach((spot) => {
      if (!weatherData[spot.id]) {
        fetchWeatherForSpot(spot);
      }
    });
  }, [wishlistSpots]);

  // Handle custom weather search
  const handleCustomWeatherSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError("");
    setCustomWeather(null);

    const latNum = Number(customLat);
    const lngNum = Number(customLng);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setCustomError("Please enter a valid Latitude between -90 and 90.");
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setCustomError("Please enter a valid Longitude between -180 and 180.");
      return;
    }

    setCustomLoading(true);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latNum}&longitude=${lngNum}&current_weather=true`
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      const cw = data.current_weather;
      setCustomWeather({
        temp: cw.temperature,
        windspeed: cw.windspeed,
        weathercode: cw.weathercode,
        loading: false,
        error: false,
      });
    } catch (err) {
      setCustomError("Could not fetch weather data. Check your internet connection.");
    } finally {
      setCustomLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setImageChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageChanged(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, any> = { name: name.trim() };
      if (imageChanged) body.image = imagePreview; // null to clear, base64 to set

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }

      setSuccess(true);
      setImageChanged(false);

      // Trigger a session refresh so the navbar avatar updates
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear Sky";
    if ([1, 2, 3].includes(code)) return "Cloudy";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55].includes(code)) return "Drizzling";
    if ([61, 63, 65].includes(code)) return "Rainy";
    if ([71, 73, 75].includes(code)) return "Snowy";
    if ([80, 81, 82].includes(code)) return "Rain Showers";
    if ([95, 96, 99].includes(code)) return "Stormy";
    return "Unknown Weather";
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return "☀️";
    if ([1, 2, 3].includes(code)) return "☁️";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55].includes(code)) return "🌦️";
    if ([61, 63, 65].includes(code)) return "🌧️";
    if ([71, 73, 75].includes(code)) return "❄️";
    if ([80, 81, 82].includes(code)) return "🌧️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "🌡️";
  };

  const getSafetyAssessment = (code: number, category: string) => {
    const weather = getWeatherDescription(code);
    const cat = category.toLowerCase();

    if (["Rainy", "Stormy", "Snowy", "Rain Showers"].includes(weather)) {
      if (cat.includes("underground") || cat.includes("tunnel")) {
        return {
          level: "DANGER",
          color: "text-[var(--rust)] bg-[var(--rust)]/10 border-[var(--rust)]/30",
          advice: "HIGH RISK: Flash flooding hazard inside tunnels/underground. Do not enter.",
        };
      }
      return {
        level: "WARNING",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
        advice: "SLIPPERY: Structurally compromised rooftops/walls can fall. Wear safety gear.",
      };
    }

    if (["Foggy", "Drizzling"].includes(weather)) {
      return {
        level: "CAUTION",
        color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        advice: "LIMITED VISIBILITY: Damp surfaces and poor lighting. Proceed slowly.",
      };
    }

    return {
      level: "SAFE",
      color: "text-[var(--moss)] bg-[var(--moss)]/10 border-[var(--moss)]/30",
      advice: "RECOMMENDED: Great weather conditions. Standard safety precautions apply.",
    };
  };

  // Computed: whether any field has actually changed
  const isDirty =
    name.trim() !== (profile?.name || "") || imageChanged;

  const roleBadgeClass =
    profile?.role === "admin"
      ? "text-[var(--rust)] bg-[var(--rust)]/5 border-[var(--rust)]/30"
      : profile?.role === "moderator"
      ? "text-[var(--moss)] bg-[var(--moss)]/5 border-[var(--moss)]/30"
      : "text-[var(--text-muted)] bg-[var(--background)] border-[var(--border)]";

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16 bg-[var(--background)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-col gap-6">

          {/* Page header */}
          <div className="border-b border-[var(--border)] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                Your Profile Dashboard
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Manage your credentials and check exploring weather advisories.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] p-1 rounded-[8px] self-start md:self-auto">
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-colors ${
                  activeTab === "settings"
                    ? "bg-[var(--rust)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab("weather")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-colors ${
                  activeTab === "weather"
                    ? "bg-[var(--rust)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                ⛅ Weather Radar
              </button>
            </div>
          </div>

          {/* Loading skeleton */}
          {(sessionLoading || loading) && (
            <div className="border border-[var(--border)] bg-[var(--surface)] p-8 rounded-[8px] flex flex-col gap-6 animate-pulse">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-[var(--border)]" />
                <div className="h-3 w-28 bg-[var(--border)] rounded-[4px]" />
              </div>
            </div>
          )}

          {/* Error state */}
          {!loading && error && !profile && (
            <div className="border border-[var(--rust)]/30 bg-[var(--rust)]/5 text-[var(--rust)] text-xs p-4 rounded-[8px] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Tab Content */}
          {!loading && profile && (
            <>
              {activeTab === "settings" && (
                <form
                  onSubmit={handleSubmit}
                  className="border border-[var(--border)] bg-[var(--surface)] p-8 rounded-[8px] flex flex-col gap-6"
                >
                  {/* Avatar editor */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full border-2 border-[var(--border)] overflow-hidden bg-[var(--background)] flex items-center justify-center">
                        {imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imagePreview}
                            alt="Profile"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-3xl font-semibold text-[var(--text-muted)] uppercase select-none">
                            {name.charAt(0) || profile.email.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Camera overlay */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-[#1C1B19]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:opacity-100"
                        aria-label="Change profile picture"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        aria-label="Upload profile image"
                      />
                    </div>

                    {/* Action buttons below avatar */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[var(--rust)] hover:underline focus:outline-none"
                      >
                        Change photo
                      </button>
                      {imagePreview && (
                        <>
                          <span className="text-[var(--border)] text-xs">·</span>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--rust)] focus:outline-none"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>

                    {/* Role badge */}
                    <span className={`px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-bold border rounded-[4px] ${roleBadgeClass}`}>
                      {profile.role}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[var(--border)]" />

                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="profile-name" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Display Name
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your display name"
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
                    />
                  </div>

                  {/* Email field (read-only) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Email Address
                    </label>
                    <div className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--text-muted)] flex items-center justify-between gap-2">
                      <span>{profile.email}</span>
                      <span className="text-[9px] uppercase tracking-wider border border-[var(--border)] rounded-[4px] px-1.5 py-0.5 text-[var(--text-muted)] shrink-0">
                        Read-only
                      </span>
                    </div>
                  </div>

                  {/* Account info */}
                  {profile.createdAt && (
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Member since{" "}
                      <span className="font-semibold text-[var(--text-primary)]">
                        {new Date(profile.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  )}

                  {/* Feedback messages */}
                  {success && (
                    <div className="border border-[var(--moss)]/30 bg-[var(--moss)]/5 text-[var(--moss)] text-xs p-3 rounded-[8px] flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Profile updated successfully.
                    </div>
                  )}

                  {error && profile && (
                    <div className="border border-[var(--rust)]/30 bg-[var(--rust)]/5 text-[var(--rust)] text-xs p-3 rounded-[8px] flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Save button */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
                    <Link
                      href="/"
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      ← Back to site
                    </Link>
                    <button
                      type="submit"
                      disabled={saving || !isDirty}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[var(--rust)] hover:bg-[#9C4830] rounded-[8px] transition-colors disabled:opacity-40 focus:outline-none"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "weather" && (
                <div className="flex flex-col gap-6">
                  {/* Weather Station & Coordinates Finder */}
                  <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px]">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                      📍 Custom Coordinates Radar
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mb-4">
                      Check live meteorology forecasts for any unexplored coordinates before heading out.
                    </p>

                    <form onSubmit={handleCustomWeatherSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="custom-lat" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                          Latitude
                        </label>
                        <input
                          id="custom-lat"
                          type="text"
                          value={customLat}
                          onChange={(e) => setCustomLat(e.target.value)}
                          placeholder="e.g. 48.2082"
                          className="bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="custom-lng" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                          Longitude
                        </label>
                        <input
                          id="custom-lng"
                          type="text"
                          value={customLng}
                          onChange={(e) => setCustomLng(e.target.value)}
                          placeholder="e.g. 16.3738"
                          className="bg-[var(--background)] border border-[var(--border)] rounded-[8px] px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--rust)] transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={customLoading}
                        className="bg-[var(--rust)] hover:bg-[#9C4830] text-white font-semibold text-xs py-2.5 px-4 uppercase tracking-wider rounded-[8px] transition-colors disabled:opacity-50"
                      >
                        {customLoading ? "Checking..." : "Check Weather"}
                      </button>
                    </form>

                    {customError && (
                      <div className="mt-3 border border-[var(--rust)]/30 bg-[var(--rust)]/5 text-[var(--rust)] text-xs p-3 rounded-[8px]">
                        {customError}
                      </div>
                    )}

                    {customWeather && (
                      <div className="mt-4 p-4 bg-[var(--background)] border border-[var(--border)] rounded-[8px] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getWeatherIcon(customWeather.weathercode)}</span>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {customWeather.temp}°C
                            </p>
                            <p className="text-xs text-[var(--text-muted)] font-medium">
                              {getWeatherDescription(customWeather.weathercode)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-[var(--text-muted)]">Wind Speed</p>
                          <p className="font-semibold text-[var(--text-primary)]">{customWeather.windspeed} km/h</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Wishlisted Spots Radar */}
                  <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-[8px] flex flex-col gap-4">
                    <div>
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                        ⭐ Saved Spots Weather Radar
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Current weather status and Urbex exploration safety warnings for your saved sites.
                      </p>
                    </div>

                    {wishlistLoading && (
                      <div className="py-8 flex flex-col items-center gap-2">
                        <svg className="animate-spin text-[var(--text-muted)]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <span className="text-xs text-[var(--text-muted)]">Querying weather satellites...</span>
                      </div>
                    )}

                    {!wishlistLoading && wishlistSpots.length === 0 && (
                      <div className="py-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-[8px]">
                        No saved spots found. Wishlist locations to view their local weather status here!
                      </div>
                    )}

                    {!wishlistLoading && wishlistSpots.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {wishlistSpots.map((spot) => {
                          const weather = weatherData[spot.id];
                          const hasCoords = spot.latitude !== undefined && spot.longitude !== undefined && spot.latitude !== null && spot.longitude !== null;
                          const safety = weather && !weather.error && !weather.loading ? getSafetyAssessment(weather.weathercode, spot.category) : null;

                          return (
                            <div key={spot.id} className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[var(--rust)]/30">
                              <div className="flex items-start gap-3 max-w-sm">
                                <div className="w-12 h-12 rounded-[6px] overflow-hidden bg-[var(--surface)] shrink-0 border border-[var(--border)]">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={spot.image} alt={spot.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <Link href={`/spots/${spot.id}`} className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:text-[var(--rust)] transition-colors">
                                    {spot.title}
                                  </Link>
                                  <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">{spot.location}</p>
                                  <p className="text-[9px] uppercase font-bold text-[var(--rust)] mt-1">{spot.category}</p>
                                </div>
                              </div>

                              {/* Weather Indicator */}
                              <div className="flex items-center gap-4 self-end sm:self-auto">
                                {!hasCoords ? (
                                  <span className="text-[10px] text-[var(--text-muted)] bg-[var(--surface)] px-2 py-1 rounded">No coordinates</span>
                                ) : weather?.loading ? (
                                  <span className="text-[10px] text-[var(--text-muted)] animate-pulse">Loading...</span>
                                ) : weather?.error ? (
                                  <span className="text-[10px] text-[var(--rust)]">Offline</span>
                                ) : weather ? (
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <p className="text-xs font-bold text-[var(--text-primary)]">{weather.temp}°C</p>
                                      <p className="text-[9px] text-[var(--text-muted)] font-medium">
                                        {getWeatherIcon(weather.weathercode)} {getWeatherDescription(weather.weathercode)}
                                      </p>
                                    </div>

                                    {/* Safety Advisory Banner */}
                                    {safety && (
                                      <div className={`px-2.5 py-1 text-[9px] font-bold border rounded-[4px] uppercase tracking-wider flex flex-col items-center shrink-0 ${safety.color}`} title={safety.advice}>
                                        {safety.level}
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
