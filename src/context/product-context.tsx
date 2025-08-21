"use client";

import type { Product } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, setDoc, serverTimestamp, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type NewProduct = Omit<Product, 'id' | 'createdAt'>;

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: NewProduct) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar produtos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = useCallback(async (product: NewProduct) => {
    console.log("5. A função addProduct do contexto foi chamada com:", product);
    try {
      const productsCollection = collection(db, 'products');
      await addDoc(productsCollection, {
        ...product,
        createdAt: serverTimestamp()
      });
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
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error("Erro ao apagar produto:", error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
  }), [products, loading, addProduct, updateProduct, deleteProduct]);

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