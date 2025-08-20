// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Importar getAuth

// As tuas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDD17WDp1lwMtD9qeubYD0NJ0VbdQ0P1jo",
  authDomain: "fir-config-12a50.firebaseapp.com",
  projectId: "fir-config-12a50",
  storageBucket: "fir-config-12a50.appspot.com",
  messagingSenderId: "580819717100",
  appId: "1:580819717100:web:38d3a481dd722eeb280ec9",
  measurementId: "G-DN1JZER9ZL"
};

// Inicializar a app Firebase de forma segura
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app); // Inicializar o Auth

export { app, db, auth }; // Exportar o auth
