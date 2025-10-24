import Link from "next/link";
import { Recycle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Recycle className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">SecondWave</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              O seu mercado online para artigos em segunda mão.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Comprar</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/catalog" className="text-muted-foreground hover:text-foreground">Todos os Produtos</Link></li>
              <li><Link href="/catalog?category=Roupa" className="text-muted-foreground hover:text-foreground">Roupa</Link></li>
              <li><Link href="/catalog?category=Calçado" className="text-muted-foreground hover:text-foreground">Calçado</Link></li>
              <li><Link href="/catalog?category=Livros" className="text-muted-foreground hover:text-foreground">Livros</Link></li>
              <li><Link href="/catalog?category=Eletrónica" className="text-muted-foreground hover:text-foreground">Eletrónica</Link></li>
              <li><Link href="/catalog?category=Móveis" className="text-muted-foreground hover:text-foreground">Móveis</Link></li>
              <li><Link href="/catalog?category=Decoração" className="text-muted-foreground hover:text-foreground">Decoração</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Vender</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/sell" className="text-muted-foreground hover:text-foreground">Como vender</Link></li>
              <li><Link href="/sell" className="text-muted-foreground hover:text-foreground">Começar a vender</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Ajuda</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">Sobre Nós</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contacto</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SecondWave. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}