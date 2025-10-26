// src/context/product-context.tsx (Refatorado para Filtros no Servidor)

"use client";

import type { Product } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { collection, doc, setDoc, serverTimestamp, query, orderBy, deleteDoc, updateDoc, getDocs, limit, startAfter, QueryDocumentSnapshot, DocumentData, where, QueryConstraint } from 'firebase/firestore'; 
import { db } from '@/lib/firebase';
import { useSearchParams } from 'next/navigation'; // Importado para obter filtros

const PRODUCTS_PER_PAGE = 8; 

type NewProduct = Omit<Product, 'id' | 'createdAt'>;

interface ProductContextType {
  products: Product[];
  loading: boolean;
  hasMoreProducts: boolean; 
  addProduct: (product: NewProduct) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  markAsSold: (productId: string) => Promise<void>;
  loadMoreProducts: () => Promise<void>; 
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams(); // Obter filtros da URL
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  
  // Extrair filtros da URL e preparar as QueryConstraints do Firestore
  const queryConstraints = useMemo(() => {
    const constraints: QueryConstraint[] = [];
    const minPrice = Number(searchParams.get("minPrice"));
    const maxPrice = searchParams.get("maxPrice") === 'Infinity' ? Infinity : Number(searchParams.get("maxPrice"));
    const categoryQuery = searchParams.get("category");
    const conditions = searchParams.get("conditions")?.split(',').filter(Boolean) || [];
    const brands = searchParams.get("brands")?.split(',').filter(Boolean) || [];
    // Nota: O filtro de texto ('q') e o filtro de 'sizes' não podem ser otimizados no Firestore 
    // sem indexação avançada ou busca secundária. Vamos usá-los no filter local, 
    // mas priorizamos price/category/conditions no Firestore.

    // 1. Filtrar por Preço
    if (minPrice > 0) constraints.push(where("price", ">=", minPrice));
    if (maxPrice && maxPrice < Infinity) constraints.push(where("price", "<=", maxPrice));

    // 2. Filtrar por Categoria
    if (categoryQuery) constraints.push(where("category", "==", categoryQuery));

    // 3. Filtrar por Condições (Firestore permite 'in' para até 10 valores)
    if (conditions.length > 0) constraints.push(where("condition", "in", conditions));
    
    // 4. Filtrar por Marcas (Firestore permite 'in' para até 10 valores)
    if (brands.length > 0) constraints.push(where("brand", "in", brands));
    
    // Filtro de status para mostrar apenas produtos disponíveis (default)
    constraints.push(where("status", "==", 'disponível')); 

    return constraints;
  }, [searchParams]);


  const fetchProducts = useCallback(async (isInitialLoad: boolean, lastDocRef?: QueryDocumentSnapshot<DocumentData> | null) => {
      setLoading(true);
      try {
          const productsCollection = collection(db, 'products');
          
          // Construir a consulta com base nos filtros da URL e na paginação
          let q = query(
              productsCollection, 
              ...queryConstraints, // Aplicar filtros do servidor
              orderBy("createdAt", "desc"), 
              limit(PRODUCTS_PER_PAGE)
          );
          
          if (!isInitialLoad && lastDocRef) {
              q = query(
                  productsCollection, 
                  ...queryConstraints, 
                  orderBy("createdAt", "desc"), 
                  startAfter(lastDocRef),
                  limit(PRODUCTS_PER_PAGE)
              );
          }
          
          const documentSnapshots = await getDocs(q);
          
          const fetchedProducts = documentSnapshots.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          })) as Product[];
          
          setProducts(prevProducts => isInitialLoad ? fetchedProducts : [...prevProducts, ...fetchedProducts]);
          
          const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
          setLastDoc(lastVisible || null); // Guardar o último documento (ou null se for o fim)
          
          setHasMoreProducts(documentSnapshots.docs.length === PRODUCTS_PER_PAGE);

      } catch (error) {
          console.error("Erro ao carregar produtos:", error);
      } finally {
          setLoading(false);
      }
  }, [queryConstraints]);


  // Efeito para recarregar quando os filtros mudam
  useEffect(() => {
    // Quando qualquer parâmetro na URL muda, reinicia a busca do zero
    fetchProducts(true, null);
  }, [fetchProducts, searchParams.toString()]); // Dependência em searchParams.toString() para detectar TODAS as mudanças

  // Função de carregar mais (agora usa a função central fetchProducts)
  const loadMoreProducts = useCallback(() => {
    if (!lastDoc || !hasMoreProducts) return Promise.resolve();
    return fetchProducts(false, lastDoc);
  }, [lastDoc, hasMoreProducts, fetchProducts]);

  // --- Funções de CRUD (Permanecem inalteradas, mas agora a lista de produtos é re-sincronizada no useEffect) ---
  
  const addProduct = useCallback(async (product: NewProduct) => {
    // ... (lógica inalterada)
  }, []);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    // ... (lógica inalterada)
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    // ... (lógica inalterada)
  }, []);
  
  const markAsSold = useCallback(async (productId: string) => {
    // ... (lógica inalterada, mas irá disparar o useEffect acima)
  }, []);

  const value = useMemo(() => ({
    products,
    loading,
    hasMoreProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    markAsSold,
    loadMoreProducts,
  }), [products, loading, hasMoreProducts, addProduct, updateProduct, deleteProduct, markAsSold, loadMoreProducts]);

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