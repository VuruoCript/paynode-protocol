# 🚀 Guia de Deploy para Produção - PayNode

Este guia descreve como fazer o deploy completo do sistema PayNode na BSC Mainnet e Render.

## 📋 Pré-requisitos

### 1. Contas e Chaves Necessárias

- ✅ Conta na BSC com BNB para gas (~0.1 BNB)
- ✅ Private key do deployer (para deploy dos contratos)
- ✅ Private key do relayer (para executar transações gasless)
- ✅ Conta no Render.com (gratuita)
- ✅ Repositório Git (GitHub, GitLab, etc.)

### 2. Ferramentas

```bash
node >= 18.0.0
npm >= 9.0.0
```

---

## 🔧 Parte 1: Deploy dos Smart Contracts na BSC

### Passo 1: Configurar Variáveis de Ambiente

Crie o arquivo `.env` na pasta `contracts/`:

```bash
# contracts/.env
DEPLOYER_PRIVATE_KEY="sua-chave-privada-aqui"
BSC_RPC_URL="https://bsc-dataseed1.binance.org/"
BSCSCAN_API_KEY="sua-api-key-bscscan" # Opcional, para verificação
```

⚠️ **NUNCA** comite este arquivo no Git!

### Passo 2: Compilar os Contratos

```bash
cd contracts
npm install
npx hardhat compile
```

Você deve ver:
```
✅ Compiled X Solidity files successfully
```

### Passo 3: Deploy na BSC Mainnet

```bash
npx hardhat run scripts/deploy-bsc.js --network bsc
```

O script vai:
1. Deploy do token **PayNode (PND)**
2. Deploy do **X402Facilitator**
3. Transferir ownership do PayNode para o Facilitator
4. Salvar endereços em `deployment-bsc.json`

**Exemplo de output:**

```
🚀 Deploying to BSC Mainnet...

Deployer address: 0x...
Deployer balance: 0.5 BNB

✅ PayNode deployed to: 0x...
✅ X402Facilitator deployed to: 0x...
✅ Ownership transferred

═══════════════════════════════════════════════════
🎉 DEPLOYMENT SUCCESSFUL!
═══════════════════════════════════════════════════

📋 Contract Addresses:
   PayNode Token:      0x...
   X402Facilitator:    0x...
   USDT (existing):    0x55d398326f99059fF775485246999027B3197955
```

### Passo 4: Verificar Contratos no BSCScan (Opcional)

```bash
npx hardhat verify --network bsc <PAYNODE_ADDRESS>
npx hardhat verify --network bsc <FACILITATOR_ADDRESS> <PAYNODE_ADDRESS> <TREASURY> <RATE> <MIN_PAYMENT>
```

---

## 🌐 Parte 2: Deploy do Backend no Render

### Passo 1: Push para Git

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Passo 2: Criar Web Service no Render

