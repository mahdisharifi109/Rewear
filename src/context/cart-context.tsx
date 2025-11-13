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
  // finalizeCheckout removido
  createSecureCheckoutPayload?: () => { cartItems: CartItem[]; isVerificationEnabled: boolean; subtotal: number; total: number };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isVerificationEnabled, setIsVerificationEnabled] = useState(false); 

  // Optimistic UI: adiciona ao carrinho imediatamente sem esperar resposta do servidor
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
    
    // Feedback visual imediato para o utilizador
    if (typeof window !== 'undefined') {
      // Animação ou notificação pode ser adicionada aqui
      const event = new CustomEvent('cart:item-added', { 
        detail: { product, quantity, size } 
      });
      window.dispatchEvent(event);
    }
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
  }, []);

  // Optimistic UI: atualiza quantidade imediatamente
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

  // Função para criar payload seguro para o backend
  function createSecureCheckoutPayload() {
    return {
      cartItems,
      isVerificationEnabled,
      subtotal,
      total,
    };
  }
  
  
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
  createSecureCheckoutPayload: createSecureCheckoutPayload,
  }), [cartItems, addToCart, removeFromCart, updateItemQuantity, clearCart, cartCount, subtotal, verificationFee, total, isVerificationEnabled, toggleVerification]);

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
  // Garante que createSecureCheckoutPayload existe antes de retornar
  return {
    ...context,
    ...(context && typeof context.createSecureCheckoutPayload === 'function' ? { createSecureCheckoutPayload: context.createSecureCheckoutPayload } : {}),
  };
}