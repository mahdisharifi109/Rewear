import Link from "next/link";
import { Recycle } from "lucide-react"; // <-- IMPORTAR Recycle

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Recycle className="h-6 w-6 text-primary" /> {/* <-- NOVO ÍCONE */}
              <span className="font-bold text-lg">Rewear</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              O seu mercado online para artigos em segunda mão.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Comprar</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-foreground">Todos os Produtos</Link></li>
              <li><Link href="/?category=Roupa" className="text-muted-foreground hover:text-foreground">Roupa</Link></li>
              <li><Link href="/?category=Calçado" className="text-muted-foreground hover:text-foreground">Calçado</Link></li>
              <li><Link href="/?category=Livros" className="text-muted-foreground hover:text-foreground">Livros</Link></li>
              <li><Link href="/?category=Eletrónica" className="text-muted-foreground hover:text-foreground">Eletrónica</Link></li>
              <li><Link href="/?category=Acessórios" className="text-muted-foreground hover:text-foreground">Acessórios</Link></li>
              <li><Link href="/?category=Desporto" className="text-muted-foreground hover:text-foreground">Desporto</Link></li>
              <li><Link href="/?category=Casa" className="text-muted-foreground hover:text-foreground">Casa</Link></li>
              <li><Link href="/?category=Outro" className="text-muted-foreground hover:text-foreground">Outro</Link></li>
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
          <p>&copy; {new Date().getFullYear()} Rewear. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}