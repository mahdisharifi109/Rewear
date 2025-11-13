// src/app/profile/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from '@/context/auth-context';
import { Package2, CreditCard, Camera, MapPin, Mail, Phone, Calendar, Settings, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/product-card"; // <-- CORRIGIDO: Importação DEFAULT
import { Product, Sale, Purchase, AppUser } from "@/lib/types"; 

// Componente auxiliar para exibir informações do perfil de forma mais limpa e direta
const ProfileInfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | undefined }> = ({ icon, label, value }) => (
    // Estilo mais limpo: sem fundo, apenas separador na parte inferior
    <div className="flex items-center justify-between py-2 border-b border-border/70 last:border-b-0">
        <div className="flex items-center space-x-3">
            {icon}
            <p className="text-base text-muted-foreground">{label}</p>
        </div>
        <p className="text-base font-semibold text-foreground">{value || "Não definido"}</p>
    </div>
);

// Componente para a aba de Configurações
const SettingsTab: React.FC<{ user: AppUser }> = ({ user }) => {
    const [name, setName] = useState(user.name || "");
    const [bio, setBio] = useState(user.bio || "");
    const [location, setLocation] = useState(user.location || "");
    const [phone, setPhone] = useState(user.phone || "");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { refetchUser } = useAuth(); 

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || isLoading) return;

        setIsLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                username: name,
                bio,
                location,
                phone,
            });
            await refetchUser();
            toast({
                title: "Sucesso!",
                description: "O seu perfil foi atualizado.",
            });
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Não foi possível atualizar o perfil. Tente novamente.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Detalhes do Perfil</CardTitle>
                <CardDescription>Atualize as suas informações pessoais e biografia.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Biografia</Label>
                        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Fale um pouco sobre si e os seus gostos." rows={4} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Localização</Label>
                            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Lisboa, Portugal" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 912 345 678" />
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading}>{isLoading ? "A Guardar..." : "Guardar Alterações"}</Button>
                </form>
            </CardContent>
        </Card>
    );
};

