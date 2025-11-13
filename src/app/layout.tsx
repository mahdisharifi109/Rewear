import type {Metadata} from 'next';
import './globals.css';
import { ClientOnlyHeader } from '@/components/client-only-header';
import { CartProvider } from '@/context/cart-context';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { ProductProvider } from '@/context/product-context';
import { Suspense } from 'react';
import { Lora, Open_Sans } from 'next/font/google';
import { ClientOnlyFooter } from '@/components/client-only-footer';

export const metadata: Metadata = {
  title: 'Rewear — Moda Sustentável em Segunda Mão',
  description: 'Compre e venda roupa em segunda mão. Uma forma consciente de renovar o guarda-roupa e cuidar do planeta.',
};

function PageFallback() {
  return <div className="flex-1" />;
}

// Combinação de fontes escolhida manualmente para transmitir calor e autenticidade
// Lora: serif elegante para títulos, traz sofisticação sem frieza
// Open Sans: humanista para texto corrido, legível e acolhedora
const loraFont = Lora({ 
  subsets: ['latin'], 
  display: 'swap', 
  variable: '--font-heading',
  weight: ['400', '500', '600', '700']
});

const openSansFont = Open_Sans({ 
  subsets: ['latin'], 
  display: 'swap', 
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700']
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${loraFont.variable} ${openSansFont.variable}`}>
      <head></head>
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
                <div className="flex min-h-screen flex-col">
                  <ClientOnlyHeader />
                  <main id="main-content" className="flex-1">
                    <Suspense fallback={<PageFallback />}>
                      {children}
                    </Suspense>
                  </main>
                  <ClientOnlyFooter />
                </div>
                <Toaster />
              </CartProvider>
            </ProductProvider>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}