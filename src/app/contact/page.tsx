"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Mensagem Enviada!",
      description: "Obrigado por nos contactar. Responderemos em breve.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Contacte-nos
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Tem alguma questão ou feedback? Adoraríamos ouvir de si.
        </p>
      </div>

      <div className="mt-12">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6">
          <div>
            <Label htmlFor="name" className="sr-only">Nome</Label>
            <Input type="text" name="name" id="name" required placeholder="O seu nome" />
          </div>
          <div>
            <Label htmlFor="email" className="sr-only">Email</Label>
            <Input type="email" name="email" id="email" required placeholder="O seu email" />
          </div>
          <div>
            <Label htmlFor="message" className="sr-only">Mensagem</Label>
            <Textarea name="message" id="message" rows={6} required placeholder="A sua mensagem" />
          </div>
          <div>
            <Button type="submit" className="w-full">
              Enviar Mensagem
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
