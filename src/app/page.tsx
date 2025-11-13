import { ProductGrid } from "@/components/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Lazy load do vídeo promocional (client component)
const PromotionalVideo = dynamic(() => import("@/components/promotional-video"), {
  loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
});

// Lazy load de HowItWorks
const ClientOnlyHowItWorks = dynamic(() => import("@/components/client-only-how-it-works").then(m => ({ default: m.ClientOnlyHowItWorks })), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
});

function ProductGridFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 via-primary/10 to-background">
        <div className="container px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Dê uma segunda vida à sua roupa
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Junte-se à nossa comunidade e comece a vender os artigos que já não usa. É grátis, fácil e bom para o planeta.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/sell">Começar a Vender</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link href="/catalog">Explorar Produtos</Link>
              </Button>
            </div>
        </div>
      </section>      {/* Grelha de Produtos */}
      <div className="container px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-heading">
            Descubra Tesouros Únicos
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore a nossa seleção de artigos em segunda mão, cuidadosamente escolhidos pela comunidade.
          </p>
        </div>
        <Suspense fallback={<ProductGridFallback/>}>
          <ProductGrid />
        </Suspense>
      </div>
      
      {/* Promotional Video Section - Lazy Loaded */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-heading">Veja como é fácil!</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
            Em poucos passos, publique o seu anúncio e conecte-se com compradores interessados.
          </p>
          <PromotionalVideo />
        </div>
      </section>

      {/* Secção "Como Funciona" */}
  <ClientOnlyHowItWorks />
    </>
  );
}