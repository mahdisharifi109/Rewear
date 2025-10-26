// Ficheiro: src/components/product-grid.tsx (Corrigido)

"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useProducts } from "@/context/product-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

// Componente de Skeleton para o ProductCard
const ProductCardSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-[250px] w-full rounded-lg" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-5 w-1/2" />
  </div>
);

// Dynamic import com fallback
const DynamicProductCard = dynamic(() => import('@/components/product-card'), {
  ssr: false,
  loading: () => <ProductCardSkeleton />,
});

interface ProductGridProps {
  personalized?: boolean;
}

export function ProductGrid({ personalized = false }: ProductGridProps) {
  const searchParams = useSearchParams();
  const { products, loadMoreProducts, hasMoreProducts, loading: initialLoading } = useProducts();
  const { user } = useAuth();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver>();

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreProducts) return;
    setIsLoadingMore(true);
    await loadMoreProducts();
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMoreProducts, loadMoreProducts]);

  // Observer para o scroll infinito
  const lastProductElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreProducts && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { root: null, rootMargin: "400px", threshold: 0.1 } // rootMargin adicionado
    );
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMoreProducts, handleLoadMore]);

  const filteredProducts = useMemo(() => {
    if (personalized && user) {
        const { preferredBrands = [], preferredSizes = [] } = user;
        if (preferredBrands.length === 0 && preferredSizes.length === 0) return [];
        return products
            .filter(p => p.status !== 'vendido' && p.userId !== user.uid)
            .map(product => {
                let score = 0;
                if (product.brand && preferredBrands.includes(product.brand)) score += 2;
                if (product.sizes?.some(size => preferredSizes.includes(size))) score += 1;
                return { ...product, score };
            })
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score);
    }

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
  
  const hasActiveFilters = searchParams.toString().length > 0;
  const showLoadMore = !personalized && hasMoreProducts && !hasActiveFilters;

  return (
    <section id="products">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          {personalized ? "Recomendado para Si" : (hasActiveFilters ? "Resultados da Pesquisa" : "Descubra os Nossos Produtos")}
        </h2>
        <p className="text-muted-foreground mt-2">{filteredProducts.length} resultado(s) encontrado(s)</p>
      </div>

      {initialLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => {
              if (filteredProducts.length === index + 1 && showLoadMore) {
                return <div ref={lastProductElementRef} key={product.id}><DynamicProductCard product={product} /></div>
              }
              return <DynamicProductCard key={product.id} product={product} />
            })}
          </div>
          {isLoadingMore && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
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