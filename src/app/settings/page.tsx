"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState(user?.name || '');
  
  useEffect(() => {
    if (!loading && !user) {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Precisa de iniciar sessão para aceder às definições.",
      });
      router.push('/login');
    } else if (user) {
      setUsername(user.name || '');
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

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Alterações Guardadas!',
      description: 'As suas preferências de perfil foram atualizadas.',
    });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <form onSubmit={handleSaveChanges}>
        <Card>
          <CardHeader>
            <CardTitle>Definições</CardTitle>
            <CardDescription>Faça a gestão das suas informações de conta e preferências.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Secção do Perfil */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Perfil</h3>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name ?? 'V'}`} />
                  <AvatarFallback>{user.name ? user.name.charAt(0) : 'V'}</AvatarFallback>
                </Avatar>
                <div className='flex-1 space-y-2'>
                    <Label htmlFor="username">Nome de utilizador</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled />
                </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email!} disabled />
              </div>
            </div>

            <Separator />

            {/* Secção de Perigo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-destructive">Zona de Perigo</h3>
              <Card className="border-destructive">
                  <CardHeader>
                      <CardTitle className="text-destructive">Eliminar Conta</CardTitle>
                      <CardDescription>
                          Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente eliminados.
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
                                  Esta ação não pode ser desfeita. Isto irá remover permanentemente a sua conta.
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
          <CardFooter>
              <Button type="submit" className="w-full">Guardar Alterações</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}