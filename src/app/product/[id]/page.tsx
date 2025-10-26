// src/app/product/[id]/page.tsx

"use client";

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProducts } from '@/context/product-context';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, Loader2 } from 'lucide-react'; // REMOVIDO: Video
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { StarRating } from '@/components/ui/star-rating';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { Conversation } from '@/lib/types';
// REMOVIDO: Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { user, toggleFavorite } = useAuth();
  
  const id = params.id as string;
  const product = useMemo(() => products.find(p => p.id === id), [products, id]);
  
  const isFavorited = useMemo(() => user?.favorites?.includes(product?.id || '') || false, [user, product]);

  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  // REMOVIDO: useState para isAIVideoLoading e aiVideoUrl
  // const [isAIVideoLoading, setIsAIVideoLoading] = useState(false);
  // const [aiVideoUrl, setAiVideoUrl] = useState<string | null>(null);

  if (!product) {
    return <div className="container py-16 text-center"><h1 className="text-4xl font-bold">Produto não encontrado</h1></div>;
  }

  const isOwner = user && user.uid === product.userId;
  const hasSizes = product.sizes && product.sizes.length > 0 && product.sizes[0] !== '';
  const isAddToCartDisabled = (hasSizes && !selectedSize) || !!isOwner || product.quantity < 1;

  const handleAddToCart = () => {
    if (isAddToCartDisabled) return;
    addToCart({ product, quantity: 1, size: selectedSize });
    toast({ title: "Adicionado ao carrinho", description: `${product.name} foi adicionado.` });
  };

  const handleFavoriteClick = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Acesso Negado", description: "Precisa de fazer login para guardar favoritos." });
        return;
    }
    await toggleFavorite(product.id);
    toast({ title: !isFavorited ? "Guardado nos Favoritos" : "Removido dos Favoritos" });
  };
  
  const handleContactSeller = async () => {
    if (!user || isOwner) return;
    setIsCreatingChat(true);
    try {
        const buyerId = user.uid;
        const sellerId = product.userId;

        // 1. Tentar encontrar uma conversa existente entre COMPRADOR, VENDEDOR e sobre este PRODUTO
        const conversationsQuery = query(
            collection(db, "conversations"),
            where("participantIds", "array-contains", buyerId),
            where("product.id", "==", product.id)
        );
        
        const querySnapshot = await getDocs(conversationsQuery);
        
        // Refina a busca no cliente para garantir que o vendedor específico está no chat
        const existingConvo = querySnapshot.docs.find(doc => 
            doc.data().participantIds.includes(sellerId)
        );

        if (existingConvo) {
            router.push(`/inbox/${existingConvo.id}`);
        } else {
            // 2. Se não existir, cria uma nova conversa
            const newConvoRef = await addDoc(collection(db, 'conversations'), {
                participantIds: [buyerId, sellerId],
                participants: {
                    [buyerId]: { name: user.name, avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}` },
                    [sellerId]: { name: product.userName, avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${product.userName}` }
                },
                product: {
                    id: product.id,
                    name: product.name,
                    image: product.imageUrls[0],
                },
                createdAt: serverTimestamp(),
                lastMessage: { text: `Interesse no artigo: ${product.name}`, createdAt: serverTimestamp() }
            });
            router.push(`/inbox/${newConvoRef.id}`);
        }
    } catch (error) {
        console.error("Erro ao criar conversa:", error);
        toast({ variant: 'destructive', title: "Erro", description: "Não foi possível iniciar a conversa." });
    } finally {
        setIsCreatingChat(false);
    }
  }

  // REMOVIDO: Função handleAIVideoCreation

  return (
    <div className="bg-muted/40">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <Carousel className="w-full">
              <CarouselContent>
                {product.imageUrls.map((url, index) => (
                  <CarouselItem key={index}>
                      <div className="aspect-square relative bg-white rounded-lg overflow-hidden border">
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
              <div className="space-y-3">
                  <p className="text-3xl font-bold text-primary">{product.price.toFixed(2)}€</p>
                  <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                  <p className="text-muted-foreground">{product.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t pt-4">
                <span className="text-muted-foreground">Marca</span><span className="font-medium">{product.brand}</span>
                <span className="text-muted-foreground">Condição</span><span className="font-medium">{product.condition}</span>
              </div>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <Link href={`/seller/${product.userId}`} className="flex items-center gap-3 group">
                      <Avatar><AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${product.userName ?? 'V'}`} /><AvatarFallback>{product.userName ? product.userName.charAt(0) : 'V'}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-semibold group-hover:underline">{product.userName || 'Vendedor'}</p>
                        <StarRating rating={4.5} />
                      </div>
                    </Link>
                </CardContent>
              </Card>
              <div className="space-y-6">
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
                
                {/* REMOVIDO: O BOTÃO E DIÁLOGO DO VÍDEO IA */}
                
                <div className="space-y-3">
                  {isOwner ? (
                      <Button size="lg" className="w-full" onClick={() => router.push(`/product/${product.id}/edit`)}>Editar Anúncio</Button>
                  ) : (
                    <>
                      <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={isAddToCartDisabled}>
                          {product.quantity < 1 ? "Esgotado" : (isAddToCartDisabled ? "Selecione um tamanho" : "Adicionar ao Carrinho")}
                      </Button>
                       <Button size="lg" variant="outline" className="w-full" onClick={handleContactSeller} disabled={isCreatingChat}>
                          {isCreatingChat ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquare className="mr-2 h-5 w-5" />}
                          Contactar Vendedor
                      </Button>
                    </>
                  )}
                  <Button size="lg" variant="ghost" className="w-full" onClick={handleFavoriteClick}>
                      <Heart className={cn("mr-2 h-5 w-5", isFavorited && "fill-red-500 text-red-500")} />
                      {isFavorited ? "Guardado nos Favoritos" : "Guardar nos Favoritos"}
                  </Button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}