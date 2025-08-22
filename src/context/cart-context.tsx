"use client";

import type { CartItem, Product, AddToCartPayload } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

const VERIFICATION_FEE = 5.00; // Taxa de verificação de 5€

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (payload: AddToCartPayload) => void;
  removeFromCart: (cartItemId: string) => void;
  updateItemQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  verificationFee: number; // NOVO
  total: number; // NOVO
  isVerificationEnabled: boolean; // NOVO
  toggleVerification: () => void; // NOVA FUNÇÃO
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isVerificationEnabled, setIsVerificationEnabled] = useState(false); // NOVO ESTADO

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
    setIsVerificationEnabled(false); // Resetar ao limpar
  };

  const toggleVerification = useCallback(() => {
    setIsVerificationEnabled(prev => !prev);
  }, []);

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
  }), [cartItems, addToCart, removeFromCart, updateItemQuantity, cartCount, subtotal, verificationFee, total, isVerificationEnabled, toggleVerification]);

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