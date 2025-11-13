"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, Banknote } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { WalletTransaction } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center" role="status" aria-live="polite" aria-label="A carregar carteira">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [iban, setIban] = useState(user.iban || '');
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    const loadTx = async () => {
      try {
        const q = query(
          collection(db, 'wallet_transactions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as WalletTransaction[];
        setTransactions(rows);
      } catch (e) {
        // silencioso; coleção pode não existir ainda
      }
    };
    loadTx();
  }, [user.uid]);

  const walletAvailable = useMemo(() => (user.wallet?.available ?? user.walletBalance ?? 0), [user.wallet?.available, user.walletBalance]);
  const walletPending = useMemo(() => (user.wallet?.pending ?? 0), [user.wallet?.pending]);

  const handleWithdrawConfirm = async () => {
    const amount = Number(withdrawAmount);
    if (!iban || iban.length < 10) {
      toast({ variant: 'destructive', title: 'IBAN inválido', description: 'Introduza um IBAN válido para levantar.' });
      return;
    }
    if (!amount || amount <= 0 || amount > walletAvailable) {
      toast({ variant: 'destructive', title: 'Montante inválido', description: 'O montante tem de ser positivo e <= saldo disponível.' });
      return;
    }
    // Simulação apenas
    setLoadingTx(true);
    setTimeout(() => {
      setLoadingTx(false);
      setWithdrawOpen(false);
      setWithdrawAmount('');
      toast({ title: 'Levantamento solicitado', description: 'Processaremos a transferência para o seu IBAN.' });
    }, 800);
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
            <CardTitle className="text-lg font-medium text-muted-foreground">Saldo</CardTitle>
            <div className="mt-2 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Disponível</p>
                <p className="text-4xl font-bold tracking-tight text-primary">{walletAvailable.toFixed(2)}€</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendente</p>
                <p className="text-xl font-semibold">{walletPending.toFixed(2)}€</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full max-w-xs">
                  <Banknote className="mr-2 h-4 w-4" />
                  Levantar Saldo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Levantamento</DialogTitle>
                  <DialogDescription>Introduza o montante e IBAN para receber o saldo disponível.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Montante (máx. {walletAvailable.toFixed(2)}€)</Label>
                    <Input type="number" min="0" step="0.01" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>IBAN</Label>
                    <Input placeholder="PT50..." value={iban} onChange={(e) => setIban(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleWithdrawConfirm} disabled={loadingTx}>{loadingTx ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null} Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

        {/* Card de Histórico de Transações */}
        <Card className="md:col-span-1 flex flex-col justify-between h-full">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-medium">Histórico de Transações</CardTitle>
            <CardDescription>Últimas movimentações da sua carteira.</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">Sem transações para mostrar.</p>
            ) : (
              <ul className="space-y-3">
                {transactions.map(tx => (
                  <li key={tx.id} className="flex items-center justify-between">
                    <span className="font-semibold text-muted-foreground capitalize">{tx.type}</span>
                    <span className={`font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-primary'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}€
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-muted-foreground text-center">Algumas secções são simuladas.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}