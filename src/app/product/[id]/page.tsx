"use client";

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProducts } from '@/context/product-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Minus, Plus, Heart } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { user } = useAuth();
  
  const id = params.id as string;
  const product = useMemo(() => products.find(p => p.id === id), [products, id]);

  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold">Produto não encontrado</h1>
        <p className="mt-4 text-muted-foreground">O produto que procura não existe ou foi removido.</p>
      </div>
    );
  }

  const isOwner = user && user.uid === product.userId;
  const hasSizes = product.sizes && product.sizes.length > 0;
  const isAddToCartDisabled = (hasSizes && !selectedSize) || !!isOwner || product.quantity < 1;

  const handleAddToCart = () => {
    if (isAddToCartDisabled) return;
    addToCart({ product, quantity, size: selectedSize });
    toast({
      title: "Adicionado ao carrinho",
      description: `${quantity} x ${product.name} foi adicionado.`,
    });
  };

  const handleEdit = () => {
    router.push(`/product/${product.id}/edit`);
  };
  
  const detailItems = [
    { label: "Marca", value: product.brand },
    { label: "Categoria", value: product.category },
    { label: "Condição", value: product.condition },
    { label: "Material", value: product.material },
  ].filter(item => item.value);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <Carousel className="w-full">
            <CarouselContent>
              {product.imageUrls.map((url, index) => (
                <CarouselItem key={index}>
                    <div className="aspect-[4/3] relative bg-muted rounded-lg overflow-hidden">
                      <Image src={url} alt={`${product.name} - imagem ${index + 1}`} fill className="object-contain" />
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-16" />
            <CarouselNext className="mr-16" />
          </Carousel>
        </div>

        <div className="flex flex-col space-y-6">
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold">{product.name}</h1>
                            <Link href={`/seller/${product.userId}`} className="inline-block">
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                                    <Avatar className="h-6 w-6">
                                        {/* AVATAR ATUALIZADO PARA O ESTILO "INICIAIS" */}
                                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${product.userName ?? 'V'}`} />
                                        <AvatarFallback>{product.userName ? product.userName.charAt(0) : 'V'}</AvatarFallback>
                                    </Avatar>
                                    <span>{product.userName || 'Vendedor anónimo'}</span>
                                </div>
                            </Link>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-bold text-primary">{product.price.toFixed(2)}€</p>
                           <p className="text-xs text-muted-foreground mt-1">Proteção ao Comprador incluída</p>
                        </div>
                    </div>
                    
                    <Separator />

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                       {detailItems.map(item => (
                           <React.Fragment key={item.label}>
                               <span className="text-muted-foreground">{item.label}</span>
                               <span className="font-medium text-right">{item.value}</span>
                           </React.Fragment>
                       ))}
                    </div>

                    <Separator />
                    <p className="text-sm text-foreground leading-relaxed">{product.description}</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 space-y-4">
                    {hasSizes && (
                        <div>
                            <Label className="text-base font-medium">Tamanho</Label>
                            <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2 mt-2">
                              {product.sizes!.map(size => (
                                <div key={size}>
                                  <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                                  <Label htmlFor={`size-${size}`} className={cn("flex items-center justify-center rounded-md border-2 px-3 py-1.5 text-sm font-medium cursor-pointer", "hover:bg-accent focus:outline-none", selectedSize === size ? "bg-primary text-primary-foreground border-primary" : "bg-transparent")}>{size}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                        </div>
                    )}
                    
                    {product.quantity > 1 && (
                      <div>
                         <Label className="text-base font-medium">Quantidade</Label>
                         <div className="flex items-center gap-2 mt-2">
                              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                              <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}><Plus className="h-4 w-4" /></Button>
                         </div>
                         <p className="text-xs text-muted-foreground mt-1">{product.quantity} disponíveis</p>
                      </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-3">
                {isOwner ? (
                    <Button size="lg" className="w-full" onClick={handleEdit}>Editar Anúncio</Button>
                ) : (
                    <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={isAddToCartDisabled}>
                        {product.quantity < 1 ? "Esgotado" : (isAddToCartDisabled ? "Selecione as opções" : "Adicionar ao Carrinho")}
                    </Button>
                )}
                <Button size="lg" variant="secondary" className="w-full">Contactar Vendedor</Button>
                <Button size="lg" variant="ghost" className="w-full" onClick={() => setIsFavorited(!isFavorited)}>
                    <Heart className={cn("mr-2 h-5 w-5", isFavorited && "fill-red-500 text-red-500")} />
                    {isFavorited ? "Guardado" : "Guardar nos Favoritos"}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}