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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

const availableBrands = ["Nike", "Adidas", "Zara", "H&M", "Apple", "Samsung", "Fnac", "Outro"];
const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function SettingsPage() {
  const { user, loading, logout, updateUserPreferences } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
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
      setSelectedBrands(user.preferredBrands || []);
      setSelectedSizes(user.preferredSizes || []);
    }
  }, [user, loading, router, toast]);

  if (loading || !user) {
    return (
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const handleCheckboxChange = (
    value: string, 
    checked: boolean, 
    currentValues: string[], 
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newValues = checked ? [...currentValues, value] : currentValues.filter(v => v !== value);
    setter(newValues);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserPreferences({
        preferredBrands: selectedBrands,
        preferredSizes: selectedSizes,
      });
      toast({
        title: 'Definições Guardadas!',
        description: 'As suas preferências foram atualizadas com sucesso.',
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível guardar as suas preferências." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    logout();
    toast({
        title: "Conta Eliminada (Simulação)",
        description: "A sua conta foi eliminada com sucesso.",
    });
    router.push('/');
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Definições da Conta</h1>
        <p className="text-muted-foreground text-center max-w-md">Gira as tuas informações pessoais e preferências da plataforma.</p>
      </div>

      <form onSubmit={handleSaveChanges} className="space-y-8">
        {/* Secção de Detalhes do Perfil */}
        <Card className="shadow-soft rounded-xl">
          <CardHeader>
            <CardTitle>Detalhes do Perfil</CardTitle>
            <CardDescription>Informações básicas sobre a sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name ?? 'V'}`} />
                  <AvatarFallback>{user.name ? user.name.charAt(0) : 'V'}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{user.name}</p>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email!} disabled />
              </div>
          </CardContent>
        </Card>

        {/* Secção de Personalização */}
        <Card className="shadow-soft rounded-xl">
          <CardHeader>
            <CardTitle>Personalização do Feed</CardTitle>
            <CardDescription>Escolha as suas marcas e tamanhos preferidos para ver os artigos que mais lhe interessam.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Marcas Preferidas</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {availableBrands.map(brand => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox id={`brand-${brand}`} checked={selectedBrands.includes(brand)} onCheckedChange={(checked) => handleCheckboxChange(brand, !!checked, selectedBrands, setSelectedBrands)} />
                    <Label htmlFor={`brand-${brand}`} className="font-normal">{brand}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-base font-medium">Tamanhos Preferidos</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {availableSizes.map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox id={`size-${size}`} checked={selectedSizes.includes(size)} onCheckedChange={(checked) => handleCheckboxChange(size, !!checked, selectedSizes, setSelectedSizes)} />
                    <Label htmlFor={`size-${size}`} className="font-normal">{size}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secção de Ações */}
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 px-0 mt-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Eliminar Conta</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação não pode ser desfeita. Isto irá remover permanentemente a sua conta.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">Sim, eliminar conta</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Alterações
            </Button>
        </CardFooter>
      </form>
    </div>
  );
}