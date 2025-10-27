# 🧪 GUIA DE TESTE FUNCIONAL - PayNode Gasless Payment

## ✅ **STATUS DO SISTEMA:**

**TUDO ESTÁ RODANDO E PRONTO PARA TESTE!**

### 🟢 Serviços Ativos:

1. **Hardhat Network (Blockchain Local)** - `http://127.0.0.1:8545`
2. **Backend API** - `http://localhost:3000`
3. **Frontend React** - `http://localhost:8081`

---

## 📋 **CONTRATOS DEPLOYADOS:**

| Contrato | Endereço | Descrição |
|----------|----------|-----------|
| **MockUSDT** | `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318` | Token de pagamento (6 decimals) |
| **GaslessReward (GRW)** | `0x610178dA211FEF7D417bC0e6FeD39F05609AD788` | Token de recompensa (18 decimals) |
| **X402Facilitator** | `0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e` | Contrato facilitador de pagamentos |

---

## 👛 **CONTAS DE TESTE (com 1000 USDT cada):**

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8  [RELAYER]
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

Account #4: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
```

**⚠️ IMPORTANTE:** Cada conta tem 10,000 ETH e 1,000 USDT para testes!

---

## 🚀 **PASSO A PASSO DO TESTE FUNCIONAL:**

### **Passo 1: Configurar MetaMask**

1. **Abra o MetaMask**
2. **Adicione a Rede Hardhat Local:**
   - Nome da Rede: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Símbolo da Moeda: `ETH`

3. **Importar uma Conta de Teste:**
   - Clique em "Importar Conta"
   - Cole a Private Key de uma das contas acima (ex: Account #0)
   - Você verá 10,000 ETH na carteira!

---

### **Passo 2: Acessar o Frontend**

1. **Abra o navegador** e vá para: **http://localhost:8081**

2. **Você verá:**
   - Hero section com vídeo background
   - Seções explicativas
   - **Seção "Get GRW Tokens Without Gas Fees"** ⬅️ É aqui que vamos testar!

---

### **Passo 3: Conectar a Carteira**

1. **Clique em "Connect Wallet"** (canto superior direito)
2. **Selecione MetaMask**
3. **Aprove a conexão**
4. **Confirme que está na rede "Hardhat Local" (31337)**
5. Seu endereço aparecerá no topo da página

---

### **Passo 4: Adicionar Tokens no MetaMask (Opcional - para visualizar)**

**Adicionar USDT:**
- Endereço: `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`
- Símbolo: `USDT`
- Decimals: `6`

**Adicionar GRW:**
- Endereço: `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`
- Símbolo: `GRW`
- Decimals: `18`

**Você deve ver:**
- 1,000 USDT
- 0 GRW (por enquanto)

---

### **Passo 5: Fazer um Pagamento Gasless!** 🎉

1. **Desça até a seção "Get GRW Tokens Without Gas Fees"**

2. **Escolha um plano:**
   - ⭐ **1 USDT = 5,000 GRW** (básico)
   - 🔥 **5 USDT = 27,000 GRW** (popular - bônus 8%)
   - 💎 **10 USDT = 55,000 GRW** (melhor valor - bônus 10%)

3. **Clique em "Buy Now (No Gas!)"**

4. **O que vai acontecer:**

   **a) Loading: "Loading payment configuration..."**
   - Frontend busca configs do backend

   **b) Modal do MetaMask aparece: "Signature Request"**
   - ⚠️ **IMPORTANTE:** Você está assinando uma mensagem EIP-712 Permit
   - **NÃO está gastando gas!**
   - Clique em "Sign"

   **c) Loading: "Processing your payment..."**
   - Backend executa a transação via relayer
   - Relayer paga o gas por você!

   **d) Modal de Sucesso! ✅**
   - "Payment Successful!"
   - Transaction hash exibido
   - Link para ver no explorer

---

### **Passo 6: Verificar o Resultado**

1. **No MetaMask, verifique:**
   - USDT diminuiu (ex: 1000 → 999 se pagou 1 USDT)
   - GRW aumentou (ex: 0 → 5000 se recebeu 5000 GRW)

2. **No console do Hardhat Network:**
   ```
   eth_sendRawTransaction
   eth_getTransactionReceipt
   ```
   Você verá as transações sendo processadas!

3. **No console do Backend:**
   ```
   POST /api/payment/execute
   Processing payment...
   Transaction mined: 0x...
   ```

---

## 🧪 **TESTES ADICIONAIS:**

### **Teste 1: Verificar Saldo no Backend**

```bash
curl http://localhost:3000/api/payment/balance/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Resposta esperada:**
```json
{
  "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "balance": "999000000",
  "balanceFormatted": "999.0",
  "decimals": 6
}
```

---

### **Teste 2: Verificar Configuração**

```bash
curl http://localhost:3000/api/payment/config
```

**Resposta esperada:**
```json
{
  "facilitatorAddress": "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
  "rewardTokenAddress": "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  "paymentTokenAddress": "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  "rates": {
    "1_usdt": "5000",
    "5_usdt": "27000",
    "10_usdt": "55000"
  },
  "chainId": 31337,
  "networkName": "Hardhat Local"
}
```

---

### **Teste 3: Health Check**

```bash
curl http://localhost:3000/api/payment/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "network": "Hardhat Local",
  "chainId": 31337,
  "relayer": {
    "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "balance": "9999.99...",
    "balanceOk": true
  },
  ...
}
```

---

## 🎯 **CENÁRIOS DE TESTE:**

