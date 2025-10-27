# ⚡ COMO TESTAR O SISTEMA AGORA - GUIA RÁPIDO

## ✅ TUDO ESTÁ RODANDO!

```
🟢 Hardhat Network:  http://127.0.0.1:8545
🟢 Backend API:      http://localhost:3000
🟢 Frontend:         http://localhost:8081
```

---

## 🚀 TESTE EM 5 MINUTOS

### **1. Configure o MetaMask**

**Adicionar Rede Hardhat:**
- Abra MetaMask
- Clique em "Adicionar rede" → "Adicionar rede manualmente"
- Preencha:
  - **Nome da rede:** Hardhat Local
  - **URL do RPC:** `http://127.0.0.1:8545`
  - **ID da chain:** `31337`
  - **Símbolo da moeda:** ETH
- Salve

**Importar Conta de Teste:**
- No MetaMask, clique em "Importar conta"
- Cole esta private key:
  ```
  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
  ```
- ✅ Você terá **10,000 ETH** na carteira!

---

### **2. Adicione os Tokens (Opcional)**

**Para ver seu saldo de USDT:**
- No MetaMask, clique em "Importar tokens"
- Cole o endereço: `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`
- Símbolo: `USDT`
- Decimais: `6`
- ✅ Você verá **1,000 USDT**

**Para ver seu saldo de GRW:**
- Clique em "Importar tokens" novamente
- Cole o endereço: `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`
- Símbolo: `GRW`
- Decimais: `18`
- Você verá **0 GRW** (por enquanto)

---

### **3. Acesse o Site**

Abra no navegador: **http://localhost:8081**

---

### **4. Conecte a Carteira**

1. Clique em **"Connect Wallet"** (canto superior direito)
2. MetaMask vai abrir pedindo permissão
3. Clique em **"Conectar"**
4. **Certifique-se de estar na rede "Hardhat Local"**
5. Seu endereço aparecerá no topo!

---

### **5. Faça o Pagamento Gasless! 🎉**

1. **Desça** até a seção **"Get GRW Tokens Without Gas Fees"**

2. Você verá 3 planos:
   - 1 USDT → 5,000 GRW
   - 5 USDT → 27,000 GRW (Popular)
   - 10 USDT → 55,000 GRW

3. **Clique em "Buy Now (No Gas!)"** em qualquer plano

4. **O que vai acontecer:**

   **a) Carregando...** "Loading payment configuration..."

   **b) MetaMask abre:**
   - Você verá uma tela pedindo para **"Assinar"** (Sign)
   - ⚠️ **NÃO é uma transação!** É só uma assinatura
   - ✅ **Você NÃO vai gastar gas!**
   - Clique em **"Sign" (Assinar)**

   **c) Processando...** "Processing your payment..."
   - O backend está executando a transação
   - O relayer está pagando o gas por você!

   **d) SUCESSO!** 🎉
   - Modal verde aparece
   - "Payment Successful!"
   - Transaction hash é mostrado
   - Você recebeu os GRW tokens!

5. **Verifique no MetaMask:**
   - USDT diminuiu (ex: 1000 → 999)
   - GRW aumentou (ex: 0 → 5000)
   - **ETH não mudou!** ← Você gastou 0 gas! 🎉

---

## 🎯 O QUE VOCÊ ACABOU DE FAZER:

✅ Comprou 5,000 GRW tokens
✅ Pagou com 1 USDT
✅ **Gastou 0 ETH em gas** ← ESTE É O PONTO!
✅ Só assinou uma mensagem
✅ Relayer executou tudo por você

---

## 🔥 TESTE MÚLTIPLAS VEZES

Você pode:
- Comprar mais tokens (tem 1000 USDT)
- Testar diferentes planos
- Ver o saldo de GRW aumentando
- **NUNCA vai gastar ETH em gas!**

---

## 🐛 PROBLEMAS?

**"Connect Wallet" não funciona:**
- Certifique-se que MetaMask está instalado
- Verifique se está na rede "Hardhat Local"

**"Transaction failed":**
- Veja o console do navegador (F12)
- Verifique se o backend está rodando
- Verifique se tem USDT suficiente

**Saldo de USDT não aparece:**
- Re-importe o token no MetaMask
- Verifique o endereço: `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`

**Página carregando infinitamente:**
- Recarregue a página (F5)
- Limpe o cache do navegador

---

## 📊 LOGS PARA ACOMPANHAR

**No console do navegador (F12 → Console):**
Você verá os passos do pagamento sendo executados

**Nos terminais do backend/hardhat:**
Você verá as transações sendo mineradas

---

## ✅ CHECKLIST DO TESTE

- [ ] MetaMask configurado com rede Hardhat
- [ ] Conta importada com private key
- [ ] Tem 10,000 ETH e 1,000 USDT
- [ ] Site aberto em http://localhost:8081
- [ ] Carteira conectada
- [ ] Clicou em "Buy Now"
- [ ] Assinou a mensagem no MetaMask
- [ ] Recebeu GRW tokens
- [ ] ETH não mudou (0 gas gasto!)

---

## 🎉 PARABÉNS!

Você testou com sucesso um sistema de **pagamentos gasless** usando o protocolo x402!

O usuário pode comprar tokens **SEM precisar de ETH/BNB para gas**!

---

## 📚 MAIS INFORMAÇÕES

- Guia completo: `GUIA_TESTE_FUNCIONAL.md`
- Documentação: `README.md`
- Setup: `SETUP_GUIDE.md`

---

**💡 DICA FINAL:**

Importe outras contas de teste (veja o guia completo) e teste com diferentes carteiras!

Cada uma tem 1,000 USDT disponível para testes.

**🚀 Bom teste!**
