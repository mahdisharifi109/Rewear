"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, Banknote } from 'lucide-react';

export default function WalletPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Precisa de iniciar sessão para aceder à sua carteira.",
      });
      router.push('/login?redirect=/wallet');
    }
  }, [user, loading, router, toast]);

  if (loading || !user) {
    return (
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleWithdraw = () => {
    toast({
      title: "Levantamento Simulado",
      description: "Numa aplicação real, o seu saldo seria transferido para a sua conta bancária."
    });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-10">
      {/* Título e ícone centralizados */}
      <div className="flex flex-col items-center mb-6">
        <Wallet className="h-14 w-14 text-primary mb-2" />
        <h1 className="text-4xl font-bold tracking-tight mb-2">A Minha Carteira</h1>
        <p className="text-lg text-muted-foreground text-center max-w-md">Consulte o seu saldo, transações e gira os seus ganhos de forma simples.</p>
      </div>

      {/* Grid principal: Saldo + Ações + Histórico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card de Saldo */}
        <Card className="md:col-span-1 flex flex-col justify-between h-full">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-medium text-muted-foreground">Saldo Disponível</CardTitle>
            <CardDescription className="text-5xl font-bold tracking-tight text-primary mt-2">
              {user.walletBalance?.toFixed(2) ?? '0.00'}€
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Button size="lg" className="w-full max-w-xs" onClick={handleWithdraw}>
              <Banknote className="mr-2 h-4 w-4" />
              Levantar Saldo
            </Button>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Os levantamentos são simulados e não resultam numa transferência real.
            </p>
          </CardContent>
        </Card>

        {/* Card de Ações rápidas (placeholder para futuras funcionalidades) */}
        <Card className="md:col-span-1 flex flex-col justify-between h-full">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-medium">Ações Rápidas</CardTitle>
            <CardDescription>Em breve: transferir, adicionar fundos, etc.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-full">
            <Button variant="outline" className="w-full max-w-xs mb-2" disabled>
              Transferir para Conta Bancária
            </Button>
            <Button variant="outline" className="w-full max-w-xs" disabled>
              Adicionar Fundos
            </Button>
          </CardContent>
        </Card>

        {/* Card de Histórico de Transações (mockup) */}
        <Card className="md:col-span-1 flex flex-col justify-between h-full">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-medium">Histórico de Transações</CardTitle>
            <CardDescription>Últimas movimentações da sua carteira.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mockup de histórico */}
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Venda de artigo</span>
                <span className="font-bold text-green-600">+12,00€</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Compra de artigo</span>
                <span className="font-bold text-primary">-8,50€</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Levantamento</span>
                <span className="font-bold text-yellow-600">-20,00€</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Bónus de boas-vindas</span>
                <span className="font-bold text-green-600">+5,00€</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground text-center">Movimentações simuladas para demonstração.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}