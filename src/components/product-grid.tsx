// Ficheiro: src/components/product-grid.tsx (Limpo e Otimizado)

"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card";
import { useProducts } from "@/context/product-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import type { Product } from "@/lib/types";
import { usePrefetchProducts } from "@/hooks/use-prefetch"; 

// Componente de Skeleton para o ProductCard
const ProductCardSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-[250px] w-full rounded-lg" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-5 w-1/2" />
  </div>
);


interface ProductGridProps {
  personalized?: boolean;
}

export function ProductGrid({ personalized = false }: ProductGridProps) {
  const searchParams = useSearchParams();
  const { products, loadMoreProducts, hasMoreProducts, loading: initialLoading } = useProducts();
  const { user } = useAuth();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver>();

  const loadMoreTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Prefetch inteligente dos primeiros produtos
  usePrefetchProducts(products);
  
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreProducts) return;
    
    // Debounce para evitar múltiplas chamadas rápidas
    if (loadMoreTimeoutRef.current) {
      clearTimeout(loadMoreTimeoutRef.current);
    }
    
    loadMoreTimeoutRef.current = setTimeout(async () => {
      setIsLoadingMore(true);
      try {
        await loadMoreProducts();
      } finally {
        setIsLoadingMore(false);
      }
    }, 100); // Reduzido de 150ms para 100ms para resposta mais rápida
  }, [isLoadingMore, hasMoreProducts, loadMoreProducts]);

  // Observer para o scroll infinito com threshold otimizado
  const lastProductElementRef = useCallback((node: HTMLDivElement) => { 
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreProducts) {
        handleLoadMore();
      }
    }, { 
      rootMargin: '800px', // Aumentado para pré-carregar mais cedo
      threshold: 0.05 // Threshold menor para trigger mais rápido
    }); 
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMoreProducts, handleLoadMore]);
  
  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
    };
  }, []);

  // Lógica de Filtragem LOCAL (Reduzida)
  const filteredProducts = useMemo(() => {
    // 1. Lógica Personalizada (Fica no cliente, pois envolve scores complexos)
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

    let filtered = products;
    
    // 2. Filtragem Local Híbrida (texto, brands, conditions, sizes)
    const searchQuery = searchParams.get("q")?.toLowerCase() || "";
    const conditions = searchParams.get("conditions")?.split(',').filter(Boolean) || [];
    const brands = searchParams.get("brands")?.split(',').filter(Boolean) || [];
    const sizes = searchParams.get("sizes")?.split(',').filter(Boolean).map(s => s.trim().toUpperCase()) || [];
    const colors = searchParams.get("colors")?.split(',').filter(Boolean) || [];
    const locations = searchParams.get("locations")?.split(',').filter(Boolean) || [];
    const categories = searchParams.get("categories")?.split(',').filter(Boolean) || [];
    const minPriceStr = searchParams.get("minPrice");
    const maxPriceStr = searchParams.get("maxPrice");
    const minPrice = minPriceStr ? Number(minPriceStr) : undefined;
    const maxPrice = maxPriceStr ? (maxPriceStr === 'Infinity' ? Infinity : Number(maxPriceStr)) : undefined;
    const sort = searchParams.get("sort") || '';
    
    // Filtro de texto
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery) || 
        p.description.toLowerCase().includes(searchQuery)
      );
    }
    
    // Filtro de condições (client-side para evitar múltiplos 'in' no Firestore)
    if (conditions.length > 0) {
      filtered = filtered.filter(p => conditions.includes(p.condition));
    }
    
    // Filtro de marcas (client-side para evitar múltiplos 'in' no Firestore)
    if (brands.length > 0) {
      filtered = filtered.filter(p => p.brand && brands.includes(p.brand));
    }
    
    // Filtro de tamanhos
    if (sizes.length > 0) {
      filtered = filtered.filter(p => 
        p.sizes?.some(size => sizes.includes(size.toUpperCase()))
      );
    }

    // Filtro de categorias
    if (categories.length > 0) {
      filtered = filtered.filter(p => categories.includes(p.category));
    }

    // Filtro de cores (se disponível no produto)
    if (colors.length > 0) {
      filtered = filtered.filter(p => p.color && colors.includes(p.color));
    }

    // Filtro de localização (se disponível no produto)
    if (locations.length > 0) {
      filtered = filtered.filter(p => p.location && locations.includes(p.location));
    }

    // Filtro de preço
    if (typeof minPrice === 'number') {
      filtered = filtered.filter(p => p.price >= minPrice);
    }
    if (typeof maxPrice === 'number') {
      filtered = filtered.filter(p => p.price <= maxPrice);
    }

    // Ordenação
    if (sort) {
      if (sort === 'price_asc') {
        filtered = [...filtered].sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        filtered = [...filtered].sort((a, b) => b.price - a.price);
      } else if (sort === 'newest') {
        filtered = [...filtered].sort((a, b) => {
          const at = a.createdAt?.toMillis?.() ?? 0;
          const bt = b.createdAt?.toMillis?.() ?? 0;
          return bt - at;
        });
      }
    }

    return filtered;
  }, [searchParams, products, personalized, user]);
  
  // Memoizar verificações de filtros
  const hasActiveFilters = useMemo(() => searchParams.toString().length > 0, [searchParams]);
  const showLoadMore = useMemo(() => !personalized && hasMoreProducts, [personalized, hasMoreProducts]);
  const productCount = useMemo(() => filteredProducts.length, [filteredProducts.length]);

  return (
    <section id="products">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          {personalized ? "Recomendado para Si" : (hasActiveFilters ? "Resultados da Pesquisa" : "Descubra os Nossos Produtos")}
        </h2>
        <p className="text-muted-foreground mt-2">{productCount} resultado(s) encontrado(s)</p>
      </div>

      {initialLoading ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => {
              if (filteredProducts.length === index + 1 && showLoadMore) {
                return <div ref={lastProductElementRef} key={product.id}><ProductCard product={product} index={index} /></div>
              }
              return <ProductCard key={product.id} product={product} index={index} />
            })}
          </div>
          {isLoadingMore && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          )}
          
          {/* Se a contagem de produtos for 0 e houver filtros ativos, mas loading for falso, mostra a mensagem de não encontrado */}
          {filteredProducts.length === 0 && hasActiveFilters && (
            <div className="text-center py-16">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">Nenhum produto encontrado</h3>
              <p className="mt-2 text-muted-foreground">Tente ajustar os filtros ou pesquisar por outro termo.</p>
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