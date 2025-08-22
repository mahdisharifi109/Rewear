"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useProducts } from '@/context/product-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, Star } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review } from '@/lib/types';

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

  const userProducts = useMemo(() => {
    if (!user) return [];
    return products.filter(p => p.userId === user.uid);
  }, [products, user]);

  const totalRevenue = useMemo(() => {
    return userProducts
      .filter(product => product.status === 'vendido')
      .reduce((acc, product) => acc + product.price, 0);
  }, [userProducts]);
  
  const activeListings = useMemo(() => {
      return userProducts.filter(p => p.status !== 'vendido').length;
  }, [userProducts]);

  const averageRating = useMemo(() => {
      if (reviews.length === 0) return 0;
      const total = reviews.reduce((acc, review) => acc + review.rating, 0);
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
      .filter(p => p.status === 'vendido' && p.createdAt)
      .forEach(product => {
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

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral das Vendas</CardTitle>
        </CardHeader>
        <CardContent>
            {monthlySalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlySalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))"
                          }}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Rendimento" unit="€" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex h-[300px] w-full items-center justify-center">
                    <p className="text-muted-foreground">Ainda não há dados de vendas para mostrar.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}