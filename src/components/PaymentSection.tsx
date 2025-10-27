import { useState, useEffect } from "react";
import { usePayment } from "@/hooks/usePayment";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Wallet, ArrowRight, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PaymentSection = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { processPayment, isProcessing, currentStep, error, txHash, explorerUrl, reset } = usePayment();

  useEffect(() => {
    checkWalletConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAddress(accounts[0]);
      setIsConnected(true);
    } else {
      setAddress(null);
      setIsConnected(false);
    }
  };

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const paymentPlans = [
    {
      id: "1",
      amount: "1",
      reward: "5,000",
      bonus: null,
      popular: false,
    },
    {
      id: "5",
      amount: "5",
      reward: "27,000",
      bonus: "8%",
      popular: true,
    },
    {
      id: "10",
      amount: "10",
      reward: "55,000",
      bonus: "10%",
      popular: false,
    },
  ];

  const handlePayment = async (plan: typeof paymentPlans[0]) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    setSelectedPlan(plan.id);
    reset();

    try {
      await processPayment({
        paymentAmountUSDT: plan.amount,
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Payment error:", err);
      setShowErrorModal(true);
    }
  };

  const getStepMessage = () => {
    switch (currentStep) {
      case 'fetching_config':
        return 'Loading payment configuration...';
      case 'creating_signature':
        return 'Please sign the message in your wallet...';
      case 'executing_payment':
        return 'Processing your payment...';
      case 'completed':
        return 'Payment completed successfully!';
      case 'error':
        return 'Payment failed';
      default:
        return '';
    }
  };

  return (
    <section id="buy" className="py-32 relative bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 neon-text">
          Get PND Tokens Without Gas Fees
        </h2>
        <p className="text-xl text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
          Pay with USDT and receive PND reward tokens instantly. No BNB needed for gas!
        </p>

        {/* How it works */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Connect Wallet</h3>
              <p className="text-sm text-muted-foreground">No BNB required in your wallet</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. Sign Message</h3>
              <p className="text-sm text-muted-foreground">One click, zero gas fees</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Receive Tokens</h3>
              <p className="text-sm text-muted-foreground">Instant PND rewards</p>
            </div>
          </div>
        </div>

        {/* Payment Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
          {paymentPlans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`relative p-8 border-2 transition-all duration-300 hover:scale-105 hover:border-primary/50 ${
                plan.popular ? 'border-primary bg-primary/5' : 'border-border bg-card'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2 neon-text">{plan.amount}</div>
                <div className="text-muted-foreground">USDT</div>
              </div>

              <div className="flex items-center justify-center mb-6">
                <ArrowRight className="w-6 h-6 text-primary mx-4" />
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary mb-2">{plan.reward}</div>
                <div className="text-muted-foreground">PND Tokens</div>
                {plan.bonus && (
                  <div className="mt-2">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      +{plan.bonus} Bonus
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => handlePayment(plan)}
                disabled={!isConnected || (isProcessing && selectedPlan === plan.id)}
                className={`w-full ${
                  plan.popular ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                } hover:opacity-90`}
              >
                {isProcessing && selectedPlan === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {getStepMessage()}
                  </>
                ) : (
                  <>
                    {isConnected ? 'Buy Now (No Gas!)' : 'Connect Wallet First'}
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Connected Wallet Info */}
        {isConnected && address && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
          </div>
        )}

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="bg-card border-primary/50">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <DialogTitle className="text-center text-2xl">Payment Successful!</DialogTitle>
              <DialogDescription className="text-center">
                <div className="space-y-4 mt-4">
                  <p className="text-lg">
                    Your PND tokens have been minted successfully!
                  </p>
                  {txHash && (
                    <div className="bg-background/50 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Transaction Hash:</p>
                      <p className="text-xs font-mono break-all">{txHash}</p>
                    </div>
                  )}
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      View on Explorer
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setShowSuccessModal(false)} className="w-full">
              Close
            </Button>
          </DialogContent>
        </Dialog>

        {/* Error Modal */}
        <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
          <DialogContent className="bg-card border-destructive/50">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-destructive" />
              </div>
              <DialogTitle className="text-center text-2xl">Payment Failed</DialogTitle>
              <DialogDescription className="text-center">
                <div className="space-y-4 mt-4">
                  <p className="text-lg">Something went wrong with your payment.</p>
                  {error && (
                    <div className="bg-background/50 p-4 rounded-lg">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Please try again or contact support if the problem persists.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setShowErrorModal(false)} variant="outline" className="w-full">
              Close
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default PaymentSection;
