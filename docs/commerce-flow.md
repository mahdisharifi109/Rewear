# Fluxo de Compra e Venda (Estilo Vinted)

Este documento descreve as funcionalidades principais inspiradas no Vinted e como estão refletidas no projeto.

## 1. Catálogos e Filtros
- Categorias principais: Mulher, Homem, Criança, Casa (no projeto, o campo `category` usa valores como `Roupa`, `Calçado`, `Livros`, `Eletrónica`, `Outro`). Sugestão: mapear subcategorias por sexo/faixa etária quando se expandir o esquema.
- Filtros essenciais:
  - Tamanho: `XS`…`XXL`
  - Marca: Nike, Adidas, Zara, H&M, etc.
  - Cor: Preto, Branco, Cinzento, Azul, Vermelho, …
  - Preço: intervalo com limite máximo e opção de `1000€+`
  - Condição: Novo, Muito bom, Bom
  - Localização: cidades/regiões de Portugal
  - Ordenação: Mais recente, Preço ascendente, Preço descendente
- Página de resultados: layout em grelha 2–4 colunas, contagem de resultados, scroll infinito e barra de ordenação.

## 2. Perfil de Utilizador
- Público (página do vendedor):
  - Foto/avatar, nome, avaliação média, contadores (vendidos/à venda)
  - "Armário": grelha de itens ativos do vendedor
  - Aba de avaliações com lista paginável
- Privado (área pessoal):
  - Configurações de conta: preferências (marcas/tamanhos), dados básicos
  - Moradas e pagamento: a expandir; IBAN usado no fluxo de levantamento da carteira
  - Histórico: compras e vendas do utilizador

## 3. Carteira (Wallet)
- Saldos:
  - Pendente: valor de vendas até o comprador confirmar/expirar prazo
  - Disponível: valor utilizável/levantável
- Ações:
  - Levantamento via IBAN (simulado; com validações básicas)
  - Usar saldo no checkout (opcional; UI já deduz do total)
- Histórico de transações:
  - Tipos: `venda`, `compra`, `levantamento`, `taxa`, `bónus`
  - Lista ordenada por data com sinalização de crédito/débito

## 4. Fluxo Compra→Carteira
1. Comprador paga (opcional: aplica saldo da carteira para reduzir total).
2. O sistema regista a compra e notifica o vendedor.
3. Valor da venda entra em `pendente` na carteira do vendedor.
4. Proteção ao Comprador: a quantia fica retida até confirmação da receção ou fim do período de proteção.
5. Após confirmação/expiração sem disputa:
   - Transferência de `pendente` → `disponível` do vendedor (menos taxas, se existirem).
   - Registo no histórico (`venda` confirmado).
6. Vendedor pode:
   - Usar saldo disponível em novas compras.
   - Solicitar levantamento para IBAN (cria transação `levantamento`).

Notas:
- Alguns passos estão simulados (sem integração de pagamentos real). A estrutura de tipos e ecrãs já está preparada para evolução.
