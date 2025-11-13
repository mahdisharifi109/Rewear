"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useProducts } from '@/context/product-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import { DollarSign, Package, Star } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Review } from '@/lib/types';
import { StarRating } from '@/components/ui/star-rating';

// Code-split Recharts - import all at once to avoid type issues
const RechartsChart = dynamic(() => import('@/components/recharts-chart'), { 
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
});

export function SellerDashboard() {
  const { user } = useAuth();
  const { products } = useProducts();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchReviews = async () => {
      try {
        const reviewsQuery = query(collection(db, 'reviews'), where("sellerId", "==", user.uid));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const sellerReviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
        setReviews(sellerReviews);
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error);
      } finally {
        setLoadingReviews(false);
      }
    };
    
    fetchReviews();
  }, [user]);

  const userProducts = useMemo<Product[]>(() => {
    if (!user) return [];
    return products.filter((p: Product) => p.userId === user.uid);
  }, [products, user]);

  const totalRevenue = useMemo(() => {
    return userProducts
      .filter((product: Product) => product.status === 'vendido')
      .reduce((acc: number, product: Product) => acc + product.price, 0);
  }, [userProducts]);
  
    const activeListings = useMemo(() => {
      return userProducts.filter((p: Product) => p.status !== 'vendido').length;
  }, [userProducts]);

  const averageRating = useMemo(() => {
      if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc: number, review: Review) => acc + review.rating, 0);
      return total / reviews.length;
  }, [reviews]);

  // --- LÓGICA NOVA PARA O GRÁFICO ---
  const monthlySalesData = useMemo(() => {
    const salesByMonth: { [key: string]: number } = {};
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    // Inicializa todos os meses com 0
    monthNames.forEach(month => {
        const year = new Date().getFullYear();
        salesByMonth[`${month}-${year}`] = 0;
    });

    userProducts
      .filter((p: Product) => p.status === 'vendido' && p.createdAt)
      .forEach((product: Product) => {
        const saleDate = product.createdAt!.toDate();
        const month = monthNames[saleDate.getMonth()];
        const year = saleDate.getFullYear();
        const key = `${month}-${year}`;
        salesByMonth[key] = (salesByMonth[key] || 0) + product.price;
      });

    // Formata os dados para o gráfico, mostrando apenas os últimos 6 meses com vendas
    return Object.entries(salesByMonth)
      .map(([monthYear, revenue]) => ({
        month: monthYear.split('-')[0],
        revenue,
      }))
      .filter(item => item.revenue > 0) // Podes remover isto se quiseres mostrar meses com 0 vendas
      .slice(-6); // Mostra apenas os últimos 6 meses de dados
  }, [userProducts]);
  // --- FIM DA LÓGICA NOVA ---


  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Dashboard do Vendedor</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Olá, {user?.name}! Aqui está um resumo da sua atividade.
        </p>
      </div>
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">Total de artigos vendidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artigos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings}</div>
            <p className="text-xs text-muted-foreground">Produtos atualmente à venda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingReviews ? '...' : averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Baseado em {reviews.length} avaliações</p>
          </CardContent>
        </Card>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral das Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <RechartsChart data={monthlySalesData} />
        </CardContent>
      </Card>
      <Separator />

      {/* Últimas Avaliações */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Últimas Avaliações</h2>
        {loadingReviews ? (
          <p className="text-muted-foreground">Carregando avaliações...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma avaliação recebida ainda.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 3).map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{review.buyerName}</span>
                    <StarRating rating={review.rating} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}