// Ficheiro: src/lib/firebase.ts
// Imports modulares otimizados para reduzir bundle size

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// As tuas credenciais do Firebase a partir de variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Inicializar a app Firebase de forma segura
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Evita inicializar Auth no ambiente Node (scripts) para não exigir API Key válida
let auth: import('firebase/auth').Auth | null = null;
if (typeof window !== 'undefined') {
  try {
    auth = getAuth(app);
  } catch (e) {
    // Ignorar em SSR/scripts
  }
}

const storage = getStorage(app);

export { app, db, auth, storage };