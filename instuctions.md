# Prompt para Desenvolvimento: Sistema de Pagamentos Gasless com Protocolo x402

## Visão Geral do Projeto

Desenvolva uma aplicação web completa que implementa o protocolo x402 na BNB Chain, permitindo que usuários realizem ações (mint de tokens/NFTs ou compra de produtos digitais) **SEM precisar de BNB para gas fees**.

---

## Objetivos Principais

1. **Frontend Web Responsivo**: Interface onde usuários conectam wallet e realizam ações gasless
2. **Smart Contracts**: Token EIP-2612 + Facilitador x402
3. **Backend API**: Processa assinaturas Permit e executa transações
4. **Experiência do Usuário**: Usuário sem BNB consegue realizar ações apenas assinando mensagens

---

## Especificações Técnicas Detalhadas

### 1. SMART CONTRACTS (Solidity)

#### 1.1 Token ERC20 com EIP-2612 Permit
```solidity
// Características necessárias:
- Nome: "GaslessReward" (GRW)
- Symbol: GRW
- Decimals: 18
- Supply inicial: 0 (mintável)
- Implementar EIP-2612 (permit function)
- Função de mint controlada (apenas facilitador pode mintar)
- Eventos de transferência e mint
```

**Funcionalidades do Token:**
- `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)` - Aprovação via assinatura
- `mint(address to, uint256 amount)` - Apenas owner/facilitador
- Herdar de OpenZeppelin: ERC20, ERC20Permit, Ownable

#### 1.2 Contrato Facilitador x402
```solidity
// Características necessárias:
- Processar pagamentos via permit
- Aceitar token de pagamento (USD1 ou USDT/USDC)
- Executar mint/ação após verificar pagamento
- Sistema de taxas configurável
- Pausável em emergências
- Ownership transferível
```

**Funcionalidades do Facilitador:**
```solidity
struct PaymentParams {
    address payer;          // Quem está pagando
    address paymentToken;   // Token usado para pagamento (USDT/USDC)
    uint256 paymentAmount;  // Quantidade a pagar
    uint256 rewardAmount;   // Quantidade de GRW tokens a receber
    uint256 deadline;       // Deadline da assinatura
    uint8 v;               // Assinatura permit
    bytes32 r;
    bytes32 s;
}

function processGaslessPayment(PaymentParams calldata params) external;
```

**Lógica interna:**
1. Verificar deadline não expirado
2. Executar `permit()` no token de pagamento
3. Transferir tokens de pagamento do usuário para o facilitador
4. Mintar tokens de recompensa para o usuário
5. Emitir evento de sucesso

---

### 2. BACKEND API (Node.js + Express)

#### 2.1 Estrutura do Projeto
```
backend/
├── src/
│   ├── config/
│   │   ├── blockchain.js      # Configurações RPC, contracts
│   │   └── environment.js      # Variáveis de ambiente
│   ├── services/
│   │   ├── permitService.js    # Processar assinaturas EIP-2612
│   │   ├── facilitatorService.js # Interagir com contrato facilitador
│   │   └── relayerService.js   # Wallet do relayer (paga gas)
│   ├── routes/
│   │   └── payment.js          # Endpoints da API
│   ├── utils/
│   │   ├── validation.js       # Validar assinaturas
│   │   └── logger.js           # Sistema de logs
│   └── index.js
├── .env.example
├── package.json
└── README.md
```

#### 2.2 Endpoints da API

**POST /api/payment/execute**
```json
Request Body:
{
  "userAddress": "0x...",
  "paymentTokenAddress": "0x...",
  "paymentAmount": "1000000", // 1 USDT (6 decimals)
  "rewardAmount": "5000000000000000000000", // 5000 GRW tokens
  "deadline": 1234567890,
  "signature": {
    "v": 27,
    "r": "0x...",
    "s": "0x..."
  }
}

Response Success:
{
  "success": true,
  "txHash": "0x...",
  "rewardAmount": "5000",
  "message": "Payment processed successfully"
}

Response Error:
{
  "success": false,
  "error": "Invalid signature",
  "message": "The permit signature is invalid or expired"
}
```

**GET /api/payment/config**
```json
Response:
{
  "facilitatorAddress": "0x...",
  "rewardTokenAddress": "0x...",
  "paymentTokenAddress": "0x...",
  "rates": {
    "1_usdt": "5000", // 1 USDT = 5000 GRW
    "5_usdt": "27000"  // 5 USDT = 27000 GRW (bonus de 8%)
  }
}
```

