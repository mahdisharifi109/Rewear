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
    
    const subject = `Nova Mensagem de ${name} - SecondWave`;
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
            <Input 
              type="text" 
              name="name" 
              id="name" 
              required 
              placeholder="O seu nome" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email" className="sr-only">Email</Label>
            <Input 
              type="email" 
              name="email" 
              id="email" 
              required 
              placeholder="O seu email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="message" className="sr-only">Mensagem</Label>
            <Textarea 
              name="message" 
              id="message" 
              rows={6} 
              required 
              placeholder="A sua mensagem" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
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