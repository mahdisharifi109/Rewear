"use client";

import { UploadCloud, Tag, Ship, Video } from 'lucide-react'; // Adicionado Video icon
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const steps = [
  {
    icon: <UploadCloud className="h-8 w-8 text-primary" />,
    title: "1. Carregue o seu Artigo",
    description: "Tire algumas fotos, adicione uma descrição e defina o seu preço. A nossa IA pode ajudar a sugerir os detalhes!"
  },
  {
    icon: <Video className="h-8 w-8 text-primary" />,
    title: "2. Gere a Simulação IA",
    description: "Use a nossa ferramenta IA para criar um vídeo que simula a embalagem e entrega, impressionando os compradores." // NOVO PASSO
  },
  {
    icon: <Tag className="h-8 w-8 text-primary" />,
    title: "3. Venda e Receba",
    description: "Quando um comprador estiver interessado, receberá uma notificação. Combine os detalhes e prepare o seu artigo."
  },
  {
    icon: <Ship className="h-8 w-8 text-primary" />,
    title: "4. Envie o Produto",
    description: "Embale o seu artigo e envie-o para o comprador. É simples, rápido e sustentável!"
  }
];

export function HowItWorks() {
  return (
    <section className="bg-muted/40 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Vender na Rewear é Fácil</h2>
          <p className="mt-4 text-lg text-muted-foreground">Siga estes simples passos para começar a vender.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> {/* Ajustar o grid para 4 colunas */}
          {steps.map((step) => (
            <Card key={step.title} className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {step.icon}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}