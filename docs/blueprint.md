# Rewear — UI Blueprint (Atualizado)

Este documento reúne diretrizes práticas para manter a interface profissional, confortável e rápida, alinhada com a humanização aplicada no projeto.

## Core features (resumo)

- Listagem de produtos: imagem, nome, preço, condição e rótulos contextuais.
- Pesquisa básica (por nome/categoria) com barra persistente no header.
- Carrinho (simulado) com contagem e sheet lateral dinâmico.
- Páginas informativas: About, Contact, FAQ.
- Sugestão assistida na criação de produto (títulos/descrição/categoria a partir de imagem).

---

## Identidade visual e tipografia

- Fontes
	- Headings: Lora (serif) — elegância orgânica; variável CSS: `--font-heading`.
	- Corpo: Open Sans — legível e acolhedora; variável CSS: `--font-body`.
	- Aplicação: `html` recebe as variáveis; `body` usa `font-body` por padrão.

- Paleta e tokens
	- Usar HSL em tons naturais e menos saturados via tokens do Tailwind (ex.: `text-muted-foreground`, `bg-muted`, `border`, `primary`).
	- Sombras em camadas: `shadow-soft` (base), `shadow-elevated` (hover), `shadow-floating` (destaques/flutuantes).
	- Transições orgânicas: utilitários `transition-organic` / `transition-smooth` (280–420ms, curvas suaves).

---

## Ícones (humanização e consistência)

- Biblioteca: `lucide-react` (traço limpo, minimalista, coerente com o tema).
- Tamanhos
	- Botões só de ícone e listas: `h-4 w-4`.
	- Cabeçalhos/seções em destaque: `h-6 w-6` (ou `h-7 w-7` quando necessário).
- Espaçamento
	- Entre ícone e texto: `gap-2` (ou `mr-2` em botões).
	- Evitar ícones redundantes; só manter o que adiciona significado.
- Cores
	- Herde de `currentColor` e utilize classes utilitárias (ex.: `text-primary`, `text-muted-foreground`) para alinhamento com a paleta.

---

## Layout, espaçamento e estrutura

- Grid e colunas
	- Use grids responsivas para separar conteúdo principal e secundário (ex.: Perfil: 1/3 lateral + 2/3 conteúdo com Tabs).
	- Mantenha `gap` generoso entre cards/seções (`gap-6`/`gap-8`).
- Cards
	- Título/descrição em `CardHeader`, conteúdo em `CardContent` e ações em `CardFooter`.
	- Sombras suaves + elevação em hover quando é interativo.
- Navegação
	- Header sticky, com barra de pesquisa, tema e ações. Menu mobile via Sheet.
	- Link “Ir para o conteúdo” no topo (skip link) e `main#main-content` para acessibilidade.

---

## Movimento e micro‑interações

- Durações alvo: 280–420ms.
- Elevação suave em hover (`hover:-translate-y-1` + `hover:shadow-elevated`).
- Preferências do utilizador
	- Respeitar `prefers-reduced-motion`: desativar `transform`/`transition` com `motion-reduce:transition-none motion-reduce:transform-none`.
- Foco
	- Usar `focus-visible` com `ring-2 ring-primary/40` para indicar foco de teclado sem poluir o foco do rato.

---

## Acessibilidade (padrões aplicados)

- Skip link global no `layout` para saltar para `#main-content`.
- Estados de carregamento com `role="status"` + `aria-live="polite"` (Dashboard, Wallet, Favorites, Profile).
- Componentes interativos com foco visível e ativação por teclado (ex.: `ProductCard` responde a Enter/Espaço).

---

## Componentes e padrões

- Botões
	- Ícone `h-4 w-4` + texto com `gap-2`/`mr-2`.
	- Estados: hover/focus consistentes; evitar `outline` agressivo.

- ProductCard
	- `next/image` com `sizes` adequados, `loading="lazy"`, `fetchPriority="low"`.
	- Hover: zoom sutil na imagem; respeitar `motion-reduce`.
	- Acessível por teclado (Enter/Espaço) e foco visível.
	- Performance: `React.memo` com comparação leve de props relevantes.

- Favorites
	- Grid com `gap-8`; wrapper do card com sombra suave e leve elevação em hover.
	- `focus-within` para evidenciar foco quando navegar via teclado.

- Wallet
	- Cards separados para Saldo, Ações e Histórico, em grid responsivo.

- Dashboard
	- Separadores visuais (`Separator`) entre métricas, gráfico e avaliações.

- Profile
	- Coluna lateral (avatar/dados/estatísticas) + coluna principal (Tabs: Configurações, Meus Artigos, Histórico).

---

## Performance

- Imagens
	- `next/image` com `sizes` realista para cada contexto; `loading="lazy"` e compressão de origem (otimizar no upload/CDN).
- Código
	- Import dinâmico para módulos pesados no cliente (ex.: SideCart).
	- Evitar re-renders: memoização de componentes com props estáveis (ex.: `ProductCard`).
	- Manter transições leves e curtas; evitar animações complexas em scroll contínuo.

---

## Limpeza e propósito

- Remover ícones/elementos redundantes ou que não adicionem clareza.
- Garantir que cada seção tem objetivo claro e densidade de informação confortável.
- Minimizar cliques até a ação desejada; evitar distrações.