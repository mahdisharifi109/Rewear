"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package2, ShoppingCart, ChevronDown, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SearchBar } from "./search-bar"; 
import { Skeleton } from "./ui/skeleton";

const categories = ["Roupa", "Calçado", "Livros", "Eletrónica", "Outro"];

function SearchBarFallback() {
  return <Skeleton className="hidden sm:block h-10 w-full max-w-xs" />;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  const handleSellClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Precisa de iniciar sessão para vender um artigo.",
      });
      router.push('/login');
    }
  }
  
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className={cn("transition-colors hover:text-foreground", isActive ? "text-foreground" : "text-foreground/60")}>
        {children}
      </Link>
    );
  };
  
  const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block py-2 text-lg" onClick={() => setIsMobileMenuOpen(false)}>
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Package2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">SecondWave</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 focus:outline-none transition-colors hover:text-foreground text-foreground/60">
              Categorias
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.map((category) => (
                <DropdownMenuItem key={category} asChild>
                  <Link href={`/?category=${category}`}>{category}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink href="/about">Sobre</NavLink>
          <NavLink href="/faq">FAQ</NavLink>
          <NavLink href="/contact">Contacto</NavLink>
        </nav>
        
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4 ml-auto">
          <Suspense fallback={<SearchBarFallback />}>
            <SearchBar />
          </Suspense>
        
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <User className="mr-2 h-5 w-5" />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link href="/profile">Perfil</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/settings">Definições</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Terminar Sessão</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Iniciar Sessão</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Registar</Link>
                </Button>
              </>
            )}

            <Button variant="outline" asChild>
              <Link href="/sell" onClick={handleSellClick}>Vender</Link>
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-1 text-xs"
                >
                  {cartCount}
                </Badge>
              )}
              <span className="sr-only">Abrir carrinho</span>
            </Link>
          </Button>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Abrir menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                 <nav className="flex flex-col gap-4 mt-8">
                    {user ? (
                        <>
                            <div className="flex items-center gap-2 border-b pb-4">
                                <User className="h-6 w-6" />
                                <span className="font-semibold">{user.name}</span>
                            </div>
                            <MobileNavLink href="/profile">Perfil</MobileNavLink>
                            <MobileNavLink href="/settings">Definições</MobileNavLink>
                        </>
                    ): (
                        <>
                            <MobileNavLink href="/login">Iniciar Sessão</MobileNavLink>
                            <MobileNavLink href="/register">Registar</MobileNavLink>
                        </>
                    )}
                    <MobileNavLink href="/sell">Vender</MobileNavLink>
                    <Separator />
                    <MobileNavLink href="/about">Sobre</MobileNavLink>
                    <MobileNavLink href="/faq">FAQ</MobileNavLink>
                    <MobileNavLink href="/contact">Contacto</MobileNavLink>
                    <Separator />
                    {user && (
                         <Button variant="ghost" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Terminar Sessão</Button>
                    )}
                 </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
