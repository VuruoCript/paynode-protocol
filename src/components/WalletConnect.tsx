import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async () => {
    try {
      console.log('Available connectors:', connectors);

      // Tenta encontrar o conector injetado (MetaMask)
      const injectedConnector = connectors.find(
        c => c.type === 'injected' || c.name.toLowerCase().includes('injected') || c.name.toLowerCase().includes('metamask')
      );

      console.log('Selected connector:', injectedConnector);

      if (injectedConnector) {
        await connect({ connector: injectedConnector });
      } else if (connectors[0]) {
        // Se não encontrar, usa o primeiro disponível
        console.log('Using first available connector:', connectors[0]);
        await connect({ connector: connectors[0] });
      } else {
        alert('Nenhuma carteira encontrada. Por favor, instale o MetaMask.');
      }
    } catch (err) {
      console.error('Erro ao conectar:', err);
      alert('Erro ao conectar a carteira. Veja o console para detalhes.');
    }
  };

  if (!isClient) {
    return null;
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden md:block text-sm text-primary font-mono">
          {formatAddress(address)}
        </div>
        <Button
          onClick={() => disconnect()}
          variant="outline"
          className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
          size="sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        onClick={handleConnect}
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
      {error && (
        <p className="text-xs text-destructive mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default WalletConnect;
