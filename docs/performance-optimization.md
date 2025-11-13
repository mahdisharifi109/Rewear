# 🚀 Guia de Otimização de Performance - Rewear

## ✅ Otimizações Implementadas

### 1. **Next.js Configuration (`next.config.ts`)**
- ✅ Compressão habilitada (`compress: true`)
- ✅ Formatos modernos de imagem (AVIF, WebP)
- ✅ SWC minifier para build mais rápido
- ✅ Tree-shaking otimizado para lucide-react, recharts, radix-ui
- ✅ Remoção de console.logs em produção
- ✅ Headers de cache otimizados (1 ano para assets estáticos)
- ✅ DNS prefetch e segurança (X-Frame-Options)

### 2. **Lazy Loading**
- ✅ **Vídeo promocional**: Carrega apenas quando visível (IntersectionObserver)
- ✅ **ProductCard**: Dynamic import com skeleton de loading
- ✅ **Recharts** (SellerDashboard): Dynamic import para evitar SSR
- ✅ Imagens com `loading="lazy"` e `fetchPriority="low"`

### 3. **Contextos Otimizados**
- ✅ `AuthContext`: useMemo no value do contexto
- ✅ `CartContext`: useMemo para cartCount, subtotal, total
- ✅ `ProductContext`: useMemo no value + callbacks memoizados

### 4. **ProductGrid Performance**
- ✅ Debounce no scroll infinito (150ms)
- ✅ IntersectionObserver com rootMargin=600px e threshold=0.1
- ✅ Cleanup de timeouts ao desmontar
- ✅ Memoização de hasActiveFilters e showLoadMore

### 5. **Firestore Indexes**
- ✅ Índices compostos otimizados para queries com múltiplos filtros
- ✅ Índices para status + category + price + createdAt
- ✅ Paginação eficiente (PRODUCTS_PER_PAGE = 8)

### 6. **Bundle Optimization**
- ✅ React.memo em ProductCard
- ✅ Dynamic imports para componentes pesados
- ✅ optimizePackageImports no next.config.ts

---

## 📊 Métricas Esperadas

### Antes das Otimizações (Estimativa)
- **First Contentful Paint (FCP)**: ~2.5s
- **Largest Contentful Paint (LCP)**: ~4.0s
- **Time to Interactive (TTI)**: ~5.5s
- **Total Blocking Time (TBT)**: ~600ms
- **Bundle Size**: ~1.2MB (JS total)

### Depois das Otimizações (Esperado)
- **First Contentful Paint (FCP)**: ~1.2s ⬇️ 52%
- **Largest Contentful Paint (LCP)**: ~2.0s ⬇️ 50%
- **Time to Interactive (TTI)**: ~3.0s ⬇️ 45%
- **Total Blocking Time (TBT)**: ~250ms ⬇️ 58%
- **Bundle Size**: ~800KB ⬇️ 33%

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
# Modo dev normal
npm run dev

# Build de produção
npm run build

# Build com análise de bundle
npm run build:analyze

# Verificar tipos sem build
npm run typecheck
```

### Análise de Performance
```bash
# Lighthouse (instalar globalmente: npm i -g lighthouse)
npm run lighthouse

# Ou use o Chrome DevTools:
# 1. Abra DevTools (F12)
# 2. Aba "Lighthouse"
# 3. Selecione "Performance" e "Desktop"
# 4. Clique em "Analyze page load"
```

### Análise de Bundle
```bash
# Instalar @next/bundle-analyzer
npm install --save-dev @next/bundle-analyzer

# Adicionar ao next.config.ts:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(nextConfig)

# Executar análise
npm run build:analyze
```

---

## 🎯 Recomendações Adicionais

### 1. **CDN para Assets Estáticos**
```typescript
// next.config.ts
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.seudominio.com' 
    : undefined,
}
```

### 2. **Service Worker / PWA** (Opcional)
```bash
npm install next-pwa
```

```typescript
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA(nextConfig)
```

### 3. **Preload de Recursos Críticos**
```tsx
// src/app/layout.tsx
<head>
  <link
    rel="preload"
    href="/fonts/lora.woff2"
    as="font"
    type="font/woff2"
    crossOrigin="anonymous"
  />
</head>
```

### 4. **React Profiler para Debugging**
```tsx
import { Profiler } from 'react';

<Profiler id="ProductGrid" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}}>
  <ProductGrid />
</Profiler>
```

### 5. **Firestore Offline Persistence**
```typescript
// lib/firebase.ts
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence disabled');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser doesn\'t support persistence');
  }
});
```

### 6. **Image Optimization com Cloudinary/ImageKit** (Alternativa)
```bash
npm install next-cloudinary
```

```tsx
import { CldImage } from 'next-cloudinary';

<CldImage
  src="public_id"
  width={500}
  height={500}
  crop="fill"
  quality="auto"
  format="auto"
/>
```

---

## 📈 Monitoramento Contínuo

### Google Lighthouse CI
```bash
npm install --save-dev @lhci/cli

# Criar lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

### Vercel Speed Insights (se usar Vercel)
```bash
npm install @vercel/speed-insights

# Em layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Firebase Performance Monitoring
```typescript
// lib/firebase.ts
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);

// Trace personalizado
const trace = perf.trace('load_products');
trace.start();
// ... código
trace.stop();
```

---

## 🐛 Debugging de Performance

### 1. **React DevTools Profiler**
- Instale a extensão React DevTools
- Aba "Profiler" → Grave interações
- Identifique componentes lentos

### 2. **Chrome DevTools Performance**
- F12 → Aba "Performance"
- Grave 3-5 segundos de interação
- Analise:
  - Long tasks (>50ms)
  - Layout shifts
  - Paint/Composite

### 3. **Network Waterfall**
- F12 → Aba "Network"
- Disable cache
- Verifique:
  - Ordem de carregamento
  - Recursos bloqueantes
  - Tamanho de payloads

---

## 🎨 Web Vitals Alvo (Google)

| Métrica | Bom | Precisa Melhorar | Ruim |
|---------|-----|------------------|------|
| **LCP** | ≤2.5s | 2.5s-4.0s | >4.0s |
| **FID** | ≤100ms | 100ms-300ms | >300ms |
| **CLS** | ≤0.1 | 0.1-0.25 | >0.25 |
| **FCP** | ≤1.8s | 1.8s-3.0s | >3.0s |
| **TTFB** | ≤800ms | 800ms-1800ms | >1800ms |

---

## 📝 Checklist de Performance para PRs

- [ ] Componentes pesados usam React.memo?
- [ ] Imagens usam next/image com lazy loading?
- [ ] Contextos têm useMemo no value?
- [ ] Queries Firestore estão otimizadas (índices)?
- [ ] Componentes críticos evitam re-renders desnecessários?
- [ ] Bundle size não aumentou >10% sem justificativa?
- [ ] Lighthouse score > 90 em Performance?
- [ ] Scroll infinito usa IntersectionObserver?
- [ ] Vídeos/recursos pesados carregam via lazy loading?
- [ ] Fonts estão preloadadas?

---

## 🚀 Próximos Passos

1. **Testar em produção**: `npm run build && npm start`
2. **Rodar Lighthouse**: `npm run lighthouse`
3. **Analisar bundle**: `npm run build:analyze`
4. **Monitorar métricas**: Firebase Performance / Vercel Analytics
5. **Iterar**: Identificar novos gargalos e otimizar

---

**Documentação criada em**: Novembro 2025
**Última atualização**: Após implementação das otimizações
