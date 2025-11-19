// ================================================================
// QUERY PROVIDER - TanStack Query Client (Client Component)
// ================================================================
// Wrapper para QueryClientProvider que funciona com Next.js 15 App Router
// Resolve erro: "Only plain objects can be passed to Client Components"
// ================================================================

"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  // ✅ useState garante que cada request tem sua própria instância
  // Evita estado compartilhado entre requests no servidor
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 30,   // 30 minutos (antes: cacheTime)
        retry: 1,
        refetchOnWindowFocus: false, // Evita refetches desnecessários
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
