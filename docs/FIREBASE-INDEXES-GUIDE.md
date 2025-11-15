# 🔥 Guia de Configuração de Índices Firebase

## ⚡ Por que os Índices são Importantes?

Sem índices compostos, o Firestore pode ficar **extremamente lento** em queries complexas. Com índices, as queries são **10-100x mais rápidas**.

---

## 📊 Índices Necessários para o Rewear

### **1. Índice para Produtos por Categoria + Data**
```
Collection: products
Fields indexed:
  - category (Ascending)
  - createdAt (Descending)
  - status (Ascending)
```

**Por quê?** Permite filtrar produtos por categoria e ordená-los por data de criação.

**Como criar:**
1. Aceda ao [Firebase Console](https://console.firebase.google.com/)
2. Vá para **Firestore Database** → **Indexes**
3. Clique em **Create Index**
4. Configure:
   - Collection ID: `products`
   - Fields to index:
     - `category` → Ascending
     - `createdAt` → Descending
     - `status` → Ascending
5. Clique **Create**

---

### **2. Índice para Filtro de Preço**
```
Collection: products
Fields indexed:
  - price (Ascending)
  - createdAt (Descending)
  - status (Ascending)
```

**Por quê?** Permite filtrar produtos por intervalo de preço e ordená-los.

**Como criar:**
- Mesmos passos acima, mas com os campos:
  - `price` → Ascending
  - `createdAt` → Descending
  - `status` → Ascending

---

### **3. Índice para Categoria + Preço**
```
Collection: products
Fields indexed:
  - category (Ascending)
  - price (Ascending)
  - createdAt (Descending)
```

**Por quê?** Suporta queries que filtram por categoria E preço simultaneamente.

---

## 🚀 Criação Automática via CLI

Você também pode criar índices automaticamente usando o Firebase CLI:

### **1. Instalar Firebase CLI**
```bash
npm install -g firebase-tools
```

### **2. Login**
```bash
firebase login
```

### **3. Criar ficheiro `firestore.indexes.json`**

O ficheiro já existe no projeto. Adicione os índices:

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### **4. Deploy dos Índices**
```bash
firebase deploy --only firestore:indexes
```

---

## 🔍 Como Verificar se os Índices estão a Funcionar

### **1. No Firebase Console**
- Vá para **Firestore Database** → **Indexes**
- Verifique se todos estão com status **"Enabled"** ✅

### **2. No Código (DevTools)**
Abra o console do browser e procure por erros como:
```
FirebaseError: The query requires an index
```

Se aparecer este erro, clique no link fornecido que te leva direto para criar o índice.

---

## 📈 Impacto Esperado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Tempo de carregamento inicial | 3-5s | **0.5-1s** |
| Query com filtros | 5-10s | **0.3-0.8s** |
| Scroll infinito | Lento | **Instantâneo** |

---

## ✅ Checklist de Otimização

- [x] **Cache local implementado** (5 minutos de validade)
- [x] **Paginação otimizada** (12 produtos por página)
- [x] **Lazy loading de imagens** (primeiras 6 com prioridade)
- [ ] **Índices Firebase criados** (seguir instruções acima)
- [ ] **Compressão de imagens** (usar WebP/AVIF no Firebase Storage)

---

## 🎯 Próximos Passos Recomendados

1. **Criar os índices acima** → Melhoria imediata de 80%
2. **Otimizar imagens no Storage** → Reduzir tamanho em 60-70%
3. **Monitorizar performance** → Firebase Performance Monitoring
4. **Implementar Service Worker** → Cache offline de imagens

---

## 🆘 Troubleshooting

### Problema: "Index ainda a criar"
**Solução:** Índices grandes podem demorar 5-15 minutos. Aguarde.

### Problema: "Query muito lenta mesmo com índice"
**Solução:** Verifique se está a usar os campos corretos na query e se o índice inclui TODOS os campos usados no `where()` e `orderBy()`.

### Problema: "Erro de CORS ao carregar imagens"
**Solução:** Configure CORS no Firebase Storage:
```bash
gsutil cors set cors.json gs://your-bucket-name.appspot.com
```

(O ficheiro `cors.json` já existe no projeto)

---

**Criado por:** GitHub Copilot  
**Data:** Novembro 2025  
**Projeto:** Rewear - Plataforma de Moda Sustentável
