"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Recycle, ShoppingCart, ChevronDown, User, Menu, Bell, Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SearchBar } from "./search-bar";
import { Skeleton } from "./ui/skeleton";
import { SideCart } from "./side-cart";
import { ThemeToggle } from "./theme-toggle";

import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, writeBatch } from "firebase/firestore";
import type { Notification } from "@/lib/types";

const categories = ["Roupa", "Calçado", "Livros", "Eletrónica", "Móveis", "Decoração", "Esportes", "Jogos", "Arte", "Outro"];

function SearchBarFallback() {
  return <Skeleton className="hidden h-10 w-full max-w-xs md:block" />;
}

function NotificationBell() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const notificationsQuery = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            const userNotifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Notification[];
            
            setNotifications(userNotifications);
            const newUnreadCount = userNotifications.filter(n => !n.read).length;
            setUnreadCount(newUnreadCount);
        });

        return () => unsubscribe();
    }, [user]);

    const handleMarkAllAsRead = async () => {
        if (!user || unreadCount === 0) return;
        const batch = writeBatch(db);
        notifications.forEach(notification => {
            if (!notification.read) {
                const notifRef = doc(db, "notifications", notification.id);
                batch.update(notifRef, { read: true });
            }
        });
        await batch.commit();
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await updateDoc(doc(db, "notifications", notification.id), { read: true });
        }
        router.push(notification.link);
    }
    
    return (
        <DropdownMenu onOpenChange={(open) => { if(open) handleMarkAllAsRead() }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-1 text-xs">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                    notifications.slice(0, 5).map(notification => (
                        <DropdownMenuItem key={notification.id} onSelect={() => handleNotificationClick(notification)} className={cn("cursor-pointer whitespace-normal", !notification.read && "bg-accent")}>
                           <div className="flex items-start gap-2">
                             {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
                             <p className="flex-1">{notification.message}</p>
                           </div>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <p className="p-2 text-sm text-muted-foreground">Não tem notificações.</p>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (cartCount > 0 && isMounted) {
      setIsCartAnimating(true);
      const timer = setTimeout(() => setIsCartAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount, isMounted]);

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
      router.push('/login?redirect=/sell');
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
          <Recycle className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">SecondWave</span>
        </Link>

        {/* --- NAVEGAÇÃO PARA DESKTOP --- */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 focus:outline-none transition-colors text-foreground/60 hover:text-foreground">
              Catálogo
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link href="/catalog">Todos os Artigos</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuItem key={category} asChild><Link href={`/catalog?category=${category}`}>{category}</Link></DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink href="/about">Sobre</NavLink>
          <NavLink href="/faq">FAQ</NavLink>
        </nav>
        
        <div className="flex flex-1 items-center justify-end gap-1">
          <div className="hidden md:flex flex-1 items-center justify-end gap-2">
              <Suspense fallback={<SearchBarFallback />}>
                  <SearchBar />
              </Suspense>

              {!isMounted ? <Skeleton className="h-10 w-48" /> : user ? (
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                              <User className="mr-2 h-5 w-5" />
                              {user.name}
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link href="/profile">Perfil</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href="/wallet">Carteira</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href="/favorites">Favoritos</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href="/settings">Definições</Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout}>Terminar Sessão</DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              ) : (
                  <>
                      <Button variant="ghost" asChild><Link href="/login">Iniciar Sessão</Link></Button>
                      <Button asChild><Link href="/register">Registar</Link></Button>
                  </>
              )}
              <Button variant="outline" asChild><Link href="/sell" onClick={handleSellClick}>Vender</Link></Button>
          </div>

          {isMounted && user && (
            <div className="hidden md:flex">
              <Button variant="ghost" size="icon" asChild>
                  <Link href="/favorites"><Heart className="h-5 w-5" /><span className="sr-only">Favoritos</span></Link>
              </Button>
              <NotificationBell />
            </div>
          )}

          <ThemeToggle />

          <Button variant="ghost" size="icon" className={cn("relative", isCartAnimating && "animate-bounce")} onClick={() => setIsCartOpen(true)}>
            <ShoppingCart className="h-5 w-5" />
            {isMounted && cartCount > 0 && (
              <Badge variant="default" className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-1 text-xs">{cartCount}</Badge>
            )}
            <span className="sr-only">Abrir carrinho</span>
          </Button>

          {isMounted && <SideCart open={isCartOpen} onOpenChange={setIsCartOpen} />}
          
          {/* --- MENU HAMBÚRGUER PARA MOBILE --- */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-6 w-6" /><span className="sr-only">Abrir menu</span></Button></SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                 <nav className="flex flex-col gap-4 mt-8">
                    <Suspense fallback={<SearchBarFallback />}>
                      <SearchBar />
                    </Suspense>
                    <Separator />
                    {!isMounted ? <Skeleton className="h-8 w-32" /> : user ? (
                        <>
                            <div className="flex items-center gap-2 border-b pb-4">
                                <User className="h-6 w-6" /><span className="font-semibold">{user.name}</span>
                            </div>
                            <MobileNavLink href="/profile">Perfil</MobileNavLink>
                            <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
                            <MobileNavLink href="/wallet">Carteira</MobileNavLink>
                            <MobileNavLink href="/favorites">Favoritos</MobileNavLink>
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
                    <MobileNavLink href="/catalog">Catálogo</MobileNavLink>
                    <MobileNavLink href="/about">Sobre</MobileNavLink>
                    <MobileNavLink href="/faq">FAQ</MobileNavLink>
                    <MobileNavLink href="/contact">Contacto</MobileNavLink>
                    <Separator />
                    {isMounted && user && (
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