**GET /api/payment/status/:txHash**
```json
Response:
{
  "status": "confirmed", // pending, confirmed, failed
  "blockNumber": 12345678,
  "timestamp": 1234567890
}
```

#### 2.3 Lógica do Backend

**Serviço de Relayer (relayerService.js):**
```javascript
// Wallet privada que paga o gas
// Monitora saldo de BNB
// Executa transações no contrato facilitador
// Implementa retry logic
// Rate limiting para evitar spam
```

**Validações necessárias:**
- Verificar assinatura permit é válida
- Verificar deadline não expirou
- Verificar saldo do usuário no token de pagamento
- Verificar allowance via permit será suficiente
- Anti-spam: limitar requests por IP/address
- Verificar se usuário não é bot/sybil (opcional)

---

### 3. FRONTEND WEB (React + Web3)

#### 3.1 Estrutura do Projeto
```
frontend/
├── src/
│   ├── components/
│   │   ├── WalletConnect.jsx   # Conectar carteira
│   │   ├── PaymentForm.jsx     # Form de pagamento
│   │   ├── SignatureModal.jsx  # Modal para assinar permit
│   │   ├── SuccessModal.jsx    # Confirmar sucesso
│   │   └── LoadingSpinner.jsx  # Loading states
│   ├── hooks/
│   │   ├── useWallet.js        # Hook de conexão wallet
│   │   ├── usePermit.js        # Hook para criar assinatura permit
│   │   └── usePayment.js       # Hook para processar pagamento
│   ├── services/
│   │   ├── web3Service.js      # Interações blockchain
│   │   └── apiService.js       # Chamadas API backend
│   ├── utils/
│   │   ├── permitSignature.js  # Criar assinatura EIP-2612
│   │   └── formatters.js       # Formatar valores
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js
```

#### 3.2 Fluxo do Usuário

**Passo 1: Conectar Wallet**
- Botão "Connect Wallet"
- Suportar MetaMask, WalletConnect, Coinbase Wallet
- Verificar se está na BNB Chain (chainId 56)
- Exibir endereço conectado

**Passo 2: Selecionar Plano de Pagamento**
```jsx
// Cards de opções:
Opção 1: 1 USDT = 5,000 GRW tokens
Opção 2: 5 USDT = 27,000 GRW tokens (bonus 8%)
Opção 3: 10 USDT = 55,000 GRW tokens (bonus 10%)
```

**Passo 3: Verificar Saldo**
- Verificar saldo de USDT/USDC do usuário
- Mostrar saldo atual
- Alertar se insuficiente

**Passo 4: Assinar Permit**
- Clicar em "Pay with USDT (No Gas Needed!)"
- Modal explicando: "You'll sign a message to approve payment. No BNB needed!"
- Usuário assina mensagem no wallet (EIP-2612)
- Exibir loading enquanto processa

**Passo 5: Backend Processa**
- Enviar assinatura para backend
- Backend executa transação
- Exibir progresso: "Processing payment..." → "Minting tokens..." → "Success!"

**Passo 6: Confirmação**
- Modal de sucesso
- Mostrar quantidade de tokens recebidos
- Link para ver transação no BSCScan
- Botão "View My Tokens"

#### 3.3 Interface (UI/UX)

