const ProtocolFlowSection = () => {
  const steps = [
    {
      number: "1",
      title: "Client Request",
      description: "Agent or user requests a protected resource from the server.",
    },
    {
      number: "2",
      title: "Server Response (HTTP 402)",
      description: "Server returns 402 Payment Required with payment instructions and pricing.",
    },
    {
      number: "3",
      title: "Payment Execution",
      description: "Client sends X-PAYMENT header with signed EIP-712 payment payload.",
    },
    {
      number: "4",
      title: "Content Delivery",
      description: "Payment verified in <2s. Server delivers the requested resource.",
    },
  ];

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 neon-text">
          Protocol Flow: The x402 Handshake
        </h2>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex gap-6 items-start animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{step.number}</span>
                </div>
                <div className="flex-1 bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Connection Lines */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block" style={{ top: '180px', height: 'calc(100% - 360px)' }}>
            <div className="w-0.5 h-full bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProtocolFlowSection;
