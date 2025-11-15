'use client';

import { useEffect } from 'react';

/**
 * Client Component para registar o Service Worker
 * Carrega apenas no cliente, nunca no servidor
 */
export function ClientServiceWorker() {
  useEffect(() => {
    // Verificar se Service Worker está disponível
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Registar o Service Worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registado com sucesso:', registration.scope);
        })
        .catch((error) => {
          console.warn('⚠️ Erro ao registar Service Worker:', error);
        });
    }
  }, []);

  return null;
}
