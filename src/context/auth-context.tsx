"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth'; 
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface AppUser {
  uid: string;
  email: string | null;
  name: string;
  favorites: string[];
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
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
            favorites: userData.favorites || [], // Garante que a lista existe
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

  // --- FUNÇÃO toggleFavorite MELHORADA ---
  const toggleFavorite = useCallback(async (productId: string) => {
    if (!user) return;
    
    console.log("A tentar alterar favoritos para o produto:", productId);
    const userDocRef = doc(db, "users", user.uid);
    // Usar 'user.favorites' que já está no estado local da aplicação
    const isFavorited = user.favorites.includes(productId);

    try {
      if (isFavorited) {
        console.log("Produto já é favorito. A remover...");
        await updateDoc(userDocRef, { favorites: arrayRemove(productId) });
        // Atualiza o estado local para uma resposta imediata na interface
        setUser(currentUser => currentUser ? { ...currentUser, favorites: currentUser.favorites.filter(id => id !== productId) } : null);
        console.log("Removido com sucesso.");
      } else {
        console.log("Produto não é favorito. A adicionar...");
        await updateDoc(userDocRef, { favorites: arrayUnion(productId) });
        // Atualiza o estado local
        setUser(currentUser => currentUser ? { ...currentUser, favorites: [...currentUser.favorites, productId] } : null);
        console.log("Adicionado com sucesso.");
      }
    } catch (error) {
        console.error("ERRO AO ATUALIZAR FAVORITOS NA BASE DE DADOS:", error);
    }
  }, [user]);
  // --- FIM DA CORREÇÃO ---

  const value = useMemo(() => ({
    user,
    loading,
    logout,
    toggleFavorite,
  }), [user, loading, logout, toggleFavorite]);

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