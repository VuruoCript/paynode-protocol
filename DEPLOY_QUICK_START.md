# 🚀 Quick Start - Deploy PayNode para Produção

## ⚡ Resumo Rápido (5 Minutos)

### 1. Deploy dos Contratos na BSC

```bash
# Na pasta contracts/
cd contracts

# Criar .env
echo "DEPLOYER_PRIVATE_KEY=sua-chave-privada" > .env

# Compilar
npx hardhat compile

# Deploy (certifique-se de ter ~0.1 BNB)
npx hardhat run scripts/deploy-bsc.js --network bsc
```

**Anote os endereços que aparecerem!**

---

### 2. Deploy do Backend no Render

1. Push para Git:
```bash
git add .
git commit -m "Deploy to production"
git push
```

2. Acesse [render.com](https://render.com) → **New+ → Web Service**

3. Configure:
   - **Repository**: Seu repositório Git
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

4. **Environment Variables**:
```bash
NODE_ENV=production
PORT=3000
CHAIN_ID=56
NETWORK_NAME=BSC Mainnet
RPC_URL=https://bsc-dataseed1.binance.org/
FACILITATOR_ADDRESS=<cole-do-deploy-acima>
REWARD_TOKEN_ADDRESS=<cole-do-deploy-acima>
PAYMENT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955
RELAYER_PRIVATE_KEY=<sua-chave-do-relayer>
MIN_RELAYER_BALANCE=0.1
```

5. Click **Create Web Service**

---

### 3. Deploy do Frontend no Render

1. No Render: **New+ → Static Site**

2. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables**:
```bash
VITE_API_URL=https://seu-backend.onrender.com
VITE_CHAIN_ID=56
VITE_FACILITATOR_ADDRESS=<cole-do-deploy-acima>
VITE_REWARD_TOKEN_ADDRESS=<cole-do-deploy-acima>
VITE_PAYMENT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955
```

4. Click **Create Static Site**

---

## ✅ Teste

1. Acesse seu frontend: `https://seu-frontend.onrender.com`
2. Conecte MetaMask (BSC Mainnet)
3. Compre tokens PND com USDT
4. Sucesso! 🎉

---

## 📝 Checklist

- [ ] BNB no deployer (~0.1 BNB)
- [ ] BNB no relayer (~0.1 BNB)
- [ ] USDT na carteira de teste
- [ ] Repositório no Git
- [ ] Conta no Render.com
- [ ] Contratos deployados
- [ ] Backend rodando
- [ ] Frontend rodando
- [ ] Testado end-to-end

---

## 🆘 Problemas Comuns

**"Insufficient funds"**
→ Envie BNB para o endereço do deployer/relayer

**"Network not supported"**
→ Certifique-se de estar na BSC Mainnet (Chain ID: 56)

**Backend "sleeping"**
→ Normal no plano free do Render (acorda em ~30 segundos)

**Mais detalhes**: Veja `DEPLOY_GUIDE.md`

---

## 🎯 URLs Importantes

- **BSC Explorer**: https://bscscan.com
- **USDT na BSC**: `0x55d398326f99059fF775485246999027B3197955`
- **Render Dashboard**: https://dashboard.render.com
- **Documentação BSC**: https://docs.bnbchain.org

---

**Pronto! Seu PayNode está em produção! 🚀**
