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
    <div className="container mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <Wallet className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-4xl font-bold tracking-tight">A Minha Carteira</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Consulte o seu saldo e gira os seus ganhos.
        </p>
      </div>

      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-muted-foreground">Saldo Disponível</CardTitle>
          <CardDescription className="text-5xl font-bold tracking-tight text-primary">
            {user.walletBalance?.toFixed(2) ?? '0.00'}€
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="w-full max-w-xs" onClick={handleWithdraw}>
            <Banknote className="mr-2 h-5 w-5" />
            Levantar Saldo
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Os levantamentos são simulados e não resultam numa transferência real.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}