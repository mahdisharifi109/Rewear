"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth'; 
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, increment } from 'firebase/firestore';

interface AppUser {
  uid: string;
  email: string | null;
  name: string;
  favorites: string[];
  preferredBrands?: string[];
  preferredSizes?: string[];
  walletBalance?: number; // NOVO CAMPO
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  updateUserPreferences: (preferences: { preferredBrands?: string[]; preferredSizes?: string[] }) => Promise<void>;
  addToWallet: (amount: number) => Promise<void>; // NOVA FUNÇÃO
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.username,
            favorites: userData.favorites || [],
            preferredBrands: userData.preferredBrands || [],
            preferredSizes: userData.preferredSizes || [],
            walletBalance: userData.walletBalance || 0, // Carregar o saldo
          });
        } else {
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }, []);

  const toggleFavorite = useCallback(async (productId: string) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const isFavorited = user.favorites.includes(productId);
    try {
      if (isFavorited) {
        await updateDoc(userDocRef, { favorites: arrayRemove(productId) });
        setUser(currentUser => currentUser ? { ...currentUser, favorites: currentUser.favorites.filter(id => id !== productId) } : null);
      } else {
        await updateDoc(userDocRef, { favorites: arrayUnion(productId) });
        setUser(currentUser => currentUser ? { ...currentUser, favorites: [...currentUser.favorites, productId] } : null);
      }
    } catch (error) {
      console.error("ERRO AO ATUALIZAR FAVORITOS:", error);
      throw error;
    }
  }, [user]);

  const updateUserPreferences = useCallback(async (preferences: { preferredBrands?: string[]; preferredSizes?: string[] }) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      await setDoc(userDocRef, preferences, { merge: true });
      setUser(currentUser => currentUser ? { ...currentUser, ...preferences } : null);
    } catch (error) {
      console.error("Erro ao atualizar preferências:", error);
      throw error;
    }
  }, [user]);

  // --- NOVA FUNÇÃO PARA ATUALIZAR A CARTEIRA ---
  const addToWallet = useCallback(async (amount: number) => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      try {
          await updateDoc(userDocRef, {
              walletBalance: increment(amount)
          });
          setUser(currentUser => currentUser ? { ...currentUser, walletBalance: (currentUser.walletBalance || 0) + amount } : null);
      } catch (error) {
          console.error("Erro ao adicionar ao saldo da carteira:", error);
          throw error;
      }
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    logout,
    toggleFavorite,
    updateUserPreferences,
    addToWallet, // Adicionar a nova função
  }), [user, loading, logout, toggleFavorite, updateUserPreferences, addToWallet]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}