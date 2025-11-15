# 🔥 GUIA PRÁTICO: O Que Fazer no Firebase

## 🎯 AÇÕES PRIORITÁRIAS NO FIREBASE CONSOLE

### 1️⃣ DEPLOY DOS ÍNDICES COMPOSTOS (CRÍTICO!)

#### Opção A: Via Terminal (Recomendado - Mais Rápido)
```bash
# No terminal, dentro da pasta do projeto:
cd c:\Users\matis\Downloads\studio-main\studio-main

# Deploy dos índices
firebase deploy --only firestore:indexes

# Aguarde 5-10 minutos até os índices serem criados
```

#### Opção B: Via Firebase Console (Manual)

**Passo 1:** Acesse o Firebase Console
- Vá para: https://console.firebase.google.com
- Selecione seu projeto: **fir-config-12a50**

**Passo 2:** Navegue até Firestore Database
- Menu lateral esquerdo → **Firestore Database**
- Clique na aba **Indexes** (Índices)

**Passo 3:** Criar Índices Manualmente

Clique em **Create Index** e adicione estes índices um por um:

##### 📌 Índice 1: Produtos por Usuário
```
Collection ID: products
Fields to index:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

##### 📌 Índice 2: Reviews por Vendedor
```
Collection ID: reviews
Fields to index:
  - sellerId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

##### 📌 Índice 3: Notificações por Usuário
```
Collection ID: notifications
Fields to index:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

##### 📌 Índice 4: Transações de Carteira
```
Collection ID: wallet_transactions
Fields to index:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

##### 📌 Índice 5: Vendas por Vendedor
```
Collection ID: sales
Fields to index:
  - sellerId (Ascending)
  - date (Descending)
Query scope: Collection
```

##### 📌 Índice 6: Compras por Comprador
```
Collection ID: purchases
Fields to index:
  - buyerId (Ascending)
  - date (Descending)
Query scope: Collection
```

**⏱️ TEMPO DE CRIAÇÃO:** 5-15 minutos por índice (Firebase processa em background)

---

### 2️⃣ VERIFICAR REGRAS DE SEGURANÇA

#### Firestore Rules

**Passo 1:** Vá para **Firestore Database** → aba **Rules**

**Passo 2:** Verifique se as regras incluem limitações de leitura:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function para limitar queries
    function isValidQuery() {
      return request.query.limit <= 100; // Máximo 100 documentos por query
    }
    
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null && isValidQuery();
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /reviews/{reviewId} {
      allow read: if isValidQuery(); // ⬅️ Limita reads
      allow create: if request.auth != null;
    }
    
    // ... suas outras regras ...
  }
}
```

**Passo 3:** Clique em **Publish** (Publicar)

---

### 3️⃣ ATIVAR FIREBASE PERFORMANCE MONITORING

**Passo 1:** Menu lateral → **Performance Monitoring**

**Passo 2:** Clique em **Get Started**

**Passo 3:** Ative o monitoramento:
- ✅ Enable automatic data collection
- ✅ Enable performance monitoring

**Benefício:** Você verá quais queries estão lentas no dashboard.

---

### 4️⃣ CONFIGURAR BUDGET ALERTS (Alertas de Custo)

**Passo 1:** Menu lateral → **Usage and billing** → **Details & settings**

**Passo 2:** Scroll até **Budget alerts**

**Passo 3:** Clique em **Set budget alert**

**Configuração Recomendada:**
```
Budget name: Monthly Firestore Budget
Budget amount: 10 EUR (ajuste conforme necessário)
Alert thresholds: 50%, 90%, 100%
Email notifications: ✅ Ativo
```

**Por quê?** Evita surpresas na fatura se houver queries ineficientes.

---

### 5️⃣ ATIVAR FIRESTORE INSIGHTS

**Passo 1:** No Firestore Database, clique em **Usage**

**Passo 2:** Analise:
- **Reads:** Quantas leituras por dia?
- **Writes:** Quantas escritas por dia?
- **Deletes:** Quantas deleções por dia?

**Passo 3:** Identifique picos:
- Se tem 10.000+ reads por dia em desenvolvimento = PROBLEMA!
- Deve ter ~500-2000 reads/dia para um site em desenvolvimento

---

### 6️⃣ OTIMIZAR STORAGE (Imagens)

**Passo 1:** Menu lateral → **Storage**

**Passo 2:** Veja o tamanho total usado

**Passo 3:** Se > 1GB, considere:

#### Opção A: Lifecycle Rules (Regras de Ciclo de Vida)
```javascript
// Deletar imagens de produtos vendidos após 90 dias
gsutil lifecycle set lifecycle.json gs://seu-bucket.appspot.com
```

#### Opção B: Comprimir imagens antes do upload
```typescript
// No código, antes do upload:
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Redimensionar para máximo 1200px
        const maxSize = 1200;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

