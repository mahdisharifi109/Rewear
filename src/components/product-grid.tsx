"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card";
import { useProducts } from "@/context/product-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";

interface ProductGridProps {
  personalized?: boolean;
}

export function ProductGrid({ personalized = false }: ProductGridProps) {
  const searchParams = useSearchParams();
  const { products, loadMoreProducts, hasMoreProducts, loading: initialLoading } = useProducts();
  const { user } = useAuth();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await loadMoreProducts();
    setIsLoadingMore(false);
  };

  const filteredProducts = useMemo(() => {
    // Lógica para o feed personalizado "Para Ti"
    if (personalized && user) {
        const { preferredBrands = [], preferredSizes = [] } = user;

        if (preferredBrands.length === 0 && preferredSizes.length === 0) {
            return []; // Retorna vazio se não houver preferências
        }
        
        // Lógica de pontuação melhorada
        return products
            .filter(p => p.status !== 'vendido' && p.userId !== user.uid) // Não mostrar os próprios produtos
            .map(product => {
                let score = 0;
                // Atribui 2 pontos se a marca corresponder (mais importante)
                if (product.brand && preferredBrands.includes(product.brand)) {
                    score += 2;
                }
                // Atribui 1 ponto se o tamanho corresponder
                if (product.sizes?.some(size => preferredSizes.includes(size))) {
                    score += 1;
                }
                return { ...product, score };
            })
            .filter(p => p.score > 0) // Apenas produtos que correspondem a algo
            .sort((a, b) => b.score - a.score); // Ordenar por pontuação (mais relevante primeiro)
    }

    // Lógica de filtros normal para a página "Explorar" e "Pesquisa"
    const searchQuery = searchParams.get("q")?.toLowerCase() || "";
    const categoryQuery = searchParams.get("category")?.toLowerCase() || "";
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || Infinity;
    const conditions = searchParams.get("conditions")?.split(',').filter(Boolean) || [];
    const brands = searchParams.get("brands")?.split(',').filter(Boolean) || [];
    const sizes = searchParams.get("sizes")?.split(',').filter(Boolean) || [];

    let filtered = products.filter(p => p.status !== 'vendido');

    if (searchQuery) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery));
    if (categoryQuery) filtered = filtered.filter(p => p.category.toLowerCase() === categoryQuery);
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);
    if (conditions.length > 0) filtered = filtered.filter(p => conditions.includes(p.condition));
    if (brands.length > 0) filtered = filtered.filter(p => p.brand && brands.includes(p.brand));
    if (sizes.length > 0) filtered = filtered.filter(p => p.sizes && p.sizes.some(size => sizes.includes(size)));

    return filtered;
  }, [searchParams, products, personalized, user]);
  
  // Apenas mostra o botão "Carregar Mais" se não estivermos a filtrar/pesquisar
  const hasActiveFilters = searchParams.toString().length > 0;
  const showLoadMoreButton = !personalized && hasMoreProducts && !hasActiveFilters;

  return (
    <section id="products">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          {personalized ? "Recomendado para Si" : (hasActiveFilters ? "Resultados" : "Descubra os Nossos Produtos")}
        </h2>
        <p className="text-muted-foreground mt-2">{filteredProducts.length} resultado(s) encontrado(s)</p>
      </div>

      {initialLoading ? (
        <div className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {showLoadMoreButton && (
            <div className="mt-10 text-center">
              <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Carregar Mais"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Nenhum produto encontrado</h3>
          <p className="mt-2 text-muted-foreground">Tente ajustar os filtros ou pesquisar por outro termo.</p>
        </div>
      )}
    </section>
  );
}