"use client";

import type { CartItem, Product, AddToCartPayload, AppUser } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore'; // Importar writeBatch e serverTimestamp

const VERIFICATION_FEE = 5.00; 

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (payload: AddToCartPayload) => void;
  removeFromCart: (cartItemId: string) => void;
  updateItemQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  verificationFee: number; 
  total: number; 
  isVerificationEnabled: boolean; 
  toggleVerification: () => void;
  finalizeCheckout: (buyer: AppUser, checkoutData: any) => Promise<void>; // ADICIONADO
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isVerificationEnabled, setIsVerificationEnabled] = useState(false); 

  const addToCart = useCallback(({ product, quantity, size }: AddToCartPayload) => {
    setCartItems(prevItems => {
      const cartItemId = `${product.id}-${size || ''}`;
      const existingItem = prevItems.find(item => item.id === cartItemId);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { id: cartItemId, product, quantity, size }];
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
  }, []);

  const updateItemQuantity = useCallback((cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = () => {
    setCartItems([]);
    setIsVerificationEnabled(false); 
  };

  const toggleVerification = useCallback(() => {
    setIsVerificationEnabled(prev => !prev);
  }, []);
  
  // FUNÇÃO PRINCIPAL DO CHECKOUT
  const finalizeCheckout = useCallback(async (buyer: AppUser, checkoutData: any) => {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();
    const isVerified = isVerificationEnabled;
    
    for (const item of cartItems) {
        const productRef = doc(db, 'products', item.product.id);
        
        // 1. Criar Registo de Compra (Para o Histórico do Comprador)
        const purchaseRef = doc(collection(db, 'purchases'));
        batch.set(purchaseRef, {
            buyerId: buyer.uid,
            buyerName: buyer.name,
            sellerId: item.product.userId,
            sellerName: item.product.userName,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            isVerified: isVerified,
            date: timestamp,
        });

        // 2. Criar Registo de Venda (Para o Histórico do Vendedor)
        const saleRef = doc(collection(db, 'sales'));
        batch.set(saleRef, {
            buyerId: buyer.uid,
            buyerName: buyer.name,
            sellerId: item.product.userId,
            sellerName: item.product.userName,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            isVerified: isVerified,
            date: timestamp,
        });
        
        // 3. Atualizar o Produto (Diminuir stock ou marcar como vendido se quantidade for 1)
        if (item.product.quantity === item.quantity) {
             batch.update(productRef, { status: 'vendido', quantity: 0 });
        } else {
             batch.update(productRef, { quantity: item.product.quantity - item.quantity });
        }
        
        // 4. Se a verificação estiver ativa, notificar o vendedor
        if (isVerified) {
             const notificationRef = doc(collection(db, 'notifications'));
             batch.set(notificationRef, {
                 userId: item.product.userId, // Vendedor
                 message: `O artigo "${item.product.name}" foi vendido com verificação ativada. Verifique os detalhes.`,
                 link: `/dashboard`,
                 read: false,
                 createdAt: timestamp,
             });
        }
    }
    
    // 5. Commit de todas as operações
    await batch.commit();

    // 6. Limpar o carrinho local após o sucesso
    clearCart();

  }, [cartItems, clearCart, isVerificationEnabled]);
  
  
  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);
  
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const verificationFee = useMemo(() => {
    return isVerificationEnabled ? VERIFICATION_FEE : 0;
  }, [isVerificationEnabled]);
  
  const total = useMemo(() => {
      return subtotal + verificationFee;
  }, [subtotal, verificationFee]);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    cartCount,
    subtotal,
    verificationFee,
    total,
    isVerificationEnabled,
    toggleVerification,
    finalizeCheckout,
  }), [cartItems, addToCart, removeFromCart, updateItemQuantity, clearCart, cartCount, subtotal, verificationFee, total, isVerificationEnabled, toggleVerification, finalizeCheckout]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}