# 🚀 Guia de Configuração Rápida - Rewear

## Passos para Executar o Projeto

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e preencha com suas credenciais:
```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais do Firebase:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### 3. Configurar Firebase

#### a) Firestore Database
Crie as seguintes coleções:
- `users`
- `products`
- `purchases`
- `sales`
- `notifications`
- `wallet_transactions`

#### b) Firestore Rules
Implemente as regras de segurança em `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Purchases collection
    match /purchases/{purchaseId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.buyerId || 
         request.auth.uid == resource.data.sellerId);
      allow create: if request.auth != null;
    }
    
    // Sales collection
    match /sales/{saleId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.buyerId || 
         request.auth.uid == resource.data.sellerId);
      allow create: if request.auth != null;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Wallet transactions
    match /wallet_transactions/{transactionId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

#### c) Storage Rules
Atualize as regras de Storage em `storage.rules`:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.resource.size < 5 * 1024 * 1024 &&
        request.resource.contentType.matches('image/.*');
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 2 * 1024 * 1024 &&
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

#### d) Authentication
No Firebase Console:
1. Vá para **Authentication** > **Sign-in method**
2. Ative **Email/Password**
3. (Opcional) Ative outros provedores (Google, Facebook)

#### e) Indexes (Firestore)
Execute os seguintes comandos ou crie via console:
```bash
firebase deploy --only firestore:indexes
```

Os indexes necessários estão em `firestore.indexes.json`.

### 4. Executar em Desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:3000

### 5. Testar o Build de Produção
```bash
npm run build
npm run start
```

### 6. (Opcional) Seed de Dados
Para popular o banco com produtos de exemplo:
```bash
npm run seed
```

---

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linting
- `npm run seed` - Popula banco com dados de exemplo
- `npm run build:analyze` - Analisa tamanho do bundle

---

## ✅ Checklist Pré-Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Regras do Firestore implementadas
- [ ] Regras do Storage implementadas
- [ ] Authentication ativada
- [ ] Indexes criados
- [ ] Domínio adicionado ao Firebase Auth
- [ ] Testado em local
- [ ] Build de produção sem erros
- [ ] Verificado lighthouse report

---

## 🐛 Troubleshooting

### Erro: "Firebase app already initialized"
**Solução**: Reinicie o servidor de desenvolvimento

### Erro: "Permission denied" no Firestore
**Solução**: Verifique as regras do Firestore e se o usuário está autenticado

### Erro: "Missing environment variables"
**Solução**: Verifique se `.env.local` existe e tem todas as variáveis

### Erro: "CORS" ao fazer upload de imagens
**Solução**: Configure CORS no Firebase Storage usando `cors.json`

### Build muito lento
**Solução**: 
```bash
npm run build:analyze
```
Para ver o que está aumentando o bundle.

---

## 📱 Testar em Dispositivos Móveis

Para testar em dispositivos da mesma rede:
```bash
npm run dev -- -H 0.0.0.0
```

Depois acesse via: `http://[seu-ip-local]:3000`

---

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

---

## 📚 Documentação Adicional

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)

---

**Última atualização**: 15/11/2025
