import { createConfig, http } from 'wagmi';
import { localhost } from 'viem/chains';
import { injected } from 'wagmi/connectors';

// Use Hardhat local network for testing
const hardhatLocal = {
  ...localhost,
  id: 31337,
  name: 'Hardhat Local',
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
};

export const config = createConfig({
  chains: [hardhatLocal],
  connectors: [
    injected({ target: 'metaMask' }),
  ],
  transports: {
    [hardhatLocal.id]: http('http://127.0.0.1:8545'),
  },
});
