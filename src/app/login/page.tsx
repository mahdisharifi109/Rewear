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
import { loginSchema, type LoginFormValues } from "@/lib/schemas"; // Corrigido

export default function LoginPage() {
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { // Adicionado para consistência
      email: "",
      password: "",
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    // Simulação de autenticação
    const user = {
        name: data.email.split('@')[0], // Nome de utilizador simulado
        email: data.email 
    };
    login(user);
    toast({
      title: "Login (Simulação)",
      description: "Sessão iniciada com sucesso! (Simulado)",
    });
    router.push('/');
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Iniciar Sessão</CardTitle>
          <CardDescription>Bem-vindo de volta! Aceda à sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <Button type="submit" className="w-full">
              Iniciar Sessão
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Registe-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}