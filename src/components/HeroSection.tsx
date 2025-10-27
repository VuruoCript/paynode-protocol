const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/video-bg.mp4" type="video/mp4" />
      </video>
      
      {/* Color Overlay - aplica a paleta do site */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-primary/10 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-primary/5 mix-blend-overlay pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 text-center relative z-10 animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 neon-text leading-tight">
          x402 payment rails<br />for the agent economy
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto px-4">
          Instant, autonomous, and protocol-native payments.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <a
            href="#buy"
            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 text-center"
          >
            Buy PND Tokens
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
