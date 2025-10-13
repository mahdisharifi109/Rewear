import { ProductGrid } from "@/components/product-grid";
import { HowItWorks } from "@/components/how-it-works";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

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
      <section className="bg-primary/10">
        <div className="container px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Dê uma segunda vida à sua roupa.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Junte-se à nossa comunidade e comece a vender os artigos que já não usa. É grátis, fácil e bom para o planeta.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/sell">Começar a Vender</Link>
              </Button>
            </div>
        </div>
      </section>

      {/* Grelha de Produtos - Com a estrutura de layout corrigida */}
      <div className="container px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1">
            <Suspense fallback={<ProductGridFallback/>}>
              <ProductGrid />
            </Suspense>
        </div>
      </div>

      {/* Secção "Como Funciona" */}
      <HowItWorks />
    </>
  );
}