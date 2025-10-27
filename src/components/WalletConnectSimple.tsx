import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletConnectSimple = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const chain = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chain, 16));
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount(null);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask não encontrado! Por favor, instale o MetaMask.');
      return;
    }

    try {
      console.log('Solicitando conexão...');

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      console.log('Contas recebidas:', accounts);
      setAccount(accounts[0]);

      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(chain, 16);
      setChainId(chainIdNum);

      console.log('Chain ID:', chainIdNum);

      // Verificar se está na rede Hardhat Local (31337)
      if (chainIdNum !== 31337) {
        const switchToHardhat = confirm(
          `Você está na rede errada (Chain ID: ${chainIdNum}).\n\nDeseja trocar para Hardhat Local (31337)?`
        );

        if (switchToHardhat) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x7a69' }], // 31337 em hex
            });
          } catch (switchError: any) {
            // Rede não existe, vamos adicioná-la
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x7a69',
                    chainName: 'Hardhat Local',
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    rpcUrls: ['http://127.0.0.1:8545'],
                  }],
                });
              } catch (addError) {
                console.error('Erro ao adicionar rede:', addError);
                alert('Erro ao adicionar rede Hardhat. Adicione manualmente no MetaMask.');
              }
            } else {
              console.error('Erro ao trocar de rede:', switchError);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Erro ao conectar:', error);
      alert(`Erro ao conectar: ${error.message}`);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <div className="text-sm text-primary font-mono">
            {formatAddress(account)}
          </div>
          {chainId && (
            <div className="text-xs text-muted-foreground">
              Chain: {chainId === 31337 ? 'Hardhat Local' : chainId}
            </div>
          )}
        </div>
        <Button
          onClick={disconnectWallet}
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
    <Button
      onClick={connectWallet}
      className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
};

export default WalletConnectSimple;