1. Acesse [https://render.com](https://render.com)
2. Clique em **"New +" → "Web Service"**
3. Conecte seu repositório Git
4. Configure:

```yaml
Name: paynode-backend
Environment: Node
Region: Oregon (ou mais próximo)
Branch: main
Build Command: cd backend && npm install
Start Command: cd backend && npm start
```

### Passo 3: Configurar Environment Variables

Na seção **Environment**, adicione:

```bash
NODE_ENV=production
PORT=3000
CHAIN_ID=56
NETWORK_NAME=BSC Mainnet
RPC_URL=https://bsc-dataseed1.binance.org/
FACILITATOR_ADDRESS=<endereço-do-deployment-bsc.json>
REWARD_TOKEN_ADDRESS=<endereço-do-deployment-bsc.json>
PAYMENT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955
RELAYER_PRIVATE_KEY=<sua-chave-privada-do-relayer>
MIN_RELAYER_BALANCE=0.1
```

⚠️ **IMPORTANTE**: Use uma carteira DIFERENTE para o relayer!

### Passo 4: Deploy

Clique em **"Create Web Service"**

O Render vai:
- Instalar dependências
- Iniciar o servidor
- Fornecer uma URL pública (ex: `https://paynode-backend.onrender.com`)

---

## 🎨 Parte 3: Deploy do Frontend no Render

### Passo 1: Atualizar Frontend com Nome PayNode

Os arquivos já foram atualizados com:
- Token name: **PayNode**
- Token symbol: **PND**
- Texto "GRW" substituído por "PND" em toda interface

### Passo 2: Criar Static Site no Render

1. No Render, clique em **"New +" → "Static Site"**
2. Conecte o mesmo repositório
3. Configure:

```yaml
Name: paynode-frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

### Passo 3: Configurar Environment Variables

```bash
VITE_API_URL=https://paynode-backend.onrender.com
VITE_CHAIN_ID=56
VITE_FACILITATOR_ADDRESS=<endereço-do-deployment-bsc.json>
VITE_REWARD_TOKEN_ADDRESS=<endereço-do-deployment-bsc.json>
VITE_PAYMENT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955
```

### Passo 4: Deploy

Clique em **"Create Static Site"**

Seu frontend estará disponível em: `https://paynode-frontend.onrender.com`

---

## ✅ Parte 4: Testes em Produção

### 1. Verificar Backend

```bash
curl https://paynode-backend.onrender.com/api/payment/health
```

Deve retornar:
```json
{
  "success": true,
  "healthy": true,
  "relayerAddress": "0x...",
  "balance": "X.XX BNB",
  "network": "BSC Mainnet"
}
```

### 2. Testar Frontend

1. Acesse `https://paynode-frontend.onrender.com`
2. Conecte MetaMask (rede BSC Mainnet)
3. Certifique-se de ter USDT na carteira
4. Clique em "Buy Now"
5. Assine a mensagem (SEM GAS!)
6. Receba tokens PND

### 3. Verificar Transação

Após pagamento bem-sucedido, você receberá um transaction hash.

Verifique em: `https://bscscan.com/tx/<hash>`

---

## 🔒 Segurança

### Private Keys

- **NUNCA** compartilhe suas private keys
- Use carteiras diferentes para:
  - Deployer (deploy dos contratos)
  - Relayer (execução de transações)
  - Treasury (recebimento de pagamentos)

### Environment Variables

- **NUNCA** comite arquivos `.env` no Git
- Use o sistema de secrets do Render
- Rotacione as keys periodicamente

### Relayer

- Mantenha saldo mínimo de BNB (0.1 BNB)
- Monitor o saldo regularmente
- Configure alertas no endpoint `/api/payment/health`

---

## 📊 Monitoramento

### Health Check

O backend expõe um endpoint de health:

```
GET https://paynode-backend.onrender.com/api/payment/health
```

Retorna:
- Status do relayer
- Saldo em BNB
- Network info
- Gas price
- Block number

### Logs

Acesse logs no painel do Render:
- Backend: Dashboard → paynode-backend → Logs
- Frontend: Dashboard → paynode-frontend → Logs

---

## 🐛 Troubleshooting

### Erro: "Insufficient relayer balance"

**Solução**: Envie BNB para o endereço do relayer

```bash
# Verificar saldo
curl https://paynode-backend.onrender.com/api/payment/health
```

### Erro: "Network not supported"

**Solução**: Certifique-se de estar na BSC Mainnet (Chain ID: 56)

### Erro: "Insufficient USDT balance"

**Solução**: Compre USDT na BSC:
- Endereço USDT: `0x55d398326f99059fF775485246999027B3197955`
- Você pode comprar em exchanges como Binance e fazer withdraw para BSC

### Frontend não carrega

**Solução**:
1. Verifique se o build foi bem-sucedido no Render
2. Verifique as environment variables
3. Limpe cache do navegador (Ctrl + Shift + Delete)

---

## 📈 Custos Estimados

### BSC Mainnet

| Item | Custo Estimado |
|------|----------------|
| Deploy PayNode | ~$2-5 USD |
| Deploy Facilitator | ~$3-7 USD |
| Gas por transação | ~$0.10-0.30 USD |

### Render (Plano Free)

| Serviço | Custo |
|---------|-------|
| Backend (Web Service) | $0/mês (com limitações) |
| Frontend (Static Site) | $0/mês |

**Limitações do plano Free:**
- Backend pode "dormir" após 15 min sem uso
- 750 horas/mês de uptime
- 100GB bandwidth/mês

**Para produção séria**, considere:
- Render Starter Plan: $7/mês por serviço
- Ou outros provedores (AWS, Vercel, Railway)

---

## 🎯 Próximos Passos

1. ✅ Deploy dos contratos na BSC
2. ✅ Configurar backend no Render
3. ✅ Configurar frontend no Render
4. ✅ Testar fluxo completo
5. 🔜 Adicionar analytics
6. 🔜 Configurar domínio customizado
7. 🔜 Adicionar mais métodos de pagamento
8. 🔜 Implementar sistema de referral

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no Render
2. Teste localmente primeiro
3. Verifique as configurações de environment variables
4. Consulte a documentação da BSC: https://docs.bnbchain.org/

---

## 🎉 Parabéns!

Seu sistema PayNode está agora em produção na BSC! 🚀

**URLs úteis:**
- Frontend: https://paynode-frontend.onrender.com
- Backend: https://paynode-backend.onrender.com
- Health Check: https://paynode-backend.onrender.com/api/payment/health
- BSCScan: https://bscscan.com