### **Cenário 1: Pagamento de 1 USDT**
✅ **Esperado:**
- Usuário paga 1 USDT
- Recebe 5,000 GRW
- Gasta 0 ETH em gas

### **Cenário 2: Pagamento de 5 USDT (Bônus)**
✅ **Esperado:**
- Usuário paga 5 USDT
- Recebe 27,000 GRW (8% bonus)
- Gasta 0 ETH em gas

### **Cenário 3: Múltiplos Pagamentos**
✅ **Esperado:**
- Usuário pode fazer vários pagamentos
- Cada um gasta 0 gas
- Saldo de GRW acumula

### **Cenário 4: Trocar de Conta**
✅ **Esperado:**
- Importar outra private key no MetaMask
- Conectar nova carteira
- Fazer pagamento
- Cada conta tem 1000 USDT para testar

---

## 🔍 **O QUE OBSERVAR:**

### **No Frontend:**
✅ Botão "Buy Now" muda para loading states
✅ Modal de assinatura aparece
✅ Modal de sucesso com transaction hash
✅ Sem pop-ups de confirmação de gas!

### **No MetaMask:**
✅ Só pede para assinar mensagem (não aprovar transação)
✅ Saldo de ETH **NÃO MUDA** (0 gas gasto!)
✅ Saldo de USDT diminui
✅ Saldo de GRW aumenta

### **No Console do Hardhat:**
```
eth_call
eth_sendRawTransaction
  From: 0x7099... (relayer)  ← O relayer que paga!
  To: 0xB7f8... (facilitator)
eth_getTransactionReceipt
```

### **No Console do Backend:**
```
POST /api/payment/execute
Validating payment parameters...
Executing gasless payment...
Transaction mined successfully!
```

---

## ❌ **TESTES DE ERRO:**

### **Erro 1: Saldo Insuficiente**

1. Tente pagar 2000 USDT (você só tem 1000)
2. **Esperado:** Erro "Insufficient balance"

### **Erro 2: Carteira Não Conectada**

1. Desconecte a carteira
2. Tente clicar em "Buy Now"
3. **Esperado:** Botão mostra "Connect Wallet First"

### **Erro 3: Rede Errada**

1. Mude para outra rede no MetaMask (ex: Ethereum Mainnet)
2. **Esperado:** Frontend detecta rede errada

---

## 📊 **MÉTRICAS PARA VALIDAR:**

✅ **Gas gasto pelo usuário:** `0 ETH`
✅ **Gas gasto pelo relayer:** `~0.001 ETH` por transação
✅ **Tempo de execução:** `< 5 segundos`
✅ **Taxa de sucesso:** `100%` (em condições normais)
✅ **USDT transferido:** Exatamente o valor escolhido
✅ **GRW recebido:** De acordo com a tabela de rates

---

## 🐛 **TROUBLESHOOTING:**

### **Problema: "Failed to create permit signature"**
**Solução:** Verifique se está na rede Hardhat Local (31337)

### **Problema: "Transaction failed"**
**Solução:** Veja logs do backend para detalhes do erro

### **Problema: "Relayer balance is low"**
**Solução:** Relayer tem 10,000 ETH, não deve acontecer em testes

### **Problema: MetaMask não conecta**
**Solução:**
1. Limpe cache do site
2. Resete a conta no MetaMask (Settings → Advanced → Reset Account)
3. Tente novamente

---

## 🎬 **FLUXO VISUAL DO TESTE:**

```
1. Usuário → Abre http://localhost:8081
2. Usuário → Clica "Connect Wallet"
3. MetaMask → Pede confirmação
4. Usuário → Aprova conexão
5. Usuário → Desce até seção de pagamento
6. Usuário → Clica "Buy Now (No Gas!)" no plano de 1 USDT
7. Frontend → Carrega configuração
8. MetaMask → Abre modal "Signature Request"
9. Usuário → Clica "Sign" (SEM gastar gas!)
10. Frontend → Envia para backend
11. Backend → Valida assinatura
12. Relayer → Executa transação (PAGA O GAS)
13. Blockchain → Confirma transação
14. Frontend → Mostra modal de sucesso! ✅
15. Usuário → Vê 5000 GRW na carteira!
```

---

## ✅ **CHECKLIST FINAL:**

Antes de considerar o teste completo, verifique:

- [ ] Frontend está rodando em http://localhost:8081
- [ ] Backend está rodando em http://localhost:3000
- [ ] Hardhat Network está rodando
- [ ] MetaMask conectado na rede local
- [ ] Conta importada com USDT e ETH
- [ ] Conseguiu fazer pagamento de 1 USDT
- [ ] Recebeu 5000 GRW
- [ ] Não gastou nada de gas (ETH)
- [ ] Modal de sucesso apareceu
- [ ] Transaction hash foi exibido

---

## 🎉 **PARABÉNS!**

Se todos os testes passaram, você tem um sistema de **pagamentos gasless funcionando 100%**!

O usuário pode comprar tokens GRW pagando com USDT **SEM precisar de ETH/BNB para gas**!

---

## 📝 **PRÓXIMOS PASSOS:**

1. **Deploy em Testnet:** BSC Testnet para testes públicos
2. **Deploy em Mainnet:** BSC Mainnet para produção
3. **Adicionar mais features:**
   - Dashboard de transações
   - Sistema de referral
   - Múltiplos tokens de pagamento
   - Suporte a outras chains

---

**🚀 Sistema 100% funcional e pronto para uso!**
