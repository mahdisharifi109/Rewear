
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Precisa de iniciar sessão para aceder às definições.",
      });
      router.push('/login');
    }
  }, [user, loading, router, toast]);

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <p>A carregar definições...</p>
      </div>
    );
  }

  const handleDeleteAccount = () => {
    logout();
    toast({
        title: "Conta Eliminada (Simulação)",
        description: "A sua conta foi eliminada com sucesso.",
    });
    router.push('/');
  }

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Alterações Guardadas (Simulação)',
      description: 'As suas informações de perfil foram atualizadas.',
    });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Definições</CardTitle>
          <CardDescription>Faça a gestão das suas informações de conta e preferências.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleSaveChanges} className="space-y-4">
            <h3 className="text-lg font-medium">Perfil</h3>
            <div className="space-y-2">
                <Label htmlFor="username">Nome de utilizador</Label>
                <Input id="username" defaultValue={user.name} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
            </div>
            <Button type="submit">Guardar Alterações</Button>
          </form>

          <Separator />
          
           <form onSubmit={handleSaveChanges} className="space-y-4">
            <h3 className="text-lg font-medium">Palavra-passe</h3>
            <div className="space-y-2">
                <Label htmlFor="current-password">Palavra-passe Atual</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="new-password">Nova Palavra-passe</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
            <Button>Alterar Palavra-passe</Button>
          </form>
          
          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-destructive">Zona de Perigo</h3>
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Eliminar Conta</CardTitle>
                    <CardDescription>
                        Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente eliminados da plataforma (de forma simulada).
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Eliminar a minha conta</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isto irá remover permanentemente a sua conta e os seus dados dos nossos servidores (simulados).
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                                Sim, eliminar conta
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
