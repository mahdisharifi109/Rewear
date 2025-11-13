'use client';

import { useEffect } from 'react';

/**
 * Componente para registar o Service Worker para PWA
 * Deve ser incluído no layout principal
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registado com sucesso:', registration.scope);
          })
          .catch((error) => {
            console.log('Falha no registo do Service Worker:', error);
          });
      });
    }
  }, []);

  return null;
}
