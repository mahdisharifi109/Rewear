"use client";

import type { Product } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, doc, setDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';

// --- Configuração do Firebase com as suas credenciais ---
const firebaseConfig = {
  apiKey: "AIzaSyDD17WDp1lwMtD9qeubYD0NJ0VbdQ0P1jo",
  authDomain: "fir-config-12a50.firebaseapp.com",
  projectId: "fir-config-12a50",
  storageBucket: "fir-config-12a50.firebasestorage.app",
  messagingSenderId: "580819717100",
  appId: "1:580819717100:web:38d3a481dd722eeb280ec9",
  measurementId: "G-DN1JZER9ZL"
};

// Inicializar a app Firebase de forma segura
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// --- Contexto ---

type NewProduct = Omit<Product, 'id' | 'createdAt'>;

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: NewProduct) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Efeito para ler os produtos do Firestore em tempo real
  useEffect(() => {
    setLoading(true);
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
      console.error("Erro ao carregar produtos do Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = useCallback(async (product: NewProduct) => {
    try {
      const productsCollection = collection(db, 'products');
      await addDoc(productsCollection, {
        ...product,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
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

  const value = useMemo(() => ({
    products,
    loading,
    addProduct,
    updateProduct,
  }), [products, loading, addProduct, updateProduct]);

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
