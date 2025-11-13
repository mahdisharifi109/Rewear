// src/app/catalog/page.tsx

"use client";

import { ProductGrid } from "@/components/product-grid";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { FilterChips } from "@/components/filter-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings } from "lucide-react";
import { SortBar } from "@/components/sort-bar";

function ProductGridFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  )
}

function PersonalizedFeedWrapper() {
    const { user, loading } = useAuth();

    if (loading) {
        return <ProductGridFallback />;
    }

    if (!user) {
        return (
            <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">Faça login para ver as suas recomendações personalizadas.</p>
                <Button asChild className="mt-4">
                    <Link href="/login?redirect=/catalog">Iniciar Sessão</Link>
                </Button>
            </div>
        )
    }

    if (!user.preferredBrands?.length && !user.preferredSizes?.length) {
        return (
            <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">Personalize o seu feed para ver recomendações.</p>
                <Button asChild className="mt-4" variant="outline">
                    <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Ir para Definições
                    </Link>
                </Button>
            </div>
        )
    }

    return <ProductGrid personalized />;
}


export default function CatalogPage() {
  return (
    <div className="container py-12">
        <Tabs defaultValue="explore">
            <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="explore">Explorar</TabsTrigger>
                <TabsTrigger value="for-you">Para Ti</TabsTrigger>
            </TabsList>
            
            <TabsContent value="explore">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <aside className="md:col-span-1">
                        <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                            <FiltersSidebar />
                        </Suspense>
                    </aside>
                    <main className="md:col-span-3">
                        <SortBar />
                        <FilterChips />
                        <Suspense fallback={<ProductGridFallback/>}>
                            <ProductGrid />
                        </Suspense>
                    </main>
                </div>
            </TabsContent>

            <TabsContent value="for-you">
                <Suspense fallback={<ProductGridFallback />}>
                    <PersonalizedFeedWrapper />
                </Suspense>
            </TabsContent>
        </Tabs>
    </div>
  );
}