import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturedSpots from "@/components/FeaturedSpots";
import CategoryGrid from "@/components/CategoryGrid";
import Testimonials from "@/components/Testimonials";
import CommunityCTA from "@/components/CommunityCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturedSpots />
        <CategoryGrid />
        <Testimonials />
        <CommunityCTA />
      </main>
      <Footer />
    </>
  );
}
