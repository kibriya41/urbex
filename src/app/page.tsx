import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturedSpots from "@/components/FeaturedSpots";
import CategoryGrid from "@/components/CategoryGrid";
import Testimonials from "@/components/Testimonials";
import CommunityCTA from "@/components/CommunityCTA";
import Footer from "@/components/Footer";

interface SiteStats {
  spotCount: number;
  userCount: number;
  cityCount: number;
  byCategory: Record<string, number>;
}

async function getSiteStats(): Promise<SiteStats> {
  try {
    // Use absolute URL for server-side fetch in Next.js App Router
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/stats`, {
      // Revalidate every 60 seconds so the home page stats stay fresh
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("stats fetch failed");
    return await res.json();
  } catch {
    return { spotCount: 0, userCount: 0, cityCount: 0, byCategory: {} };
  }
}

export default async function Home() {
  const stats = await getSiteStats();

  return (
    <>
      <Navbar />
      <main>
        <HeroSection
          stats={{
            spotCount: stats.spotCount,
            userCount: stats.userCount,
            cityCount: stats.cityCount,
          }}
        />
        <HowItWorks />
        <FeaturedSpots />
        <CategoryGrid byCategory={stats.byCategory} totalSpots={stats.spotCount} />
        <Testimonials />
        <CommunityCTA
          spotCount={stats.spotCount}
          userCount={stats.userCount}
          cityCount={stats.cityCount}
        />
      </main>
      <Footer />
    </>
  );
}
