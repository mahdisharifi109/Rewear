# 🔒 Guia de Segurança Firebase - Rewear Marketplace

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Regras de Segurança](#regras-de-segurança)
- [Validações Implementadas](#validações-implementadas)
- [Proteção contra Ataques](#proteção-contra-ataques)
- [Boas Práticas](#boas-práticas)
- [Checklist de Segurança](#checklist-de-segurança)

---

## 🎯 Visão Geral

O Rewear implementa **múltiplas camadas de segurança** para proteger os dados dos utilizadores e garantir a integridade do marketplace:

### Camadas de Segurança

```
┌─────────────────────────────────────────┐
│  1. Autenticação (Firebase Auth)        │  ✅ Email/Senha + Google
├─────────────────────────────────────────┤
│  2. Regras Firestore (Servidor)         │  ✅ Validações rigorosas
├─────────────────────────────────────────┤
│  3. Regras Storage (Servidor)           │  ✅ Limite tamanho/tipo
├─────────────────────────────────────────┤
│  4. Validações Cliente (TypeScript)     │  ✅ Feedback imediato
├─────────────────────────────────────────┤
│  5. Rate Limiting (Cloud Functions)     │  🔄 A implementar
└─────────────────────────────────────────┘
```

---

## 🔐 Autenticação

### Métodos Ativos

1. **Email/Senha** ✅
   - Registro com email válido
   - Verificação de email (recomendado ativar)
   - Reset de password

2. **Google OAuth** ✅
   - Login social seguro
   - Dados sincronizados automaticamente

### 🚀 Recomendações de Segurança

#### ✅ Já Implementado
- Autenticação obrigatória para ações críticas
- Token JWT renovado automaticamente
- Logout seguro com limpeza de sessão

#### 🔄 A Implementar

1. **Verificação de Email Obrigatória**
```typescript
// Em auth-context.tsx
const requireEmailVerification = async () => {
  if (!auth.currentUser?.emailVerified) {
    await sendEmailVerification(auth.currentUser);
    throw new Error('Por favor verifique seu email');
  }
};
```

2. **Multi-Factor Authentication (MFA)**
   - Requer upgrade para Blaze plan
   - SMS ou App Authenticator
   - Adiciona camada extra de segurança

3. **Limite de Tentativas de Login**
```typescript
// Rate limiting no cliente
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos
```

---

## 🛡️ Regras de Segurança

### Firestore Rules (firestore.rules)

#### Princípios Implementados

1. **Autenticação Obrigatória**
```javascript
function isAuthenticated() {
  return request.auth != null;
}
```

2. **Ownership Verification**
```javascript
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}
```

3. **Validação de Dados**
```javascript
function isValidProduct() {
  let data = request.resource.data;
  return data.name.size() >= 3 && data.price > 0;
}
```

#### Regras por Coleção

| Coleção | Leitura | Criação | Atualização | Eliminação |
|---------|---------|---------|-------------|------------|
| `products` | 🌍 Pública | ✅ Dono | ✅ Dono | ✅ Dono |
| `users` | 🔒 Próprio | ✅ Próprio | ✅ Próprio | ❌ |
| `reviews` | 🌍 Pública | ✅ Autenticado | ❌ | ❌ |
| `sales` | 🔒 Partes | ✅ Autenticado | ✅ Partes | ❌ |
| `purchases` | 🔒 Partes | ✅ Autenticado | ✅ Partes | ❌ |
| `conversations` | 🔒 Participantes | ✅ Participante | ✅ Participantes | ❌ |
| `messages` | 🔒 Participantes | ✅ Remetente | ❌ | ❌ |
| `notifications` | 🔒 Próprio | ✅ Sistema | ✅ Próprio | ✅ Próprio |
| `wallet_transactions` | 🔒 Próprio | ✅ Sistema | ❌ | ❌ |

### Storage Rules (storage.rules)

#### Validações Implementadas

1. **Tipo de Ficheiro**
```javascript
function isValidImageType() {
  return request.resource.contentType.matches('image/(jpeg|png|webp|gif)');
}
```

2. **Tamanho Máximo**
```javascript
// Produtos: 5MB
request.resource.size < 5 * 1024 * 1024

// Perfis: 2MB
request.resource.size < 2 * 1024 * 1024
```

3. **Ownership**
```javascript
function isOwner(userId) {
  return request.auth.uid == userId;
}
```

---

## ✅ Validações Implementadas

### 1. Validações de Produtos

```typescript
// src/lib/firestore-service.ts
export function validateProduct(product: Partial<Product>): boolean {
  // Nome: 3-100 caracteres
  if (!product.name || product.name.length < 3 || product.name.length > 100) {
    throw new Error('Nome inválido');
  }
  
  // Descrição: 10-2000 caracteres
  if (!product.description || product.description.length < 10) {
    throw new Error('Descrição muito curta');
  }
  
  // Preço: 0.01 - 10000 EUR
  if (!product.price || product.price <= 0 || product.price > 10000) {
    throw new Error('Preço inválido');
  }
  
  // Imagens: 1-10
  if (!product.imageUrls || product.imageUrls.length === 0) {
    throw new Error('Mínimo 1 imagem');
  }
  
  return true;
}
```

### 2. Validações de Utilizadores

```typescript
export function validateUser(user: Partial<AppUser>): boolean {
  // Username: 3-50 caracteres
  // Email: formato válido
  // Favoritos: max 100 produtos
  return true;
}
```

### 3. Validações de Reviews

```typescript
export function validateReview(review: Partial<Review>): boolean {
  // Rating: 1-5 estrelas
  // Comentário: 10-500 caracteres
  // Não pode avaliar a si próprio
  return true;
}
```

---

## 🚨 Proteção contra Ataques

### 1. SQL Injection / NoSQL Injection
✅ **Protegido**: Firestore não é vulnerável a SQL injection  
✅ **Validações**: Tipos TypeScript + validações nas regras

### 2. Cross-Site Scripting (XSS)
✅ **Protegido**: React escapa automaticamente strings  
⚠️ **Cuidado**: Evitar `dangerouslySetInnerHTML`

```tsx
// ✅ SEGURO
<p>{product.description}</p>

// ❌ PERIGOSO
<div dangerouslySetInnerHTML={{ __html: product.description }} />
```

### 3. Cross-Site Request Forgery (CSRF)
✅ **Protegido**: Firebase Auth usa tokens JWT  
✅ **Validação**: Token renovado automaticamente

### 4. Mass Assignment
✅ **Protegido**: Validações nas regras Firestore  
✅ **Whitelist**: Apenas campos permitidos

```javascript
// firestore.rules - Exemplo
allow update: if request.resource.data.keys().hasAll(['name', 'price'])
              && !request.resource.data.keys().hasAny(['userId', 'createdAt']);
```

### 5. Brute Force / Credential Stuffing
⚠️ **A Implementar**: Rate limiting no login

```typescript
// Recomendação: Cloud Function
export const loginRateLimiter = functions.https.onCall(async (data, context) => {
  const ip = context.rawRequest.ip;
  const attempts = await getLoginAttempts(ip);
  
  if (attempts > 5) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Muitas tentativas. Tente novamente em 15 minutos.'
    );
  }
});
```

### 6. File Upload Attacks
✅ **Protegido**: Validações nas Storage Rules
- Apenas imagens JPEG/PNG/WebP/GIF
- Limite de tamanho (5MB produtos, 2MB perfis)
- Ownership verificado

### 7. Data Scraping
⚠️ **Risco Moderado**: Produtos são públicos (marketplace)

**Mitigações**:
- Rate limiting nas queries (Cloud Functions)
- Paginação obrigatória
- Captcha em ações sensíveis (futuro)

---

## 📝 Boas Práticas

### ✅ DO's (Fazer)

1. **Sempre Validar no Servidor E Cliente**
   - Cliente: UX melhor (feedback imediato)
   - Servidor: Segurança (nunca confiar no cliente)

2. **Usar Operações Atómicas (Batch)**
```typescript
// ✅ CORRETO: Transação atómica
const batch = writeBatch(db);
batch.set(saleRef, saleData);
batch.update(productRef, { status: 'vendido' });
await batch.commit();

// ❌ ERRADO: Operações separadas (pode falhar parcialmente)
await setDoc(saleRef, saleData);
await updateDoc(productRef, { status: 'vendido' });
```

3. **Limitar Arrays**
```typescript
// firestore.rules
allow update: if request.resource.data.favorites.size() <= 100;
```

4. **Sanitizar Inputs**
```typescript
const sanitizeInput = (text: string) => {
  return text.trim().replace(/[<>]/g, '');
};
```

5. **Usar Timestamps do Servidor**
```typescript
// ✅ CORRETO
createdAt: serverTimestamp()

// ❌ ERRADO (cliente pode manipular)
createdAt: new Date()
```

### ❌ DON'Ts (Evitar)

1. ❌ **Nunca armazenar senhas no Firestore**
   - Firebase Auth gerencia senhas com segurança

2. ❌ **Nunca expor API keys sensíveis**
```typescript
// ❌ ERRADO
const STRIPE_SECRET_KEY = "sk_live_..."; // NO FRONTEND!

// ✅ CORRETO: usar Cloud Functions
```

3. ❌ **Nunca confiar apenas no cliente**
```typescript
// ❌ ERRADO: validação apenas no cliente
if (price > 0) { await createProduct(...) }

// ✅ CORRETO: validação também nas regras
// firestore.rules: && request.resource.data.price > 0
```

4. ❌ **Nunca usar `allow read, write: if true;` em dados privados**

5. ❌ **Nunca fazer queries sem índices**
   - Configura em `firestore.indexes.json`

---

## 📋 Checklist de Segurança

### Fase Atual (Implementado) ✅

- [x] Autenticação Email/Senha
- [x] Autenticação Google OAuth
- [x] Regras Firestore com validações
- [x] Regras Storage com limites
- [x] Validações TypeScript no cliente
- [x] Operações atómicas (batch)
- [x] Ownership verification
- [x] Tipos de ficheiro restritos
- [x] Limites de tamanho
- [x] Histórico imutável (vendas/compras)

### Próxima Fase (Recomendado) 🔄

- [ ] Verificação de email obrigatória
- [ ] Rate limiting (Cloud Functions)
- [ ] Captcha em registro/login
- [ ] Sistema de denúncias
- [ ] Moderação de imagens (Cloud Vision API)
- [ ] Logging de ações suspeitas
- [ ] Backup automático diário
- [ ] Monitoramento de quotas
- [ ] Alertas de segurança

### Fase Avançada (Futuro) 🚀

- [ ] Multi-Factor Authentication (MFA)
- [ ] IP whitelisting para admin
- [ ] Análise de comportamento suspeito
- [ ] Encriptação de dados sensíveis
- [ ] Auditoria de segurança externa
- [ ] Conformidade GDPR completa
- [ ] Bug bounty program

---

## 🚀 Como Testar a Segurança

### 1. Testar Regras Firestore

```bash
# Instalar Firebase emulators
npm install -g firebase-tools

# Iniciar emuladores
firebase emulators:start --only firestore

# Testar regras
firebase emulators:exec --only firestore "npm test"
```

### 2. Testar Autenticação

```typescript
// Tentar criar produto sem login
// Deve FALHAR com erro de autenticação

// Tentar editar produto de outro utilizador
// Deve FALHAR com permissão negada

// Tentar avaliar a si próprio
// Deve FALHAR com validação
```

### 3. Testar Upload de Ficheiros

```typescript
// Tentar upload de .exe
// Deve FALHAR

// Tentar upload de imagem > 5MB
// Deve FALHAR

// Tentar upload na pasta de outro utilizador
// Deve FALHAR
```

---

## 📚 Recursos Úteis

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Security Checklist](https://firebase.google.com/docs/rules/security-checklist)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Auth Best Practices](https://firebase.google.com/docs/auth/security)

---

## 🆘 Em Caso de Incidente

### Passos Imediatos

1. **Suspender acesso**
   - Desativar autenticação temporariamente
   - Revogar tokens comprometidos

2. **Investigar**
   - Consultar logs do Firebase Console
   - Identificar origem do ataque

3. **Corrigir**
   - Atualizar regras de segurança
   - Fazer deploy imediato

4. **Notificar**
   - Informar utilizadores afetados
   - Reportar ao Firebase Support (se Blaze plan)

### Contactos de Emergência
- Firebase Support: https://firebase.google.com/support
- Email Equipa: [seu-email@rewear.com]

---

**Última Atualização**: 16 de Novembro de 2025  
**Responsável**: Equipa Rewear  
**Próxima Revisão**: Dezembro 2025
