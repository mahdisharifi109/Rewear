// src/app/about/page.tsx

import { Button } from "@/components/ui/button";
import { Package2, Recycle, Users, Target, Handshake, Sparkles } from "lucide-react";
import Link from "next/link";

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
        <section className="bg-primary/10">
            <div className="container mx-auto px-4 py-24 text-center sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                    A mudar a forma como pensamos a moda.
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                    A SecondWave nasceu de uma ideia simples: dar uma segunda oportunidade a cada artigo e criar um impacto positivo no mundo, uma venda de cada vez.
                </p>
            </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight">Os Nossos Valores</h2>
                    <p className="mt-4 text-lg text-muted-foreground">O que nos move todos os dias.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {values.map((value) => (
                        <div key={value.title} className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                {value.icon}
                            </div>
                            <h3 className="mt-6 text-xl font-medium text-foreground">{value.title}</h3>
                            <p className="mt-2 text-muted-foreground">{value.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold tracking-tight">Junta-te ao Movimento</h2>
                <p className="mt-4 text-lg text-muted-foreground">Faz parte de uma comunidade que está a fazer a diferença.</p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button asChild size="lg">
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