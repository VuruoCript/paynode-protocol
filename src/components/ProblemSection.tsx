import { ArrowRight } from "lucide-react";

const ProblemSection = () => {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 neon-text">
          The Failure of Web Monetization
        </h2>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Payment Problems */}
          <div className="bg-card border border-border rounded-lg p-8 animate-fade-in">
            <h3 className="text-2xl font-semibold mb-6 text-primary">Payment Problems</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>High fees eating into margins</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>Chargebacks causing revenue loss</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>5-7 days for settlement</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>Requires KYC and bank accounts</span>
              </li>
            </ul>
          </div>

          {/* AI Problems */}
          <div className="bg-card border border-border rounded-lg p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-semibold mb-6 text-primary">AI Problems</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>AI agents can't use credit cards</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>No programmatic payment control</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>Agent economy requires real-time settlement</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>Current systems aren't built for autonomy</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-12">
          <a href="#buy" className="inline-flex items-center gap-2 text-primary hover:underline">
            Get Started with PayNode
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
