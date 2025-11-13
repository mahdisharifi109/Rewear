'use client';

import { ProductProvider } from '@/context/product-context';
import { CartProvider } from '@/context/cart-context';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ProductProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ProductProvider>
  );
}
