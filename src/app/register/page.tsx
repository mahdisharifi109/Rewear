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
import { useAuth } from "@/context/auth-context";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas"; // Corrigido

export default function RegisterPage() {
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { // Adicionado para consistência
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  });

  const onSubmit = (data: RegisterFormValues) => {
    // Simulação de criação de conta e login
    const user = {
        name: data.username,
        email: data.email
    };
    login(user);

    toast({
      title: "Registo (Simulação)",
      description: "Conta criada com sucesso! (Simulado)",
    });
    router.push('/');
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>Junte-se à SecondWave e comece a comprar e vender.</CardDescription>
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
            <Button type="submit" className="w-full">
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
