const SolutionSection = () => {
  return (
    <section className="py-32 relative bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 neon-text">
          The Superior HTTP 402
        </h2>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Features */}
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold">1 Line of Code</h3>
                <p className="text-muted-foreground">Integrate payments instantly</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                0
              </div>
              <div>
                <h3 className="text-xl font-semibold">Zero Fees</h3>
                <p className="text-muted-foreground">For both client and merchant</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                2s
              </div>
              <div>
                <h3 className="text-xl font-semibold">2 Second Settlement</h3>
                <p className="text-muted-foreground">Instant finality guaranteed</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                ∞
              </div>
              <div>
                <h3 className="text-xl font-semibold">Blockchain Agnostic</h3>
                <p className="text-muted-foreground">Works across all EVM chains</p>
              </div>
            </div>
          </div>

          {/* Code Block */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="code-block animate-glow-pulse font-mono">
              <div className="text-muted-foreground mb-4">// Server-side integration</div>
              <pre className="text-sm leading-relaxed">
                <code>
                  <span className="text-foreground">app</span>
                  <span className="text-muted-foreground">.</span>
                  <span className="text-foreground">use</span>
                  <span className="text-muted-foreground">(</span>
                  {'\n  '}
                  <span className="code-highlight">paymentMiddleware</span>
                  <span className="text-muted-foreground">(</span>
                  <span className="text-yellow-400">"0xYourAddress"</span>
                  <span className="text-muted-foreground">, {'{'}</span>
                  {'\n    '}
                  <span className="text-yellow-400">"/api/data"</span>
                  <span className="text-muted-foreground">: </span>
                  <span className="text-yellow-400">"$0.01"</span>
                  {'\n  '}
                  <span className="text-muted-foreground">{'}'}</span>
                  <span className="text-muted-foreground">)</span>
                  {'\n'}
                  <span className="text-muted-foreground">);</span>
                  {'\n\n'}
                  <span className="text-muted-foreground">// That's it. Start accepting digital payments.</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
