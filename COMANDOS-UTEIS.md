# 🛠️ Comandos Úteis - Rewear

## 📦 Instalação e Setup

```bash
# Instalar dependências
npm install

# Copiar e configurar variáveis de ambiente
cp .env.example .env.local
# Depois edite .env.local com suas credenciais
```

## 🚀 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento (porta 3000)
npm run dev

# Iniciar em porta específica
npm run dev:3000
npm run dev:port  # porta 3001
```

## 🏗️ Build e Produção

```bash
# Criar build de produção
npm run build

# Analisar tamanho do bundle
npm run build:analyze

# Iniciar servidor de produção
npm run start

# Verificar erros de linting
npm run lint
```

## 🗄️ Firebase

```bash
# Login no Firebase
firebase login

# Inicializar Firebase (se necessário)
firebase init

# Deploy de regras do Firestore
firebase deploy --only firestore:rules

# Deploy de regras do Storage
firebase deploy --only storage

# Deploy de indexes do Firestore
firebase deploy --only firestore:indexes

# Deploy completo (hosting + rules)
firebase deploy

# Ver logs do Firebase
firebase functions:log
```

## 🌱 Seed e Scripts

```bash
# Popular banco com produtos de exemplo
npm run seed

# Migrar imagens (se necessário)
npm run migrate:images

# Verificar links quebrados
npm run check:links

# Verificar links em dev
npm run check:links:dev
```

## 🔍 Análise e Debug

```bash
# Lighthouse performance test
npm run lighthouse

# Verificar bundle size
npm run build:analyze

# Ver estrutura do build
npm run build
ls -la .next/static

# Limpar cache do Next.js
rm -rf .next
npm run dev
```

## 📊 Testes e Qualidade

```bash
# Executar linting
npm run lint

# Auto-fix de problemas de lint
npm run lint --fix

# Verificar tipos TypeScript
npx tsc --noEmit
```

## 🐳 Docker (Opcional)

```bash
# Build da imagem
docker build -t rewear .

# Executar container
docker run -p 3000:3000 rewear

# Docker compose
docker-compose up
```

## 🌐 Variáveis de Ambiente

```bash
# Verificar se .env.local existe
ls -la .env.local

# Verificar variáveis (sem mostrar valores)
grep "NEXT_PUBLIC_" .env.local | cut -d'=' -f1
```

## 🔧 Troubleshooting

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpar cache do Next.js
rm -rf .next

# Limpar cache do npm
npm cache clean --force

# Verificar versão do Node
node --version  # Deve ser 18+

# Verificar versão do npm
npm --version
```

## 📱 Testar em Rede Local

```bash
# Iniciar servidor acessível na rede local
npm run dev -- -H 0.0.0.0

# Encontrar seu IP local (Windows)
ipconfig

# Encontrar seu IP local (Mac/Linux)
ifconfig

# Depois acesse: http://[seu-ip]:3000
```

## 🚢 Deploy

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Firebase Hosting
```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting

# Preview
firebase hosting:channel:deploy preview
```

## 📊 Monitoramento

```bash
# Ver logs do Next.js em produção (Vercel)
vercel logs [deployment-url]

# Ver logs do Firebase
firebase functions:log --only [function-name]
```

## 🔐 Segurança

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades automáticas
npm audit fix

# Atualizar dependências com cuidado
npm update

# Verificar dependências desatualizadas
npm outdated
```

## 🎨 Estilo e Formatação

```bash
# Se usar Prettier
npx prettier --write .

# Verificar formatação
npx prettier --check .
```

## 📦 Gestão de Dependências

```bash
# Adicionar dependência
npm install [package-name]

# Adicionar dependência de desenvolvimento
npm install -D [package-name]

# Remover dependência
npm uninstall [package-name]

# Listar dependências instaladas
npm list --depth=0

# Verificar versões das dependências principais
npm list next react firebase
```

## 🔄 Git (Boas Práticas)

```bash
# Commit com mensagem descritiva
git add .
git commit -m "feat: adiciona sistema de notificações"

# Push para branch
git push origin main

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Ver status
git status

# Ver diferenças
git diff
```

## 💡 Comandos Úteis do PowerShell (Windows)

```powershell
# Verificar processos na porta 3000
netstat -ano | findstr :3000

# Matar processo na porta
taskkill /PID [PID] /F

# Limpar terminal
cls

# Ver variáveis de ambiente
Get-ChildItem Env:
```

## 📚 Recursos Adicionais

```bash
# Documentação Next.js
open https://nextjs.org/docs

# Documentação Firebase
open https://firebase.google.com/docs

# Documentação Tailwind
open https://tailwindcss.com/docs

# Shadcn/ui Components
open https://ui.shadcn.com
```

## 🎯 Atalhos Recomendados

Adicione ao seu `package.json` na seção scripts:

```json
{
  "scripts": {
    "clean": "rm -rf .next node_modules",
    "fresh": "npm run clean && npm install && npm run dev",
    "type-check": "tsc --noEmit",
    "deploy:firebase": "npm run build && firebase deploy",
    "deploy:vercel": "vercel --prod"
  }
}
```

---

## 🚨 Comandos de Emergência

```bash
# Se o projeto não iniciar
rm -rf .next node_modules package-lock.json
npm install
npm run dev

# Se houver erros de tipos
npx tsc --noEmit
# Corrija os erros mostrados

# Se o Firebase não conectar
# Verifique .env.local
cat .env.local | grep FIREBASE

# Se o build falhar
rm -rf .next
npm run build
# Veja os erros e corrija
```

---

**Dica**: Guarde este arquivo como referência rápida! 📌

**Última atualização**: 15/11/2025
