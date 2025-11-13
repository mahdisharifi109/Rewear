# UI Guidelines (TL;DR) + PR Checklist

Este resumo complementa `docs/blueprint.md` e serve como guia rápido no dia‑a‑dia.

## TL;DR de padrões
- Tipografia: `--font-heading` = Lora; `--font-body` = Open Sans.
- Ícones: em botões/listas `h-4 w-4`; cabeçalhos/destaques maiores. Gap padrão `gap-2` ou `mr-2` em botões.
- Cores: herdar `currentColor`; usar tokens Tailwind (`text-muted-foreground`, `text-primary`, `bg-muted`, `border`).
- Layout: grids/cards com `gap-6/8`; separar grandes blocos com `Separator`.
- Movimento: transições de 280–420ms, curvas suaves. Respeitar `prefers-reduced-motion` usando `motion-reduce:*`.
- Acessibilidade: skip link global; estados de loading com `role="status"` + `aria-live="polite"`; foco com `focus-visible`.

## Checklist para PRs
1) Ícones
   - [ ] Tamanhos consistentes (`h-4 w-4` em botões/listas).
   - [ ] Gap consistente entre ícone e texto.
   - [ ] Sem ícones redundantes/ambiguidades.

2) Layout e espaçamento
   - [ ] Grid responsivo com gaps confortáveis.
   - [ ] Cards usam `CardHeader`/`CardContent`/`CardFooter` corretamente.
   - [ ] Separadores visuais onde há mudanças de contexto.

3) Movimento
   - [ ] Transições suaves (280–420ms) e discretas.
   - [ ] `motion-reduce` aplicado em elementos com `transform`/animação.

4) Acessibilidade
   - [ ] Loading com `role="status"` + `aria-live`.
   - [ ] Foco visível (`focus-visible`) em elementos interativos.
   - [ ] Componentes acionáveis por teclado (Enter/Espaço onde fizer sentido).

5) Performance
   - [ ] `next/image` com `sizes`/`loading`/`fetchPriority` corretos.
   - [ ] Evitar re-renders (memoização quando apropriado).
   - [ ] Remover imports/trechos não usados.

Para detalhes completos, ver `docs/blueprint.md`.
