"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

export default function CartPage() {
  const { cartItems, removeFromCart, updateItemQuantity, cartCount, subtotal } = useCart();
  const shippingCost = 0; // Simulando envio grátis
  const total = subtotal + shippingCost;

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">O seu Carrinho</h1>
      </div>

      {cartCount > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          <div className="lg:col-span-2">
            <ul role="list" className="divide-y divide-border border-b border-t">
              {cartItems.map((item) => (
                <li key={item.id} className="flex py-6">
                  <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.product.imageUrls[0]}
                      alt={item.product.name}
                      width={112}
                      height={112}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium">
                        <h3><Link href={`/product/${item.product.id}`}>{item.product.name}</Link></h3>
                        <p className="ml-4 font-semibold">{(item.product.price * item.quantity).toFixed(2)}€</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.size ? `Tamanho: ${item.size}` : item.product.category}</p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateItemQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envio</span>
                  <span>{shippingCost > 0 ? `${shippingCost.toFixed(2)}€` : 'Grátis'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Finalizar Compra</Link>
                </Button>
                <div className="mt-4 text-center text-sm">
                  <Button asChild variant="link">
                    <Link href="/">ou Continuar a Comprar &rarr;</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">O seu carrinho está vazio</h3>
          <p className="mt-2 text-muted-foreground">Explore os nossos produtos e encontre algo que goste!</p>
          <Button asChild className="mt-6"><Link href="/">Procurar Produtos</Link></Button>
        </div>
      )}
    </div>
  );
}