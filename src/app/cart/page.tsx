"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, ShoppingCart, CreditCard } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const { cartItems, removeFromCart, cartCount, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { toast } = useToast();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
        title: "Pagamento Concluído!",
        description: "A sua compra foi processada com sucesso. (Simulação)",
    });
    clearCart();
    setIsCheckoutOpen(false);
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          O seu Carrinho de Compras
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Reveja os seus artigos e finalize a sua compra simulada.
        </p>
      </div>

      <div className="mt-12">
        {cartCount > 0 ? (
            <Card>
                <CardHeader>
                    <CardTitle>Artigos no Carrinho ({cartCount})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flow-root">
                        <ul role="list" className="-my-6 divide-y divide-border">
                        {cartItems.map((item) => (
                            <li key={item.product.id} className="flex py-6 px-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                                    <Image
                                    src={item.product.imageUrls[0]}
                                    alt={item.product.name}
                                    data-ai-hint={item.product.imageHint}
                                    width={96}
                                    height={96}
                                    className="h-full w-full object-cover object-center"
                                    />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                    <div className="flex justify-between text-base font-medium text-foreground">
                                        <h3>
                                        <Link href={`/product/${item.product.id}`}>{item.product.name}</Link>
                                        </h3>
                                        <p className="ml-4">{(item.product.price * item.quantity).toFixed(2)}€</p>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">{item.product.category}</p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className="text-muted-foreground">Qtd: {item.quantity}</p>

                                    <div className="flex">
                                        <button
                                        type="button"
                                        className="font-medium text-primary hover:text-primary/80"
                                        onClick={() => removeFromCart(item.product.id)}
                                        >
                                        Remover
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                        </ul>
                    </div>
                </CardContent>
                <Separator />
                <CardFooter className="flex-col items-stretch p-6">
                    <div className="flex justify-between text-base font-medium text-foreground">
                        <p>Subtotal</p>
                        <p>{subtotal.toFixed(2)}€</p>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">Custos de envio e taxas serão calculados no checkout.</p>
                    <div className="mt-6">
                        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full" size="lg">Simular Pagamento</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Finalizar Pagamento</DialogTitle>
                                    <DialogDescription>
                                        Isto é uma simulação. Nenhum pagamento real será processado.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handlePayment}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="card-name">Nome no Cartão</Label>
                                            <Input id="card-name" placeholder="O seu nome completo" required />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="card-number">Número do Cartão</Label>
                                            <Input id="card-number" placeholder="0000 0000 0000 0000" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="expiry-date">Validade</Label>
                                                <Input id="expiry-date" placeholder="MM/AA" required />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="cvc">CVC</Label>
                                                <Input id="cvc" placeholder="123" required />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full">
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Pagar {subtotal.toFixed(2)}€
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-muted-foreground">
                        <p>
                        ou{' '}
                        <Link href="/" className="font-medium text-primary hover:text-primary/80">
                            Continuar a Comprar
                            <span aria-hidden="true"> &rarr;</span>
                        </Link>
                        </p>
                    </div>
                </CardFooter>
            </Card>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
             <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">O seu carrinho está vazio</h3>
            <p className="mt-2 text-muted-foreground">
              Explore os nossos produtos e encontre algo que goste!
            </p>
             <Button asChild className="mt-6">
                <Link href="/">Procurar Produtos</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