---

### 7️⃣ ATIVAR CACHING NO FIREBASE

**Passo 1:** No código, ative cache persistente:

```typescript
// src/lib/firebase.ts
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

// Substituir getFirestore por:
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: {
      kind: 'persistent'
    }
  })
});
```

**Benefício:** Cache automático no dispositivo do usuário = menos reads.

---

### 8️⃣ MONITORAR LOGS EM TEMPO REAL

**Passo 1:** Menu lateral → **Functions** (se usar) ou **Firestore**

**Passo 2:** Clique em **Logs**

**Passo 3:** Filtre por:
- ⚠️ Erros (errors)
- ⏱️ Queries lentas (> 1 segundo)

---

## 🎯 CHECKLIST DE VERIFICAÇÃO

### ✅ Obrigatório (Fazer Agora)
- [ ] Deploy dos índices compostos
- [ ] Verificar regras de segurança
- [ ] Configurar budget alerts
- [ ] Ativar Performance Monitoring

### ⚠️ Recomendado (Esta Semana)
- [ ] Analisar Firestore Insights
- [ ] Ativar cache persistente no código
- [ ] Otimizar Storage (comprimir imagens)

### 💡 Opcional (Melhorias Futuras)
- [ ] Configurar Lifecycle Rules
- [ ] Monitorar logs regularmente
- [ ] Configurar alertas personalizados

---

## 📊 COMO VERIFICAR SE ESTÁ FUNCIONANDO

### Antes das Otimizações:
```
Firebase Console → Firestore → Usage

Reads por dia: 5.000-10.000 ❌
Writes por dia: 500-1.000 ✅
Custo estimado: $5-10/dia 💰
```

### Depois das Otimizações:
```
Firebase Console → Firestore → Usage

Reads por dia: 500-2.000 ✅
Writes por dia: 500-1.000 ✅
Custo estimado: $0.50-2/dia 💰
```

---

## 🔍 COMANDOS ÚTEIS

### Verificar uso do Firebase:
```bash
# Ver estatísticas de uso
firebase use

# Ver quotas e limites
firebase projects:list
```

### Exportar dados (backup):
```bash
gcloud firestore export gs://seu-bucket/backup
```

### Ver logs em tempo real:
```bash
firebase functions:log
```

---

## ⚠️ ERROS COMUNS E SOLUÇÕES

### Erro: "Index not found"
**Causa:** Índice composto não criado
**Solução:** 
1. Copie o link do erro (Firebase mostra link direto)
2. Clique no link → Cria índice automaticamente
3. Aguarde 5-10 minutos

### Erro: "Permission denied"
**Causa:** Regras de segurança muito restritivas
**Solução:**
1. Vá em Firestore → Rules
2. Verifique se `request.auth != null` está correto
3. Teste com Firebase Emulator Suite

### Erro: "Quota exceeded"
**Causa:** Muitas queries em pouco tempo
**Solução:**
1. Implemente cache (localStorage)
2. Adicione `limit()` em todas as queries
3. Use paginação

---

## 📞 SUPORTE

### Links Úteis:
- **Firebase Console:** https://console.firebase.google.com
- **Documentação Índices:** https://firebase.google.com/docs/firestore/query-data/indexing
- **Pricing Calculator:** https://firebase.google.com/pricing
- **Status Page:** https://status.firebase.google.com

### Comandos de Ajuda:
```bash
firebase help
firebase help deploy
firebase help firestore
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Deploy dos índices** (5 min)
   ```bash
   firebase deploy --only firestore:indexes
   ```

2. **Verificar no console** (2 min)
   - Firebase Console → Firestore → Indexes
   - Status deve mudar de "Building" para "Enabled"

3. **Testar o site** (5 min)
   - Abra o site
   - Verifique se carrega mais rápido
   - Veja o console do navegador (F12)

4. **Monitorar custos** (diário)
   - Firebase Console → Usage and billing
   - Veja se reads diminuíram

---

**Tempo total estimado:** 30-45 minutos (incluindo espera dos índices)

**Impacto esperado:** 60-80% mais rápido + 50-70% menos custo
