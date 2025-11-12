"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // SUBSTITUI ESTE EMAIL PELO TEU EMAIL PESSOAL OU PROFISSIONAL
    const recipientEmail = "0523072@alunos.epb.pt"; 
    
    const subject = `Nova Mensagem de ${name} - Rewear`;
    const body = `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`;

    // Cria o link mailto:
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Abre a aplicação de email do utilizador
    window.location.href = mailtoLink;

    toast({
      title: "Abrindo a sua aplicação de email...",
      description: "Por favor, envie a mensagem a partir do seu cliente de email.",
    });
  };

  return (
    <div className="bg-gradient-to-b from-muted/30 to-background min-h-screen py-20">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl font-heading">
            Contacte-nos
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Tem alguma questão ou feedback? Adoraríamos ouvir de si.
          </p>
        </div>

        <div className="bg-card border border-border/50 p-8 md:p-10 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">Nome Completo</Label>
              <Input 
                type="text" 
                name="name" 
                id="name" 
                required 
                placeholder="Como se chama?" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Endereço de Email</Label>
              <Input 
                type="email" 
                name="email" 
                id="email" 
                required 
                placeholder="O seu melhor email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-base font-medium">Mensagem</Label>
              <Textarea 
                name="message" 
                id="message" 
                rows={6} 
                required 
                placeholder="Conte-nos o que precisa..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-base resize-none"
              />
            </div>
            <Button type="submit" size="lg" className="w-full shadow-md hover:shadow-lg transition-shadow">
              Enviar Mensagem
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}