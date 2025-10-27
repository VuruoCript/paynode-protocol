# PayNode - Gasless Payment Protocol

Sistema de pagamentos sem gas fees usando EIP-2612 Permit na BSC.

## 🎯 O que é PayNode?

PayNode permite que usuários paguem com USDT e recebam tokens PND (PayNode) **sem gastar BNB com gas**. O sistema usa assinaturas EIP-2612 para aprovação gasless.

## ✨ Características

- ✅ **Zero Gas Fees** - Usuários não precisam BNB
- ✅ **EIP-2612 Permit** - Aprovação via assinatura
- ✅ **BSC Mainnet** - Baixo custo operacional
- ✅ **Backend Relayer** - Executa transações automaticamente
- ✅ **React + TypeScript** - Frontend moderno
- ✅ **Hardhat + OpenZeppelin** - Smart contracts auditados

## 🏗️ Arquitetura

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend    │─────▶│ BSC Network │
│  (React)    │      │  (Relayer)   │      │  (Contracts)│
└─────────────┘      └──────────────┘      └─────────────┘
     │                      │                      │
     │ 1. Sign Permit       │                      │
     └─────────────────────▶│                      │
                            │ 2. Execute TX        │
                            └─────────────────────▶│
                                                   │ 3. Mint PND
                                                   └────────────
```

## 📦 Componentes

### Smart Contracts

- **PayNode.sol** - Token ERC20 com Permit (símbolo: PND)
- **X402Facilitator.sol** - Processa pagamentos gasless
- **MockUSDT.sol** - USDT de teste (apenas local)

### Backend

- Express.js API
- Relayer Service (executa transações)
- Validação de assinaturas Permit
- Health checks e monitoring

### Frontend

- React + TypeScript + Vite
- Wagmi + ethers.js v6
- Shadcn/ui components
- MetaMask integration

## 🚀 Deploy

### Desenvolvimento Local

```bash
# 1. Contratos
cd contracts
npm install
npx hardhat node
npx hardhat run scripts/deploy-with-usdt.js --network localhost

# 2. Backend
cd backend
npm install
npm run dev

# 3. Frontend
npm install
npm run dev
```

### Produção (BSC + Render)

Veja os guias detalhados:
- **`DEPLOY_GUIDE.md`** - Guia completo passo-a-passo
- **`DEPLOY_QUICK_START.md`** - Resumo rápido (5 minutos)

## 💰 Token Economics

| Pagamento | Tokens PND | Bonus |
|-----------|------------|-------|
| 1 USDT    | 5,000 PND  | -     |
| 5 USDT    | 27,000 PND | +8%   |
| 10 USDT   | 55,000 PND | +10%  |

## 🔐 Segurança

- ✅ EIP-2612 padrão de assinatura
- ✅ OpenZeppelin contracts auditados
- ✅ Validação de deadline (expiração)
- ✅ Validação de nonce (replay protection)
- ✅ Ownership transfer seguro

## 📊 Custos

### BSC Mainnet

| Operação | Custo Estimado |
|----------|----------------|
| Deploy PayNode | ~$2-5 |
| Deploy Facilitator | ~$3-7 |
| Transação (relayer) | ~$0.10-0.30 |

### Render.com

- **Free Tier**: Funcional com limitações
- **Starter**: $7/mês por serviço (recomendado)

## 🛠️ Tecnologias

**Smart Contracts:**
- Solidity 0.8.20
- Hardhat
- OpenZeppelin
- EIP-2612 Permit

**Backend:**
- Node.js
- Express
- Ethers.js v6
- dotenv

**Frontend:**
- React 18
- TypeScript
- Vite
- Wagmi v2
- Shadcn/ui
- TailwindCSS

## 📝 Variáveis de Ambiente

### Backend (.env)

```bash
NODE_ENV=production
CHAIN_ID=56
NETWORK_NAME=BSC Mainnet
RPC_URL=https://bsc-dataseed1.binance.org/
FACILITATOR_ADDRESS=<deploy-address>
REWARD_TOKEN_ADDRESS=<deploy-address>
PAYMENT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955
RELAYER_PRIVATE_KEY=<your-key>
```

### Frontend (.env)

```bash
VITE_API_URL=<backend-url>
VITE_CHAIN_ID=56
VITE_FACILITATOR_ADDRESS=<deploy-address>
VITE_REWARD_TOKEN_ADDRESS=<deploy-address>
VITE_PAYMENT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955
```

## 🧪 Testes

### Teste Local

```bash
cd contracts
npx hardhat test
```

### Teste Produção

1. Health check:
```bash
curl https://your-backend.onrender.com/api/payment/health
```

2. Interface web:
- Acesse seu frontend
- Conecte MetaMask (BSC)
- Compre tokens PND

## 📚 Documentação

- `/contracts/contracts/*.sol` - Smart contracts
- `/backend/src` - Backend source
- `/src` - Frontend source
- `DEPLOY_GUIDE.md` - Guia completo de deploy
- `DEPLOY_QUICK_START.md` - Quick start
- `instructions.md` - Especificações técnicas originais

## 🤝 Contribuindo

PRs são bem-vindos! Para mudanças maiores:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja `LICENSE` para detalhes

## 🆘 Suporte

- Issues: GitHub Issues
- Documentação: `DEPLOY_GUIDE.md`
- BSC Docs: https://docs.bnbchain.org

## 🎉 Créditos

Desenvolvido usando:
- EIP-2612 Standard
- OpenZeppelin Contracts
- Binance Smart Chain
- Render.com

---

**Made with ❤️ for the Web3 community**