**Design System:**
- Estilo: Glassmorphism / Web3 moderno
- Cores principais: Azul (#2563eb), Verde (#10b981), Branco/Cinza
- Fonte: Inter ou Sora
- Mobile-first responsive
- Animações suaves (Framer Motion)

**Componentes principais:**
```jsx
// Hero Section
<Hero>
  - Título: "Get Rewards Without Gas Fees"
  - Subtitle: "Pay with USDT, no BNB needed"
  - CTA: "Start Now"
</Hero>

// Stats Section
<Stats>
  - Total minted: 123,456 GRW
  - Total users: 789
  - Time remaining: Countdown
</Stats>

// Payment Section
<PaymentCards>
  - 3 cards com diferentes planos
  - Highlight no melhor valor
  - Badge "Most Popular"
</PaymentCards>

// How It Works
<HowItWorks>
  1. Connect Wallet (sem precisar BNB)
  2. Sign Permission (just one click)
  3. Receive Tokens (instant!)
</HowItWorks>

// FAQ Section
<FAQ>
  - Por que não preciso de BNB?
  - É seguro assinar a mensagem?
  - Quanto tempo demora?
  - Posso cancelar?
</FAQ>
```

---

### 4. IMPLEMENTAÇÃO EIP-2612 PERMIT

#### 4.1 Criar Assinatura Permit (Frontend)

```javascript
// utils/permitSignature.js
import { ethers } from 'ethers';

async function createPermitSignature({
  tokenAddress,
  ownerAddress,
  spenderAddress, // Endereço do facilitador
  value,           // Quantidade aprovada
  deadline,        // Timestamp futuro
  provider,
  chainId
}) {
  // 1. Obter nonce do token ERC20Permit
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ['function nonces(address owner) view returns (uint256)'],
    provider
  );
  const nonce = await tokenContract.nonces(ownerAddress);

  // 2. Obter nome do token para EIP-712
  const tokenInfo = new ethers.Contract(
    tokenAddress,
    ['function name() view returns (string)'],
    provider
  );
  const tokenName = await tokenInfo.name();

  // 3. Criar domain separator EIP-712
  const domain = {
    name: tokenName,
    version: '1',
    chainId: chainId,
    verifyingContract: tokenAddress
  };

  // 4. Tipos EIP-712 para Permit
  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  // 5. Valor da mensagem
  const message = {
    owner: ownerAddress,
    spender: spenderAddress,
    value: value.toString(),
    nonce: nonce.toString(),
    deadline: deadline
  };

  // 6. Assinar com EIP-712
  const signer = provider.getSigner();
  const signature = await signer._signTypedData(domain, types, message);

  // 7. Dividir assinatura em v, r, s
  const sig = ethers.utils.splitSignature(signature);

  return {
    v: sig.v,
    r: sig.r,
    s: sig.s,
    deadline: deadline
  };
}

export default createPermitSignature;
```

#### 4.2 Processar Permit (Backend)

```javascript
// services/facilitatorService.js
const { ethers } = require('ethers');

async function executeGaslessPayment({
  userAddress,
  paymentTokenAddress,
  paymentAmount,
  rewardAmount,
  deadline,
  v, r, s
}) {
  // 1. Setup provider e wallet do relayer
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

  // 2. Instanciar contrato facilitador
  const facilitator = new ethers.Contract(
    FACILITATOR_ADDRESS,
    FACILITATOR_ABI,
    relayerWallet
  );

  // 3. Preparar parâmetros
  const params = {
    payer: userAddress,
    paymentToken: paymentTokenAddress,
    paymentAmount: paymentAmount,
    rewardAmount: rewardAmount,
    deadline: deadline,
    v: v,
    r: r,
    s: s
  };

  // 4. Executar transação (relayer paga o gas!)
  const tx = await facilitator.processGaslessPayment(params, {
    gasLimit: 300000 // Ajustar conforme necessário
  });

  // 5. Aguardar confirmação
  const receipt = await tx.wait();

  return {
    txHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber,
    status: receipt.status === 1 ? 'success' : 'failed'
  };
}

module.exports = { executeGaslessPayment };
```

---

### 5. CONFIGURAÇÃO E DEPLOYMENT

#### 5.1 Variáveis de Ambiente

**.env (Backend)**
```bash
# Blockchain
RPC_URL=https://bsc-dataseed1.binance.org/
CHAIN_ID=56
NETWORK_NAME=BNB Chain

# Contracts
FACILITATOR_ADDRESS=0x...
REWARD_TOKEN_ADDRESS=0x...
PAYMENT_TOKEN_ADDRESS=0x... # USDT na BSC

# Relayer
RELAYER_PRIVATE_KEY=0x...
RELAYER_ADDRESS=0x...

# API
PORT=3000
NODE_ENV=production

# Security
RATE_LIMIT_WINDOW=15min
RATE_LIMIT_MAX_REQUESTS=10
```

**.env (Frontend)**
```bash
VITE_API_URL=https://api.yourproject.com
VITE_CHAIN_ID=56
VITE_FACILITATOR_ADDRESS=0x...
VITE_PAYMENT_TOKEN_ADDRESS=0x...
```

#### 5.2 Deploy dos Contratos

```javascript
// scripts/deploy.js (Hardhat)

async function main() {
  // 1. Deploy do Token de Recompensa
  const GaslessReward = await ethers.getContractFactory("GaslessReward");
  const rewardToken = await GaslessReward.deploy();
  await rewardToken.deployed();
  console.log("Reward Token:", rewardToken.address);

  // 2. Deploy do Facilitador
  const Facilitator = await ethers.getContractFactory("X402Facilitator");
  const facilitator = await Facilitator.deploy(
    rewardToken.address,
    USDT_ADDRESS // Token de pagamento
  );
  await facilitator.deployed();
  console.log("Facilitator:", facilitator.address);

  // 3. Transferir ownership do token para o facilitador
  await rewardToken.transferOwnership(facilitator.address);
  console.log("Ownership transferred!");

  // 4. Verificar no BSCScan
  await run("verify:verify", {
    address: rewardToken.address,
    constructorArguments: []
  });
}
```

#### 5.3 Funding do Relayer

```bash
# O relayer precisa de BNB para pagar gas
# Recomendado: manter sempre 0.5 BNB no mínimo
# Implementar alerta quando < 0.1 BNB
```

---

### 6. SEGURANÇA E BOAS PRÁTICAS

#### 6.1 Smart Contracts
- ✅ Usar OpenZeppelin contracts auditados
- ✅ Implementar pausability para emergências
- ✅ Rate limiting no facilitador (max por address/dia)
- ✅ Verificar deadline nas assinaturas
- ✅ Proteger contra replay attacks (nonces)
- ✅ Events para todas ações importantes
- ✅ Reentrancy guards

#### 6.2 Backend
- ✅ Validar todas assinaturas antes de executar
- ✅ Rate limiting por IP e por address
- ✅ Logs detalhados de todas transações
- ✅ Monitorar saldo do relayer
- ✅ Implementar circuit breaker se muitas falhas
- ✅ CORS configurado corretamente
- ✅ HTTPS obrigatório em produção
- ✅ Sanitizar inputs

#### 6.3 Frontend
- ✅ Verificar chain ID antes de permitir ações
- ✅ Mostrar claramente o que usuário está assinando
- ✅ Timeouts apropriados nas requisições
- ✅ Error handling robusto
- ✅ Loading states em todas ações
- ✅ Não expor private keys (óbvio, mas importante!)

---

### 7. MONITORAMENTO E ANALYTICS

#### 7.1 Métricas para Acompanhar
- Total de pagamentos processados
- Volume total transacionado
- Taxa de sucesso/falha
- Tempo médio de processamento
- Saldo do relayer (BNB)
- Usuários únicos
- Tokens mintados

#### 7.2 Ferramentas
- Backend: Winston para logs
- Monitoring: Sentry para errors
- Analytics: Mixpanel ou Google Analytics
- Blockchain: Etherscan API para verificar status

---

### 8. TESTES

#### 8.1 Smart Contracts (Hardhat/Foundry)
```javascript
// test/Facilitator.test.js
describe("X402 Facilitator", function() {
  it("Should process gasless payment with valid permit", async () => {
    // Criar assinatura permit
    // Executar processGaslessPayment
    // Verificar tokens foram mintados
    // Verificar pagamento foi transferido
  });

  it("Should reject expired permit", async () => {
    // Criar permit com deadline no passado
    // Deve reverter
  });

  it("Should reject invalid signature", async () => {
    // Criar assinatura inválida
    // Deve reverter
  });
});
```

#### 8.2 Backend (Jest)
- Testar validação de assinaturas
- Testar rate limiting
- Testar error handling
- Testar integração com blockchain

#### 8.3 Frontend (Vitest + Testing Library)
- Testar fluxo completo de pagamento
- Testar conexão de wallet
- Testar tratamento de erros
- Testar responsividade

---

### 9. DOCUMENTAÇÃO PARA USUÁRIOS

#### 9.1 Landing Page Deve Explicar:

**O que é o projeto?**
"Ganhe tokens GRW sem precisar de BNB! Pague apenas com USDT e receba seus tokens instantaneamente."

**Como funciona?**
1. Conecte sua carteira (MetaMask, Trust Wallet, etc)
2. Escolha quanto quer pagar em USDT
3. Assine uma mensagem (não custa nada!)
4. Receba seus tokens GRW instantaneamente

**Por que não preciso de BNB?**
"Usamos o protocolo x402 que permite pagamentos 'gasless'. Você só assina uma mensagem autorizando o pagamento, e nosso sistema executa a transação por você."

**É seguro?**
"Sim! Você apenas autoriza o uso dos seus USDT para este pagamento específico. Seus fundos estão seguros e a transação é verificada na blockchain."

#### 9.2 FAQ
- O que acontece se eu não tiver USDT suficiente?
- Posso cancelar depois de assinar?
- Quanto tempo demora?
- Tem limite de quanto posso comprar?
- Posso vender os tokens GRW depois?

---

### 10. MELHORIAS FUTURAS (V2)

- 🔮 Suportar múltiplos tokens de pagamento (USDC, BUSD)
- 🔮 Sistema de referral (ganhe mais tokens indicando amigos)
- 🔮 NFT rewards para early adopters
- 🔮 Dashboard com histórico de transações
- 🔮 Suporte a outras chains (Polygon, Arbitrum)
- 🔮 Staking de tokens GRW para rewards
- 🔮 Governance com tokens GRW

---

## ENTREGÁVEIS FINAIS

### Repositório deve conter:

```
project-root/
├── contracts/                 # Smart contracts Solidity
│   ├── GaslessReward.sol
│   ├── X402Facilitator.sol
│   └── test/
├── backend/                   # API Node.js
│   └── [estrutura descrita acima]
├── frontend/                  # React app
│   └── [estrutura descrita acima]
├── docs/                      # Documentação
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
├── scripts/                   # Scripts de deploy
│   ├── deploy.js
│   └── verify.js
├── README.md
└── docker-compose.yml        # Para rodar tudo local
```

### README.md deve incluir:
- Descrição do projeto
- Como rodar localmente
- Como fazer deploy
- Arquitetura do sistema
- Links para contratos verificados
- Demo/screenshots
- Links úteis (BSCScan, docs x402)

---

## STACK TECNOLÓGICA RECOMENDADA

### Smart Contracts
- Solidity ^0.8.20
- Hardhat ou Foundry
- OpenZeppelin Contracts
- Ethers.js

### Backend
- Node.js v18+
- Express.js
- Ethers.js v6
- dotenv
- Winston (logging)
- Express-rate-limit

### Frontend
- React 18
- Vite
- Ethers.js v6
- Wagmi ou RainbowKit (wallet connection)
- TailwindCSS
- Framer Motion
- React Query

### DevOps
- Vercel/Netlify (frontend)
- Railway/Render (backend)
- GitHub Actions (CI/CD)

---

## OBSERVAÇÕES FINAIS

- **Testnet First**: Deploy e teste tudo na BSC Testnet antes de mainnet
- **Audit**: Considere audit dos contratos se for lidar com valores significativos
- **Compliance**: Verifique aspectos legais/regulatórios do seu país
- **UX é Rei**: Foque em tornar o processo o mais simples possível
- **Educação**: Usuários podem não entender "gasless", explique bem

---

## PRIORIZAÇÃO DE DESENVOLVIMENTO

### Fase 1 - MVP (2-3 semanas)
1. Smart contracts básicos
2. Backend com endpoint único de pagamento
3. Frontend simples com 1 opção de pagamento
4. Deploy em testnet
5. Testes básicos

### Fase 2 - Produção (1-2 semanas)
1. Múltiplas opções de pagamento
2. UI/UX polida
3. Testes completos
4. Audit (se possível)
5. Deploy mainnet

### Fase 3 - Crescimento (ongoing)
1. Analytics e monitoramento
2. Marketing e docs
3. Suporte a usuários
4. Iterações baseadas em feedback

---

## RECURSOS ÚTEIS

- **x402 Protocol**: https://github.com/x402/x402
- **EIP-2612**: https://eips.ethereum.org/EIPS/eip-2612
- **OpenZeppelin ERC20Permit**: https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Permit
- **BSC Docs**: https://docs.bnbchain.org/
- **Hardhat**: https://hardhat.org/
- **Ethers.js**: https://docs.ethers.org/v6/

---

**BOA SORTE COM O DESENVOLVIMENTO! 🚀**

Se tiver dúvidas durante a implementação, consulte a documentação oficial do x402 protocol e as referências do PENG! token.