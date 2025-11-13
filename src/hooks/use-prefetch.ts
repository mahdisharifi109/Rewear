'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';

/**
 * Hook para prefetch de páginas de produtos
 * Carrega a próxima página em background para navegação instantânea
 */
export function usePrefetchProducts(products: Product[]) {
  const router = useRouter();

  useEffect(() => {
    // Prefetch das primeiras 8 páginas de produto
    products.slice(0, 8).forEach((product) => {
      router.prefetch(`/product/${product.id}`);
    });
  }, [products, router]);
}

/**
 * Hook para prefetch inteligente baseado em hover
 */
export function useSmartPrefetch() {
  const router = useRouter();

  const prefetchOnHover = (productId: string) => {
    router.prefetch(`/product/${productId}`);
  };

  return { prefetchOnHover };
}
