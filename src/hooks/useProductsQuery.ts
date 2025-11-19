// ================================================================
// CUSTOM HOOK: useProductsQuery
// ================================================================
// Gerencia fetching, caching e estados de produtos usando TanStack Query
// Substitui a lógica manual de localStorage do product-context
// ================================================================

"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductsService } from '@/lib/firestore-service';
import type { Product } from '@/lib/types';
import { where, QueryConstraint } from 'firebase/firestore';

// ================================================================
// TIPOS
// ================================================================

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  brand?: string;
  status?: 'disponível' | 'vendido';
}

interface UseProductsOptions {
  filters?: ProductFilters;
  limitPerPage?: number;
  enabled?: boolean; // Permite desativar a query
}

// ================================================================
// QUERY KEYS (para invalidação de cache)
// ================================================================

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  byUser: (userId: string) => [...productKeys.all, 'user', userId] as const,
};

// ================================================================
// HOOK: useProductsQuery (Listagem com Paginação)
// ================================================================

/**
 * Hook para buscar produtos com filtros e paginação infinita
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, fetchNextPage, hasNextPage } = useProductsQuery({
 *   filters: { category: 'Roupa', minPrice: 10 },
 *   limitPerPage: 12
 * });
 * ```
 */
export function useProductsQuery(options: UseProductsOptions = {}) {
  const { filters, limitPerPage = 12, enabled = true } = options;

  // Converter filtros para QueryConstraints do Firestore
  const buildQueryConstraints = (): QueryConstraint[] => {
    const constraints: QueryConstraint[] = [];

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    } else {
      constraints.push(where('status', '==', 'disponível')); // Default
    }

    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }

    if (filters?.minPrice !== undefined && filters.minPrice > 0) {
      constraints.push(where('price', '>=', filters.minPrice));
    }

    if (filters?.maxPrice !== undefined && filters.maxPrice < Infinity) {
      constraints.push(where('price', '<=', filters.maxPrice));
    }

    if (filters?.condition) {
      constraints.push(where('condition', '==', filters.condition));
    }

    if (filters?.brand) {
      constraints.push(where('brand', '==', filters.brand));
    }

    return constraints;
  };

  return useInfiniteQuery({
    queryKey: productKeys.list(filters),
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const constraints = buildQueryConstraints();
      
      return await ProductsService.list({
        filters: constraints,
        limitCount: limitPerPage,
        lastDocId: pageParam,
      });
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.lastDocId || undefined,
    staleTime: 1000 * 60 * 5, // Cache válida por 5 minutos
    gcTime: 1000 * 60 * 30,   // Mantém na memória 30 minutos
    enabled, // Permite desativar a query
  });
}

// ================================================================
// HOOK: useProductDetails (Detalhes de um Produto)
// ================================================================

/**
 * Hook para buscar detalhes de um produto específico
 * 
 * @example
 * ```tsx
 * const { data: product, isLoading } = useProductDetails('product123');
 * ```
 */
export function useProductDetails(productId: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(productId || ''),
    queryFn: async () => {
      if (!productId) throw new Error('Product ID é obrigatório');
      return await ProductsService.getById(productId);
    },
    enabled: !!productId, // Só executa se productId existir
    staleTime: 1000 * 60 * 10, // Cache mais longa para detalhes (10 min)
    gcTime: 1000 * 60 * 60,    // Mantém 1 hora
  });
}

// ================================================================
// HOOK: useUserProducts (Produtos de um Vendedor)
// ================================================================

/**
 * Hook para buscar produtos de um vendedor específico
 * 
 * @example
 * ```tsx
 * const { data: products } = useUserProducts('user123');
 * ```
 */
export function useUserProducts(userId: string | undefined, limitCount: number = 20) {
  return useQuery({
    queryKey: productKeys.byUser(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID é obrigatório');
      return await ProductsService.getByUser(userId, limitCount);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

// ================================================================
// MUTATIONS (Criar, Atualizar, Apagar)
// ================================================================

/**
 * Hook para criar um novo produto
 * 
 * @example
 * ```tsx
 * const createProduct = useCreateProduct();
 * 
 * const handleSubmit = async (data) => {
 *   await createProduct.mutateAsync(data);
 * };
 * ```
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'createdAt'>) => {
      return await ProductsService.create(productData);
    },
    onSuccess: () => {
      // Invalida todas as listagens de produtos para refetch automático
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Hook para atualizar um produto existente
 * 
 * @example
 * ```tsx
 * const updateProduct = useUpdateProduct();
 * 
 * await updateProduct.mutateAsync({ 
 *   productId: '123', 
 *   updates: { price: 50 } 
 * });
 * ```
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, updates }: { productId: string; updates: Partial<Product> }) => {
      return await ProductsService.update(productId, updates);
    },
    onSuccess: (_, variables) => {
      // Invalida a listagem E os detalhes do produto
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
    },
  });
}

/**
 * Hook para marcar produto como vendido
 * 
 * @example
 * ```tsx
 * const markAsSold = useMarkProductAsSold();
 * 
 * await markAsSold.mutateAsync('product123');
 * ```
 */
export function useMarkProductAsSold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      return await ProductsService.markAsSold(productId);
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

/**
 * Hook para apagar um produto
 * 
 * @example
 * ```tsx
 * const deleteProduct = useDeleteProduct();
 * 
 * await deleteProduct.mutateAsync('product123');
 * ```
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      return await ProductsService.delete(productId);
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

// ================================================================
// HOOK: usePrefetchProduct (Prefetch para hover)
// ================================================================

/**
 * Hook para fazer prefetch de um produto (útil em hover)
 * 
 * @example
 * ```tsx
 * const prefetchProduct = usePrefetchProduct();
 * 
 * <div onMouseEnter={() => prefetchProduct('product123')}>
 *   ...
 * </div>
 * ```
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (productId: string) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(productId),
      queryFn: async () => await ProductsService.getById(productId),
      staleTime: 1000 * 60 * 10,
    });
  };
}
