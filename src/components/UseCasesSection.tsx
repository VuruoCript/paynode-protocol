import { Bot, FileText, Cpu } from "lucide-react";

const UseCasesSection = () => {
  const useCases = [
    {
      icon: Bot,
      title: "Autonomous AI Agents",
      description: "Pay-per-API request in real-time. No accounts or keys needed. Agents transact autonomously.",
    },
    {
      icon: FileText,
      title: "Micropayments for Content",
      description: "Unlock true micropayments for articles, datasets, and streaming. Charge per byte, per second, or per read.",
    },
    {
      icon: Cpu,
      title: "MCP/Tooling Monetization",
      description: "Charge per inference or compute run for AI models. Seamless API monetization at any scale.",
    },
  ];

  return (
    <section id="use-cases" className="py-32 relative bg-gradient-to-b from-card/30 to-background">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 neon-text">
          Powering Next-Gen Digital Commerce
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-all duration-300 animate-fade-in hover:translate-y-[-4px]"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                <useCase.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{useCase.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
