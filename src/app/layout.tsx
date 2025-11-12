import type {Metadata} from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { CartProvider } from '@/context/cart-context';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { ProductProvider } from '@/context/product-context';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { ClientOnlyFooter } from '@/components/client-only-footer';

export const metadata: Metadata = {
  title: 'Rewear', // <-- ALTERADO
  description: 'Compre e venda artigos em segunda mão.',
};

function PageFallback() {
  return <div className="flex-1" />;
}

// Fonts (avaliadas em build, não em runtime)
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${inter.variable}`}>
      <head></head>
      {/* O body agora está limpo, sem classes de overflow */}
      <body className="font-sans antialiased">
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <ProductProvider>
              <CartProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">
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