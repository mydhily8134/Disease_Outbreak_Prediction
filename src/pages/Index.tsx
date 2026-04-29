import Hero from "@/components/Hero";
import StatsGrid from "@/components/StatsGrid";
import ProcessSection from "@/components/ProcessSection";
import FeatureGrid from "@/components/FeatureGrid";
import CTAFooter from "@/components/CTAFooter";

const Index = () => {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Hero />
      <StatsGrid />
      <ProcessSection />
      <FeatureGrid />
      <CTAFooter />
    </main>
  );
};

export default Index;
