// ================================================================
// PRODUCT CONTEXT (REFATORADO COM TANSTACK QUERY)
// ================================================================
// Migrado de localStorage manual para TanStack Query
// - Cache automático com 5 minutos de validade
// - Invalidação inteligente de cache
// - Paginação otimizada com useInfiniteQuery
// - Filtros aplicados server-side via Firestore
// ================================================================

"use client";

import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react'; 
import { useSearchParams } from 'next/navigation';
import { 
  useProductsQuery, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct, 
  useMarkProductAsSold,
  type ProductFilters
} from '@/hooks/useProductsQuery';
import type { Product } from '@/lib/types';

// ================================================================
// TIPOS
// ================================================================

type NewProduct = Omit<Product, 'id' | 'createdAt'>;

interface ProductContextType {
  products: Product[];
  loading: boolean;
  hasMoreProducts: boolean; 
  addProduct: (product: NewProduct) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  markAsSold: (productId: string) => Promise<void>;
  loadMoreProducts: () => void; 
  isFetchingMore: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// ================================================================
// PROVIDER
// ================================================================

export function ProductProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  
  // ================================================================
  // Extrair filtros da URL
  // ================================================================
  const filters: ProductFilters = useMemo(() => {
    const minPrice = Number(searchParams.get("minPrice"));
    const maxPrice = searchParams.get("maxPrice") === 'Infinity' ? undefined : Number(searchParams.get("maxPrice"));
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const brand = searchParams.get("brand");

    return {
      category: category || undefined,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice && maxPrice < Infinity ? maxPrice : undefined,
      condition: condition || undefined,
      brand: brand || undefined,
      status: 'disponível', // Apenas produtos disponíveis
    };
  }, [searchParams]);

  // ================================================================
  // TanStack Query - Listagem com Paginação Infinita
  // ================================================================
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useProductsQuery({
    filters,
    limitPerPage: 12,
  });

  // ================================================================
  // TanStack Query - Mutations (Criar, Atualizar, Apagar)
  // ================================================================
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const markAsSoldMutation = useMarkProductAsSold();

  // ================================================================
  // Flatten dos produtos paginados
  // ================================================================
  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.products);
  }, [data]);

  // ================================================================
  // Funções CRUD (wrapper para mutations)
  // ================================================================
  const addProduct = useCallback(async (product: NewProduct) => {
    await createProductMutation.mutateAsync(product);
  }, [createProductMutation]);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    const { id, ...updates } = updatedProduct;
    await updateProductMutation.mutateAsync({ productId: id, updates });
  }, [updateProductMutation]);

  const deleteProduct = useCallback(async (productId: string) => {
    await deleteProductMutation.mutateAsync(productId);
  }, [deleteProductMutation]);

  const markAsSold = useCallback(async (productId: string) => {
    await markAsSoldMutation.mutateAsync(productId);
  }, [markAsSoldMutation]);

  const loadMoreProducts = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ================================================================
  // Context Value
  // ================================================================
  const value = useMemo(() => ({
    products,
    loading: isLoading,
    hasMoreProducts: hasNextPage || false,
    addProduct,
    updateProduct,
    deleteProduct,
    markAsSold,
    loadMoreProducts,
    isFetchingMore: isFetchingNextPage,
  }), [
    products, 
    isLoading, 
    hasNextPage, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    markAsSold, 
    loadMoreProducts,
    isFetchingNextPage
  ]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}