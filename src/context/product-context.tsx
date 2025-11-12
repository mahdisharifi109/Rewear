// src/context/product-context.tsx (Refatorado para Filtros no Servidor)

"use client";

import type { Product } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect, useRef } from 'react'; 
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
    // Nota: Removido 'conditions' e 'brands' do Firestore para evitar erro de múltiplos 'in'.
    // Estes filtros são aplicados no client-side (product-grid.tsx).

    // 1. Filtrar por Preço (eficiente no Firestore)
    if (minPrice > 0) constraints.push(where("price", ">=", minPrice));
    if (maxPrice && maxPrice < Infinity) constraints.push(where("price", "<=", maxPrice));

    // 2. Filtrar por Categoria (eficiente no Firestore)
    if (categoryQuery) constraints.push(where("category", "==", categoryQuery));
    
    // Filtro de status para mostrar apenas produtos disponíveis (default)
    constraints.push(where("status", "==", 'disponível')); 

    return constraints;
  }, [searchParams]);

  // Determina se existem filtros de preço para ajustar a ordenação (boa prática do Firestore)
  const hasPriceRange = useMemo(() => {
    const minPrice = Number(searchParams.get("minPrice"));
    const maxPrice = searchParams.get("maxPrice") === 'Infinity' ? Infinity : Number(searchParams.get("maxPrice"));
    return (minPrice > 0) || (!!maxPrice && maxPrice < Infinity);
  }, [searchParams]);


  const fetchProducts = useCallback(async (isInitialLoad: boolean, lastDocRef?: QueryDocumentSnapshot<DocumentData> | null) => {
      setLoading(true);
      try {
          const productsCollection = collection(db, 'products');
          
          // Construir a consulta com base nos filtros da URL e na paginação
          let q = hasPriceRange
            ? query(
                productsCollection,
                ...queryConstraints,
                orderBy("price", "asc"),
                orderBy("createdAt", "desc"),
                limit(PRODUCTS_PER_PAGE)
              )
            : query(
                productsCollection,
                ...queryConstraints,
                orderBy("createdAt", "desc"),
                limit(PRODUCTS_PER_PAGE)
              );
          
          if (!isInitialLoad && lastDocRef) {
              q = hasPriceRange
                ? query(
                    productsCollection,
                    ...queryConstraints,
                    orderBy("price", "asc"),
                    orderBy("createdAt", "desc"),
                    startAfter(lastDocRef),
                    limit(PRODUCTS_PER_PAGE)
                  )
                : query(
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
  }, [queryConstraints, hasPriceRange]);


  // Efeito para recarregar quando os filtros mudam
  const lastSearchKeyRef = useRef<string>("");
  useEffect(() => {
    // Garante que apenas executamos quando os parâmetros realmente mudam (evita duplas do StrictMode)
    const key = searchParams.toString();
    if (lastSearchKeyRef.current === key) return;
    lastSearchKeyRef.current = key;
    fetchProducts(true, null);
  }, [fetchProducts, searchParams]);

  // Função de carregar mais (agora usa a função central fetchProducts)
  const loadMoreProducts = useCallback(() => {
    if (!lastDoc || !hasMoreProducts) return Promise.resolve();
    return fetchProducts(false, lastDoc);
  }, [lastDoc, hasMoreProducts, fetchProducts]);


  // CRUD mantido, filtragem local removida. Paginação e filtros apenas via Firestore.
  const addProduct = useCallback(async (product: NewProduct) => {
    const newDocRef = doc(collection(db, 'products'));
    await setDoc(newDocRef, {
      ...product,
      createdAt: serverTimestamp(),
    });
  }, []);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    const productRef = doc(db, 'products', updatedProduct.id);
    const { id, ...updateData } = updatedProduct;
    await updateDoc(productRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    // ... (lógica inalterada)
  }, []);
  
  const markAsSold = useCallback(async (productId: string) => {
    // ... (lógica inalterada)
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