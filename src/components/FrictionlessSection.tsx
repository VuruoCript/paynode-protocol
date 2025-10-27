import { ArrowRight } from "lucide-react";

const FrictionlessSection = () => {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 neon-text">
          Frictionless Payments for Agents and Humans
        </h2>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Features */}
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-2xl">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">No Accounts Required</h3>
                <p className="text-muted-foreground">Zero registration friction</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-2xl">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">No KYC/Registration</h3>
                <p className="text-muted-foreground">Instant onboarding for all</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-2xl">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Programmatic Control</h3>
                <p className="text-muted-foreground">Code-driven payment logic</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-2xl">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Secure via EIP-712</h3>
                <p className="text-muted-foreground">Robust cryptographic signatures</p>
              </div>
            </div>
          </div>

          {/* Code Block */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="code-block animate-glow-pulse font-mono">
              <div className="text-muted-foreground mb-4">// Agent/Client integration</div>
              <pre className="text-sm leading-relaxed">
                <code>
                  <span className="text-purple-400">const</span>
                  {' '}
                  <span className="text-foreground">result</span>
                  {' = '}
                  <span className="text-purple-400">await</span>
                  {' '}
                  <span className="text-foreground">agent</span>
                  <span className="text-muted-foreground">.</span>
                  <span className="code-highlight">fetchWithPay</span>
                  <span className="text-muted-foreground">(</span>
                  {'\n  '}
                  <span className="text-yellow-400">"https://api.paid.service/data"</span>
                  <span className="text-muted-foreground">,</span>
                  {'\n  '}
                  <span className="text-muted-foreground">{'{'}</span>
                  {'\n    '}
                  <span className="text-foreground">token</span>
                  <span className="text-muted-foreground">: </span>
                  <span className="text-yellow-400">'USDC'</span>
                  {'\n  '}
                  <span className="text-muted-foreground">{'}'}</span>
                  {'\n'}
                  <span className="text-muted-foreground">);</span>
                </code>
              </pre>
            </div>

            <div className="mt-6 text-center">
              <a href="#buy" className="inline-flex items-center gap-2 text-primary hover:underline">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrictionlessSection;
