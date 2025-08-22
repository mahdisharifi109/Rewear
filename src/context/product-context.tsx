"use client";

import type { Product } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, setDoc, serverTimestamp, query, orderBy, deleteDoc, updateDoc, getDocs, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'; 
import { db } from '@/lib/firebase';

const PRODUCTS_PER_PAGE = 8; // Vamos carregar 8 produtos de cada vez

type NewProduct = Omit<Product, 'id' | 'createdAt'>;

interface ProductContextType {
  products: Product[];
  loading: boolean;
  hasMoreProducts: boolean; // Para saber se ainda há produtos para carregar
  addProduct: (product: NewProduct) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  markAsSold: (productId: string) => Promise<void>;
  loadMoreProducts: () => Promise<void>; // NOVA FUNÇÃO
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  // Carrega o lote inicial de produtos
  useEffect(() => {
    const fetchInitialProducts = async () => {
        setLoading(true);
        try {
            const productsCollection = collection(db, 'products');
            const q = query(productsCollection, orderBy("createdAt", "desc"), limit(PRODUCTS_PER_PAGE));
            
            const documentSnapshots = await getDocs(q);
            
            const initialProducts = documentSnapshots.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            
            setProducts(initialProducts);
            
            const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            setLastDoc(lastVisible);
            
            if (documentSnapshots.docs.length < PRODUCTS_PER_PAGE) {
                setHasMoreProducts(false);
            } else {
                setHasMoreProducts(true);
            }

        } catch (error) {
            console.error("Erro ao carregar produtos iniciais:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchInitialProducts();
  }, []);

  // Função para carregar mais produtos
  const loadMoreProducts = useCallback(async () => {
    if (!lastDoc || !hasMoreProducts) return;

    try {
        const productsCollection = collection(db, 'products');
        const q = query(
            productsCollection, 
            orderBy("createdAt", "desc"), 
            startAfter(lastDoc),
            limit(PRODUCTS_PER_PAGE)
        );

        const documentSnapshots = await getDocs(q);
        
        const newProducts = documentSnapshots.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Product[];
        
        setProducts(prevProducts => [...prevProducts, ...newProducts]);
        
        const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setLastDoc(lastVisible);

        if (documentSnapshots.docs.length < PRODUCTS_PER_PAGE) {
            setHasMoreProducts(false);
        }
    } catch (error) {
        console.error("Erro ao carregar mais produtos:", error);
    }
  }, [lastDoc, hasMoreProducts]);


  // Funções existentes (create, update, delete) - modificada para usar setDoc para consistência
  const addProduct = useCallback(async (product: NewProduct) => {
    try {
      const newDocRef = doc(collection(db, 'products'));
      await setDoc(newDocRef, {
        ...product,
        status: 'disponível',
        createdAt: serverTimestamp()
      });
      // Adicionar o novo produto localmente para feedback imediato
      const newProduct = { ...product, id: newDocRef.id, status: 'disponível' } as Product;
      setProducts(prev => [newProduct, ...prev]);
    } catch (error) {
      console.error("ERRO ao tentar adicionar o documento ao Firestore:", error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    try {
      const productRef = doc(db, 'products', updatedProduct.id);
      const { id, ...productData } = updatedProduct;
      await setDoc(productRef, productData, { merge: true });
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Erro ao apagar produto:", error);
      throw error;
    }
  }, []);
  
  const markAsSold = useCallback(async (productId: string) => {
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, { status: 'vendido' });
        setProducts(prev => prev.map(p => p.id === productId ? {...p, status: 'vendido'} : p));
    } catch (error) {
        console.error("Erro ao marcar como vendido:", error);
        throw error;
    }
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