# 📊 Esquema da Base de Dados Firestore - Rewear Marketplace

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Coleções Principais](#coleções-principais)
- [Estrutura de Dados](#estrutura-de-dados)
- [Relacionamentos](#relacionamentos)
- [Índices Firestore](#índices-firestore)
- [Regras de Segurança](#regras-de-segurança)
- [Boas Práticas](#boas-práticas)
- [Limites e Quotas](#limites-e-quotas)

---

## 🎯 Visão Geral

O Rewear utiliza **Firebase Firestore** como base de dados NoSQL para armazenar todos os dados da aplicação. A estrutura foi desenhada para:

- ✅ **Escalabilidade**: Suportar milhares de produtos e utilizadores
- ✅ **Performance**: Queries otimizadas com índices compostos
- ✅ **Segurança**: Regras rigorosas de acesso baseadas em autenticação
- ✅ **Integridade**: Validação de dados nas regras de segurança

**Plano Atual**: Spark (Gratuito)
- 1 GB armazenamento
- 50K leituras/dia
- 20K escritas/dia
- 20K eliminações/dia

---

## 📦 Coleções Principais

### 1. **`products`** - Produtos do Marketplace

Armazena todos os artigos de moda disponíveis para venda.

```typescript
interface Product {
  // Identificação
  id: string;                    // Auto-gerado pelo Firestore
  
  // Informações Básicas
  name: string;                  // Nome do produto (min: 3 chars)
  description: string;           // Descrição detalhada
  price: number;                 // Preço em EUR (> 0)
  condition: 'Novo' | 'Muito bom' | 'Bom';
  category: 'Roupa' | 'Calçado' | 'Livros' | 'Eletrónica' | 'Outro';
  status: 'disponível' | 'vendido';  // Estado da venda
  
  // Características
  brand?: string;                // Marca do artigo
  sizes?: string[];              // Tamanhos disponíveis (ex: ["S", "M"])
  color?: string;                // Cor principal
  material?: string;             // Material (ex: "Algodão")
  location?: string;             // Cidade/região
  
  // Imagens
  imageUrls: string[];           // URLs das imagens (min: 1)
  imageHint: string;             // Texto ALT para acessibilidade
  
  // Vendedor
  userId: string;                // UID do vendedor (indexado)
  userName: string;              // Nome do vendedor
  userEmail: string;             // Email do vendedor
  
  // Metadados
  quantity: number;              // Quantidade disponível
  isVerified?: boolean;          // Produto verificado por admin
  createdAt: Timestamp;          // Data de criação
  updatedAt?: Timestamp;         // Última atualização
}
```

**Índices Compostos**:
- `status + createdAt` (listagem principal)
- `status + category + createdAt` (filtro por categoria)
- `status + price + createdAt` (filtro por preço)
- `status + userId + createdAt` (produtos do vendedor)

---

### 2. **`users`** - Perfis de Utilizadores

Perfil completo de cada utilizador registado.

```typescript
interface User {
  // Identificação (UID = userId do Firebase Auth)
  uid: string;
  
  // Informações Pessoais
  username: string;              // Nome de exibição
  email: string;                 // Email (sincronizado com Auth)
  bio?: string;                  // Biografia do perfil
  location?: string;             // Localização (cidade)
  phone?: string;                // Telefone de contacto
  photoURL?: string;             // URL da foto de perfil
  
  // Preferências de Compra
  favorites: string[];           // IDs dos produtos favoritos (array)
  preferredBrands?: string[];    // Marcas favoritas
  preferredSizes?: string[];     // Tamanhos preferidos
  
  // Carteira Digital
  walletBalance?: number;        // [LEGACY] Saldo total
  wallet?: {
    available: number;           // Saldo disponível para levantar
    pending: number;             // Saldo pendente (aguarda confirmação)
  };
  iban?: string;                 // IBAN para levantamentos
  
  // Metadados
  createdAt: Timestamp;          // Data de registo
}
```

**Segurança**: Cada utilizador só pode ler/escrever o seu próprio documento.

---

### 3. **`reviews`** - Avaliações de Vendedores

Sistema de reputação baseado em avaliações de compradores.

```typescript
interface Review {
  id: string;
  
  // Participantes
  sellerId: string;              // UID do vendedor avaliado (indexado)
  buyerId: string;               // UID do comprador que avaliou
  buyerName: string;             // Nome do comprador
  
  // Avaliação
  rating: number;                // 1-5 estrelas
  comment: string;               // Comentário escrito
  
  // Metadados
  createdAt: Timestamp;          // Data da avaliação
}
```

**Índice**: `sellerId + createdAt` para listar reviews de um vendedor.

---

### 4. **`sales`** - Histórico de Vendas

Registo de todas as vendas concluídas (perspetiva do vendedor).

```typescript
interface Sale {
  id: string;
  
  // Produto Vendido
  productId: string;             // ID do produto vendido
  productName: string;           // Nome do produto
  price: number;                 // Preço de venda
  
  // Participantes
  sellerId: string;              // UID do vendedor (indexado)
  buyerId: string;               // UID do comprador
  buyerName: string;             // Nome do comprador
  
  // Status
  status: 'pendente' | 'confirmado' | 'cancelado';
  
  // Metadados
  date: Timestamp;               // Data da venda
}
```

**Índice**: `sellerId + date` para histórico ordenado.

---

### 5. **`purchases`** - Histórico de Compras

Registo de todas as compras (perspetiva do comprador).

```typescript
interface Purchase {
  id: string;
  
  // Produto Comprado
  productId: string;             // ID do produto
  productName: string;           // Nome do produto
  price: number;                 // Preço pago
  
  // Participantes
  buyerId: string;               // UID do comprador (indexado)
  sellerId: string;              // UID do vendedor
  sellerName: string;            // Nome do vendedor
  
  // Status
  status: 'pendente' | 'confirmado' | 'cancelado';
  
  // Metadados
  date: Timestamp;               // Data da compra
}
```

**Índice**: `buyerId + date` para histórico ordenado.

---

### 6. **`wallet_transactions`** - Transações da Carteira

Todas as movimentações financeiras na carteira digital.

```typescript
interface WalletTransaction {
  id: string;
  
  // Transação
  userId: string;                // UID do utilizador (indexado)
  type: 'venda' | 'compra' | 'levantamento' | 'ajuste' | 'taxa' | 'bonus';
  amount: number;                // Valor (positivo = crédito, negativo = débito)
  description: string;           // Descrição da transação
  
  // Status
  status: 'pendente' | 'confirmado' | 'cancelado';
  
  // Relacionamentos
  relatedProductId?: string;     // Produto relacionado (se aplicável)
  relatedSaleId?: string;        // ID da venda relacionada
  
  // Metadados
  createdAt: Timestamp;          // Data da transação
}
```

**Índice**: `userId + createdAt` para histórico financeiro.

---

### 7. **`conversations`** - Conversas entre Utilizadores

Sistema de mensagens privadas entre compradores e vendedores.

```typescript
interface Conversation {
  id: string;
  
  // Participantes
  participantIds: string[];      // [buyerId, sellerId] - indexado como array
  participants: {
    [uid: string]: {
      name: string;              // Nome do participante
      avatar: string;            // URL do avatar
    }
  };
  
  // Última Mensagem (desnormalizada para performance)
  lastMessage?: {
    text: string;                // Texto da última mensagem
    createdAt: Timestamp;        // Data da última mensagem
  };
  
  // Contexto (opcional)
  product?: {
    id: string;                  // Produto sobre o qual conversam
    name: string;                // Nome do produto
    image: string;               // Imagem do produto
  };
  
  // Metadados
  createdAt: Timestamp;          // Data de início da conversa
}
```

**Subcoleção**: `conversations/{conversationId}/messages`

```typescript
interface Message {
  id: string;
  
  // Conteúdo
  senderId: string;              // UID do remetente
  text: string;                  // Texto da mensagem
  
  // Metadados
  createdAt: Timestamp;          // Data de envio
}
```

**Índice**: `participantIds (array) + lastMessage.createdAt` para listar conversas.

---

### 8. **`notifications`** - Notificações do Sistema

Notificações push para os utilizadores.

```typescript
interface Notification {
  id: string;
  
  // Destinatário
  userId: string;                // UID do utilizador (indexado)
  
  // Conteúdo
  message: string;               // Texto da notificação
  link: string;                  // URL de destino (ex: "/inbox/123")
  
  // Estado
  read: boolean;                 // Se foi lida (default: false)
  
  // Metadados
  createdAt: Timestamp;          // Data de criação
}
```

**Índice**: `userId + createdAt` para listar notificações.

---

## 🔗 Relacionamentos

### Diagrama de Relacionamentos

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │
       ├─── 1:N ──→ products (userId)
       ├─── 1:N ──→ reviews (buyerId / sellerId)
       ├─── 1:N ──→ sales (sellerId)
       ├─── 1:N ──→ purchases (buyerId)
       ├─── 1:N ──→ wallet_transactions (userId)
       ├─── 1:N ──→ notifications (userId)
       └─── N:M ──→ conversations (participantIds)

┌─────────────┐
│  products   │
└──────┬──────┘
       │
       ├─── 1:N ──→ sales (productId)
       ├─── 1:N ──→ purchases (productId)
       └─── 1:1 ──→ conversations.product (opcional)
```

---

## 🚀 Índices Firestore

Os índices compostos são **essenciais** para queries complexas. Já estão configurados em `firestore.indexes.json`:

### Índices Críticos

1. **Listagem Principal de Produtos**
   ```
   status ASC + createdAt DESC
   ```
   → Mostra produtos disponíveis ordenados por data

2. **Filtro por Categoria**
   ```
   status ASC + category ASC + createdAt DESC
   ```
   → Filtrar por categoria mantendo ordenação

3. **Filtro por Preço**
   ```
   status ASC + price ASC + createdAt DESC
   ```
   → Ordenar por preço e data

4. **Produtos do Vendedor**
   ```
   status ASC + userId ASC + createdAt DESC
   ```
   → Dashboard do vendedor

5. **Conversas do Utilizador**
   ```
   participantIds ARRAY_CONTAINS + lastMessage.createdAt DESC
   ```
   → Listar conversas ordenadas pela última mensagem

---

## 🔒 Regras de Segurança

### Princípios de Segurança

1. ✅ **Autenticação Obrigatória** para escritas
2. ✅ **Validação de Dados** nos campos críticos
3. ✅ **Ownership Verification** (apenas o dono edita)
4. ✅ **Leitura Pública** para produtos (marketplace)
5. ✅ **Privacidade** em dados pessoais

### Regras Implementadas

```javascript
// PRODUCTS: Leitura pública, escrita apenas do dono
match /products/{productId} {
  allow read: if true;  // Marketplace público
  allow create: if request.auth.uid == request.resource.data.userId
                && request.resource.data.price > 0
                && request.resource.data.name.size() >= 3;
  allow update, delete: if request.auth.uid == resource.data.userId;
}

// USERS: Cada utilizador só acede aos seus dados
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// REVIEWS: Criar requer autenticação, ler é público
match /reviews/{reviewId} {
  allow read: if true;
  allow create: if request.auth != null;
}

// CONVERSATIONS: Apenas participantes acedem
match /conversations/{conversationId} {
  allow read, write: if request.auth.uid in resource.data.participantIds;
}
```

Ver `firestore.rules` para regras completas.

---

## 📝 Boas Práticas

### ✅ DO's (Fazer)

1. **Desnormalizar Dados Frequentes**
   - Guardar `userName` nos produtos (evita JOIN)
   - Guardar `lastMessage` nas conversas

2. **Usar Índices para Queries Complexas**
   - Sempre criar índice para múltiplos `where()` + `orderBy()`

3. **Limitar Tamanho de Arrays**
   - `favorites`: max 100 produtos
   - `imageUrls`: max 10 imagens

4. **Usar Batch Writes** para operações atómicas
   ```typescript
   const batch = writeBatch(db);
   batch.set(productRef, productData);
   batch.update(userRef, { walletBalance: increment(price) });
   await batch.commit();
   ```

5. **Validar no Cliente E no Servidor**
   - Cliente: UX melhor (feedback imediato)
   - Servidor: Segurança (regras do Firestore)

### ❌ DON'Ts (Evitar)

1. ❌ **Não fazer queries sem índices** (erro no Firestore)
2. ❌ **Não armazenar dados sensíveis** (cartões de crédito, passwords)
3. ❌ **Não usar arrays gigantes** (limite: 1MB por documento)
4. ❌ **Não fazer mais de 1 write/segundo no mesmo documento**
5. ❌ **Não expor API keys no código frontend** (usar Firebase Config)

---

## 📊 Limites e Quotas (Plano Spark)

### Firestore

| Recurso | Limite Diário | Observações |
|---------|---------------|-------------|
| Leituras | 50,000 | ~1,666 produtos vistos (30 produtos/página) |
| Escritas | 20,000 | Criar/editar/apagar produtos + mensagens |
| Eliminações | 20,000 | Apagar produtos antigos |
| Armazenamento | 1 GB | Metadados dos documentos (~1 milhão de produtos) |
| Largura de Banda | 10 GB/mês | Downloads de dados |

### Storage (Imagens)

| Recurso | Limite | Observações |
|---------|--------|-------------|
| Armazenamento | 5 GB | ~5,000 produtos (1MB/produto) |
| Downloads | 1 GB/dia | ~1,000 visualizações de produtos |
| Uploads | 1 GB/dia | ~200 produtos criados/dia |

### Recomendações para Otimizar Quotas

1. **Cache no Cliente** (localStorage/IndexedDB)
   - Produtos visitados recentemente
   - Perfil do utilizador

2. **Imagens Otimizadas**
   - WebP format (50% menor que JPEG)
   - Thumbnails para listagens (150x150px)
   - Lazy loading

3. **Paginação**
   - 12-24 produtos por página
   - Carregamento incremental

4. **Queries Eficientes**
   - Usar `limit()` sempre
   - Evitar queries desnecessárias

---

## 🚀 Próximos Passos

### Fase 1: Segurança Avançada
- [ ] Implementar rate limiting (Cloud Functions)
- [ ] Adicionar verificação de email obrigatória
- [ ] Sistema de denúncias de produtos
- [ ] Moderação de conteúdo (imagens)

### Fase 2: Funcionalidades Premium
- [ ] Sistema de badges verificados
- [ ] Analytics de vendas (dashboard vendedor)
- [ ] Sistema de cupões/descontos
- [ ] Programa de fidelidade

### Fase 3: Escalabilidade
- [ ] Migrar para Blaze (pay-as-you-go)
- [ ] Implementar Cloud Functions para processamento assíncrono
- [ ] Adicionar Algolia para search avançada
- [ ] CDN para imagens (Firebase Storage + CloudFlare)

---

## 📚 Recursos Úteis

- [Documentação Firestore](https://firebase.google.com/docs/firestore)
- [Regras de Segurança](https://firebase.google.com/docs/firestore/security/get-started)
- [Índices Compostos](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Boas Práticas](https://firebase.google.com/docs/firestore/best-practices)
- [Limites e Quotas](https://firebase.google.com/docs/firestore/quotas)

---

**Última Atualização**: 16 de Novembro de 2025  
**Autor**: Equipa Rewear  
**Versão**: 1.0
