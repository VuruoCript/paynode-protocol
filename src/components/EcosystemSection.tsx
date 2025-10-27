const EcosystemSection = () => {
  const networks = [
    { name: "Base", color: "bg-blue-500" },
    { name: "XMTP", color: "bg-purple-500" },
    { name: "MCP", color: "bg-green-500" },
    { name: "Ethereum", color: "bg-indigo-500" },
    { name: "Polygon", color: "bg-violet-500" },
    { name: "Arbitrum", color: "bg-cyan-500" },
  ];

  return (
    <section id="ecosystem" className="py-32 relative bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 neon-text">
          A Protocol for Protocol Interoperability
        </h2>
        
        <p className="text-xl text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
          PayNode eliminates fragmented payment systems, providing a single, interoperable protocol that works across all agent frameworks and networks.
        </p>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {networks.map((network, index) => (
            <div
              key={index}
              className="px-8 py-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all duration-300 animate-fade-in hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${network.color}`} />
                <span className="font-semibold">{network.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-card border border-primary/30 rounded-lg p-8 max-w-2xl">
            <p className="text-lg text-muted-foreground">
              Built on EVM-compatible chains with native support for cross-chain payments, 
              enabling truly global and frictionless digital commerce.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EcosystemSection;
