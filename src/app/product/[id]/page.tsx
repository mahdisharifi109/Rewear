"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useProducts } from '@/context/product-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { UserCircle } from 'lucide-react'; // Importar ícone

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { user } = useAuth();
  
  const id = params.id as string;
  const product = products.find(p => p.id === id);

  const isOwner = user && product && user.email === product.userEmail;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold">Produto não encontrado</h1>
        <p className="mt-4 text-muted-foreground">O produto que procura não existe ou foi removido.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const handleEdit = () => {
    router.push(`/product/${product.id}/edit`);
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {product.imageUrls.map((url, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square relative">
                        <Image
                          src={url}
                          alt={`${product.name} - imagem ${index + 1}`}
                          data-ai-hint={product.imageHint}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-16" />
            <CarouselNext className="mr-16" />
          </Carousel>
        </div>
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <Badge variant="outline">{product.category}</Badge>
                <Badge variant="secondary">{product.condition}</Badge>
            </div>
            <h1 className="text-4xl font-bold mt-4">{product.name}</h1>
            
            {/* Informação do Vendedor Adicionada Aqui */}
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <UserCircle className="h-4 w-4" />
                <span>Vendido por <strong>{product.userName || 'Vendedor anónimo'}</strong></span>
            </div>

            <p className="text-3xl font-bold text-primary mt-4">{product.price.toFixed(2)}€</p>
            
            <Separator className="my-6" />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Descrição</h2>
                <p className="text-muted-foreground">{product.description}</p>
            </div>

            <Separator className="my-6" />

            <div className="mt-auto space-y-4">
                 {isOwner ? (
                    <Button size="lg" className="w-full" onClick={handleEdit}>Editar Anúncio</Button>
                 ) : (
                    <Button size="lg" className="w-full" onClick={handleAddToCart}>Adicionar ao Carrinho</Button>
                 )}
                 <Button size="lg" variant="outline" className="w-full">Contactar Vendedor</Button>
            </div>
        </div>
      </div>
    </div>
  );
}
