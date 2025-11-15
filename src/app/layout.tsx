import type {Metadata} from 'next';
import './globals.css';
import { ClientOnlyHeader } from '@/components/client-only-header';
import { CartProvider } from '@/context/cart-context';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { ProductProvider } from '@/context/product-context';
import { Suspense } from 'react';
import { ClientOnlyFooter } from '@/components/client-only-footer';
import { ErrorBoundary } from '@/components/error-boundary';

export const metadata: Metadata = {
  title: 'Rewear — Moda Sustentável em Segunda Mão',
  description: 'Compre e venda roupa em segunda mão. Uma forma consciente de renovar o guarda-roupa e cuidar do planeta.',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

function PageFallback() {
  return <div className="flex-1" />;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        {/* Google Fonts carregadas via CDN para evitar timeout no build */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      {/* Aplicando a fonte Open Sans no body para um visual mais humano e acolhedor */}
      <body className="font-body antialiased">
        {/* Skip link para acessibilidade: permite saltar diretamente para o conteúdo principal */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-elevated"
        >
          Ir para o conteúdo
        </a>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <ProductProvider>
              <CartProvider>
                <ErrorBoundary>
                  <div className="flex min-h-screen flex-col">
                    <ClientOnlyHeader />
                    <main id="main-content" className="flex-1" role="main">
                      <Suspense fallback={<PageFallback />}>
                        {children}
                      </Suspense>
                    </main>
                    <ClientOnlyFooter />
                  </div>
                </ErrorBoundary>
                <Toaster />
              </CartProvider>
            </ProductProvider>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}