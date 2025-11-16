"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas";
import { auth, db } from "@/lib/firebase";
import { logger } from '@/lib/logger';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Loader2 } from "lucide-react";


export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      if (!auth) {
        throw new Error('Firebase Auth não está disponível.');
      }
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Adicionar o novo utilizador ao Firestore com a carteira a 0
      await setDoc(doc(db, "users", user.uid), {
        username: data.username,
        email: data.email,
        favorites: [],
        walletBalance: 0, // INICIALIZAR CARTEIRA
      });

      toast({
        title: "Conta Criada!",
        description: "Bem-vindo à Rewear!", // <-- ALTERADO
      });
      router.push('/');

    } catch (error) {
      logger.error("Erro no registo:", error);
      let description = "Ocorreu um erro. Por favor, tente novamente.";
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        description = "Este email já está a ser utilizado por outra conta.";
      }
      toast({
        variant: "destructive",
        title: "Erro no Registo",
        description: description,
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>Junte-se à Rewear e comece a comprar e vender.</CardDescription> {/* <-- ALTERADO */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de utilizador</Label>
              <Input id="username" type="text" placeholder="oseuusername" {...register("username")} />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="o.seu@email.com" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Palavra-passe</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicie sessão
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}