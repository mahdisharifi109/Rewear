// src/app/about/page.tsx
// Página estática renderizada no servidor para melhor performance
import { Button } from "@/components/ui/button";
import { Package2, Recycle, Users, Target, Handshake, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nós — Rewear',
  description: 'Conheça a Rewear: tornamos a moda em segunda mão a primeira escolha, criando um futuro de consumo consciente.',
};

const values = [
    {
        icon: <Target className="h-8 w-8 text-primary" />,
        title: "A Nossa Missão",
        description: "Tornar a moda em segunda mão a primeira escolha. Queremos criar um futuro onde o consumo consciente é a norma, dando uma nova vida a cada peça de roupa."
    },
    {
        icon: <Handshake className="h-8 w-8 text-primary" />,
        title: "Comunidade e Confiança",
        description: "Construímos mais do que um mercado; construímos uma comunidade. A segurança e a confiança entre os nossos membros são o pilar da nossa plataforma."
    },
    {
        icon: <Sparkles className="h-8 w-8 text-primary" />,
        title: "Simplicidade e Inovação",
        description: "Acreditamos que comprar e vender deve ser uma experiência fácil e agradável. Estamos constantemente a inovar para tornar a tua jornada o mais simples possível."
    }
];

export default function AboutPage() {
  return (
    <>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 via-primary/10 to-background">
            <div className="container mx-auto px-4 py-28 text-center sm:px-6 lg:px-8">
                <div className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-primary/10">
                  <Recycle className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl font-heading">
                    A mudar a forma como pensamos a moda
                </h1>
                <p className="mt-8 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed text-muted-foreground">
                    A Rewear nasceu de uma ideia simples: dar uma segunda oportunidade a cada artigo e criar um impacto positivo no mundo, uma venda de cada vez.
                </p>
            </div>
        </section>

        {/* Values Section */}
        <section className="py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-heading">Os Nossos Valores</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">O que nos move todos os dias.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                    {values.map((value) => (
                        <div key={value.title} className="text-center group">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                                {value.icon}
                            </div>
                            <h3 className="mt-8 text-xl font-semibold text-foreground">{value.title}</h3>
                            <p className="mt-3 text-base text-muted-foreground leading-relaxed">{value.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Call to Action Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-muted/40 py-24">
            <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-heading">Junta-te ao Movimento</h2>
                <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Faz parte de uma comunidade que está a fazer a diferença, um produto de cada vez.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                    <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                        <Link href="/sell">Começar a Vender</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/catalog">Explorar o Catálogo</Link>
                    </Button>
                </div>
            </div>
        </section>
    </>
  );
}