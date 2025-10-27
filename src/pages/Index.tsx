import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import FrictionlessSection from "@/components/FrictionlessSection";
import PaymentSection from "@/components/PaymentSection";
import UseCasesSection from "@/components/UseCasesSection";
import ProtocolFlowSection from "@/components/ProtocolFlowSection";
import EcosystemSection from "@/components/EcosystemSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FrictionlessSection />
      <PaymentSection />
      <UseCasesSection />
      <ProtocolFlowSection />
      <EcosystemSection />
      <CTASection />
    </div>
  );
};

export default Index;
