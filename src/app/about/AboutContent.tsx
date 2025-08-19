'use client'

import { Package2, Recycle, Users } from "lucide-react";

export default function AboutContent() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sobre a SecondWave
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            A nossa missão é tornar a compra e venda em segunda mão fácil, segura e divertida para todos.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Package2 className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-lg font-medium text-foreground">A Nossa Plataforma</h3>
            <p className="mt-2 text-muted-foreground">
              Construímos a SecondWave para ser um espaço onde pode encontrar artigos únicos e dar uma nova vida aos seus próprios bens, de forma simples e intuitiva.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Recycle className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-lg font-medium text-foreground">Sustentabilidade</h3>
            <p className="mt-2 text-muted-foreground">
              Acreditamos no poder da economia circular. Ao comprar e vender em segunda mão, está a ajudar a reduzir o desperdício e a promover um consumo mais consciente.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-lg font-medium text-foreground">Comunidade</h3>
            <p className="mt-2 text-muted-foreground">
              A SecondWave é mais do que um mercado; é uma comunidade de pessoas que partilham a paixão por encontrar valor no que já existe. Junte-se a nós!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
