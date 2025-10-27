import WalletConnectSimple from "@/components/WalletConnectSimple";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold neon-text">PayNode</div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#use-cases" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Use Cases
            </a>
            <a href="#ecosystem" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Ecosystem
            </a>
            <a href="#buy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Buy
            </a>
          </div>

          <WalletConnectSimple />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