// Componente para a aba Meus Artigos
const MyListingsTab: React.FC<{ user: AppUser }> = ({ user }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const q = query(collection(db, "products"), where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const fetchedProducts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Product[];
                setProducts(fetchedProducts.filter(p => p.status !== 'vendido'));
            } catch (error) {
                console.error("Erro ao buscar artigos:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [user]);

    if (isLoading) {
        return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Card key={i}><div className="h-56 bg-gray-200 animate-pulse rounded-md"></div></Card>)}
        </div>
    }

    return (
        <div className="space-y-6">
            <CardHeader className="p-0">
                <CardTitle>Meus Artigos à Venda ({products.length})</CardTitle>
                <CardDescription>Gerencie os artigos que tem listados no Rewear.</CardDescription>
            </CardHeader>
            {products.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed rounded-lg text-muted-foreground">
                    <Package2 className="h-10 w-10 mx-auto mb-3" />
                    <p className="text-lg font-semibold">Nenhum artigo encontrado.</p>
                    <p>Comece a vender os seus artigos em segunda mão!</p>
                    <Button asChild className="mt-4">
                        <Link href="/sell">Colocar à Venda</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Componente para a aba Histórico
const HistoryTab: React.FC<{ user: AppUser }> = ({ user }) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                // MOCKUP DE BUSCA DE DADOS (Assumindo que as coleções 'sales' e 'purchases' existem no Firestore)
                const salesQuery = query(collection(db, "sales"), where("sellerId", "==", user.uid));
                const salesSnapshot = await getDocs(salesQuery);
                const fetchedSales = salesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    productName: doc.data().productName || "Artigo Vendido",
                    price: doc.data().price || 0,
                    sellerId: user.uid,
                    buyerId: doc.data().buyerId || "",
                    buyerName: doc.data().buyerName || "Comprador",
                    date: doc.data().date,
                })) as Sale[];
                setSales(fetchedSales);
                
                const purchasesQuery = query(collection(db, "purchases"), where("buyerId", "==", user.uid));
                const purchasesSnapshot = await getDocs(purchasesQuery);
                const fetchedPurchases = purchasesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    productName: doc.data().productName || "Artigo Comprado",
                    price: doc.data().price || 0,
                    sellerId: doc.data().sellerId || "",
                    sellerName: doc.data().sellerName || "Vendedor",
                    buyerId: user.uid,
                    date: doc.data().date,
                })) as Purchase[];
                setPurchases(fetchedPurchases);

            } catch (error) {
                console.error("Erro ao buscar histórico:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [user]);
    
    // CORREÇÃO DE TIPAGEM: Cria uma estrutura unificada para o array items, 
    // mapeando os dados para um formato que a JSX consegue consumir sem erro de propriedade ausente.
    const items = [
        // Map Sales: O utilizador é o Vendedor. O outro participante é o Comprador.
        ...sales.map(s => ({
            id: s.id,
            type: 'Venda' as const, 
            productName: s.productName,
            amount: s.price, 
            date: s.date ? new Date(s.date.toDate()).toLocaleDateString('pt-PT') : 'N/A',
            participantName: s.buyerName || 'Comprador', // Nome do Comprador
            participantType: 'Comprador' as const,
        })),
        // Map Purchases: O utilizador é o Comprador. O outro participante é o Vendedor.
        ...purchases.map(p => ({
            id: p.id,
            type: 'Compra' as const, 
            productName: p.productName,
            amount: p.price, 
            date: p.date ? new Date(p.date.toDate()).toLocaleDateString('pt-PT') : 'N/A',
            participantName: p.sellerName || 'Vendedor', // Nome do Vendedor
            participantType: 'Vendedor' as const,
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (isLoading) {
        return <div className="space-y-4">
            <Card className="animate-pulse"><CardHeader><div className="h-4 bg-gray-200 rounded w-1/3"></div></CardHeader><CardContent><div className="h-6 bg-gray-200 rounded"></div></CardContent></Card>
        </div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Histórico de Transações ({items.length})</CardTitle>
                <CardDescription>Veja todas as suas compras e vendas no Rewear.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.length === 0 ? (
                    <div className="text-center p-6 border-2 border-dashed rounded-lg text-muted-foreground">
                        <TrendingUp className="h-8 w-8 mx-auto mb-3" />
                        <p>Nenhuma transação registada.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-full ${item.type === 'Venda' ? 'bg-green-100/50 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-primary/10 text-primary'}`}>
                                        {item.type === 'Venda' ? <DollarSign className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{item.type} de {item.productName}</p>
                                        {/* Acesso seguro às propriedades unificadas */}
                                        <p className="text-sm text-muted-foreground">{item.date} | {item.participantType}: {item.participantName}</p> 
                                    </div>
                                </div>
                                <p className={`font-bold ${item.type === 'Venda' ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>
                                    {item.type === 'Venda' ? '+' : '-'} {item.amount.toFixed(2)}€
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Componente principal da página de Perfil
const ProfilePage: React.FC = () => {
    const { user, loading, refetchUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            handleImageUpload(e.target.files[0]);
        }
    };

    const handleImageUpload = async (file: File) => {
        if (!user || !file) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `profile_pictures/${user.uid}/${file.name}`);
            const uploadTask = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadTask.ref);

            await updateDoc(doc(db, "users", user.uid), {
                photoURL: downloadURL,
            });

            await refetchUser();

            toast({
                title: "Sucesso!",
                description: "A sua foto de perfil foi atualizada.",
            });
        } catch (error) {
            console.error("Erro ao fazer upload da imagem:", error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Não foi possível atualizar a foto. Tente novamente.",
            });
        } finally {
            setIsUploading(false);
            setImageFile(null);
        }
    };

    if (loading || !user) {
        return (
            <div className="container py-8" role="status" aria-live="polite" aria-label="A carregar perfil">
                <p>A carregar perfil...</p>
            </div>
        );
    }

    // Dados Mockup (Hardcoded)
    const mockStats = {
        sales: 12,
        rating: 4.8,
        purchases: 5,
    }

    return (
        <div className="container py-8 space-y-8">
            <h1 className="text-3xl font-bold">O Meu Perfil</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUNA LATERAL (1/3): INFO RÁPIDA E AVATAR */}
                <Card className="lg:col-span-1 h-fit">
                    <CardContent className="flex flex-col items-center p-6">
                        
                        {/* 1. Avatar com upload */}
                        <div className="relative group mb-4">
                            <Avatar className="h-32 w-32 border-4 border-primary/50">
                                <AvatarImage src={user.photoURL} alt={user.name} />
                                <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading} />
                            <Label htmlFor="image-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                {isUploading ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                ) : (
                                    <Camera className="h-6 w-6 text-white" />
                                )}
                            </Label>
                        </div>
                        
                        {/* 2. Nome e Email */}
                        <h2 className="text-2xl font-semibold mb-1 text-center">{user.name}</h2>
                        <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1"><Mail className="h-4 w-4" /> {user.email}</p>
                        
                        {user.bio && (
                            <div className="w-full text-center text-sm text-muted-foreground italic mb-4 p-2 bg-muted rounded-md">{user.bio}</div>
                        )}
                        
                        <Separator className="w-full my-4" />
                        
                        {/* 3. Estatísticas Rápidas (Mais fortes visualmente) */}
                        <div className="flex justify-around w-full">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{mockStats.sales}</p>
                                <p className="text-sm text-muted-foreground">Vendas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{mockStats.rating}</p>
                                <p className="text-sm text-muted-foreground">Avaliação</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{mockStats.purchases}</p>
                                <p className="text-sm text-muted-foreground">Compras</p>
                            </div>
                        </div>
                        
                        <Separator className="w-full my-4" />
                        
                        {/* 4. Informações Adicionais (Mais limpo/direito) */}
                        <div className="w-full space-y-1">
                            <h3 className="text-lg font-semibold mb-2">Detalhes Adicionais</h3>
                            <ProfileInfoItem 
                                icon={<MapPin className="h-4 w-4 text-primary" />} 
                                label="Localização" 
                                value={user.location} 
                            />
                            <ProfileInfoItem 
                                icon={<Phone className="h-4 w-4 text-primary" />} 
                                label="Telefone" 
                                value={user.phone} 
                            />
                            <ProfileInfoItem 
                                icon={<Calendar className="h-4 w-4 text-primary" />} 
                                label="Membro Desde" 
                                value={user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                            />
                        </div>
                        
                    </CardContent>
                </Card>

                {/* COLUNA PRINCIPAL (2/3): TABS DE NAVEGAÇÃO */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="listings" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="settings" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Configurações</TabsTrigger>
                            <TabsTrigger value="listings" className="flex items-center gap-2"><Package2 className="h-4 w-4" /> Meus Artigos</TabsTrigger>
                            <TabsTrigger value="history" className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Histórico</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="settings" className="mt-4">
                            <SettingsTab user={user} />
                        </TabsContent>
                        
                        <TabsContent value="listings" className="mt-4">
                            <MyListingsTab user={user} />
                        </TabsContent>
                        
                        <TabsContent value="history" className="mt-4">
                            <HistoryTab user={user} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;