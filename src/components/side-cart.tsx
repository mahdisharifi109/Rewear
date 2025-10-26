"use client";

import { useCart } from "@/context/cart-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
// Importar Recycle para usar como logo no carrinho vazio
import { Minus, Plus, Trash2, Recycle } from "lucide-react"; 

interface SideCartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SideCart({ open, onOpenChange }: SideCartProps) {
  const { cartItems, removeFromCart, updateItemQuantity, subtotal, cartCount } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Carrinho ({cartCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <ul className="-my-6 divide-y divide-border">
                {cartItems.map(item => (
                  <li key={item.id} className="flex py-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={item.product.imageUrls[0]}
                        alt={item.product.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium">
                          <h3><Link href={`/product/${item.product.id}`}>{item.product.name}</Link></h3>
                          <p className="ml-4">{(item.product.price * item.quantity).toFixed(2)}€</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.size ? `Tamanho: ${item.size}` : ""}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <SheetFooter className="px-6 py-4 sm:flex-col sm:items-stretch sm:gap-4">
              <div className="flex justify-between text-lg font-medium">
                <p>Subtotal</p>
                <p>{subtotal.toFixed(2)}€</p>
              </div>
              <Button asChild size="lg" onClick={() => onOpenChange(false)}>
                <Link href="/cart">Ver Carrinho e Finalizar Compra</Link>
              </Button>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <Recycle className="h-12 w-12 text-primary" /> {/* <-- LOGO RECYCLE */}
            <p className="text-muted-foreground">O seu carrinho Rewear está vazio.</p>
            <Button asChild variant="outline" onClick={() => onOpenChange(false)}>
              <Link href="/">Continuar a Comprar</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}