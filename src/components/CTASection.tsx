import { Button } from "@/components/ui/button";
import { ArrowRight, Twitter, Send } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        {/* Main CTA */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 neon-text">
            Ready to Build the Agent Economy?
          </h2>
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 gap-3"
            asChild
          >
            <a href="https://docs.mrdn.finance/" target="_blank" rel="noopener noreferrer">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-16">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://docs.mrdn.finance/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#use-cases" className="text-muted-foreground hover:text-primary transition-colors">
                    Use Cases
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Community</h3>
              <div className="flex gap-4">
                <a href="https://x.com/paynode_402?s=21" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-card border border-border hover:border-primary/50 flex items-center justify-center transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://t.me/paynode_402" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-card border border-border hover:border-primary/50 flex items-center justify-center transition-all">
                  <Send className="w-5 h-5" />
                </a>
              </div>
            </div>

          </div>

          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>© PayNode 2025 | Powered by x402</p>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default CTASection;
