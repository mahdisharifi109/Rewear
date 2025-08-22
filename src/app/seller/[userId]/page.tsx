"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Product, Review } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProductCard from '@/components/product-card';
import { Loader2, Star } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, ReviewFormValues } from '@/lib/schemas';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/ui/star-rating';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Seller {
    username: string;
    email: string;
}

// --- Formulário para deixar uma avaliação ---
function LeaveReviewForm({ sellerId, onReviewAdded }: { sellerId: string, onReviewAdded: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 0, comment: '' }
    });

    const onSubmit = async (data: ReviewFormValues) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Precisa de estar logado para deixar uma avaliação.' });
            return;
        }
        if (data.rating === 0) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma classificação de estrelas.' });
            return;
        }

        setIsSubmitting(true);
        try {
            // Adicionar a avaliação
            await addDoc(collection(db, 'reviews'), {
                sellerId: sellerId,
                buyerId: user.uid,
                buyerName: user.name,
                rating: data.rating,
                comment: data.comment,
                createdAt: serverTimestamp()
            });

            // Adicionar notificação para o vendedor
            await addDoc(collection(db, "notifications"), {
                userId: sellerId, // Notificação é para o vendedor
                message: `${user.name} deixou-lhe uma avaliação de ${data.rating} estrela(s).`,
                link: `/seller/${sellerId}`, // Link para a página do vendedor
                read: false,
                createdAt: serverTimestamp()
            });

            toast({ title: 'Sucesso', description: 'A sua avaliação foi publicada!' });
            reset({ rating: 0, comment: '' });
            setRating(0);
            onReviewAdded();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível publicar a sua avaliação.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div>
                <Label>Classificação</Label>
                <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    className={`h-7 w-7 cursor-pointer ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    onClick={() => {
                                        setRating(star);
                                        field.onChange(star);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                />
                 {errors.rating && <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>}
            </div>
            <div>
                <Label htmlFor="comment">Comentário</Label>
                <Controller
                    name="comment"
                    control={control}
                    render={({ field }) => <Textarea id="comment" rows={4} className="mt-2" placeholder="Descreva a sua experiência..." {...field} />}
                />
                {errors.comment && <p className="text-sm text-destructive mt-1">{errors.comment.message}</p>}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Publicar Avaliação
                </Button>
            </DialogFooter>
        </form>
    );
}


export default function SellerProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const { user: currentUser } = useAuth();

    const [seller, setSeller] = useState<Seller | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

    const fetchSellerData = async () => {
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                setSeller(userDocSnap.data() as Seller);
            }

            const productsQuery = query(collection(db, 'products'), where("userId", "==", userId));
            const productsSnapshot = await getDocs(productsQuery);
            const sellerProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
            setProducts(sellerProducts);

            const reviewsQuery = query(collection(db, 'reviews'), where("sellerId", "==", userId), orderBy("createdAt", "desc"));
            const reviewsSnapshot = await getDocs(reviewsQuery);
            const sellerReviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
            setReviews(sellerReviews);
        } catch (error) {
            console.error("Erro ao carregar dados do vendedor:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchSellerData();
        }
    }, [userId]);
    
    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return total / reviews.length;
    }, [reviews]);
    
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">A carregar perfil do vendedor...</p>
            </div>
        );
    }
    
    if (!seller) {
        return (
             <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold">Vendedor não encontrado</h1>
             </div>
        )
    }
    
    const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${seller.username}`;

    return (
        <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={avatarUrl} alt={seller.username ?? 'Avatar do Vendedor'} />
                    <AvatarFallback>{seller.username ? seller.username.charAt(0).toUpperCase() : 'V'}</AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-bold">{seller.username}</h1>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                        <StarRating rating={averageRating} />
                        <span className="text-muted-foreground">({reviews.length} avaliações)</span>
                    </div>
                )}
            </div>
            
            <Tabs defaultValue="products" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="products">Artigos ({products.length})</TabsTrigger>
                    <TabsTrigger value="reviews">Avaliações ({reviews.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="products" className="mt-6">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.map(product => (<ProductCard key={product.id} product={product} />))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Este utilizador ainda não tem artigos à venda.</p>
                    )}
                </TabsContent>
                <TabsContent value="reviews" className="mt-6">
                    <div className="flex justify-end mb-4">
                        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                            <DialogTrigger asChild>
                                {currentUser && currentUser.uid !== userId && (
                                    <Button>Deixar uma avaliação</Button>
                                )}
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Avaliar {seller.username}</DialogTitle>
                                    <DialogDescription>Partilhe a sua experiência com este vendedor.</DialogDescription>
                                </DialogHeader>
                                <LeaveReviewForm sellerId={userId} onReviewAdded={() => { fetchSellerData(); setReviewDialogOpen(false); }} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    {reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map(review => (
                                <Card key={review.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${review.buyerName}`} />
                                                    <AvatarFallback>{review.buyerName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-semibold">{review.buyerName}</span>
                                            </div>
                                            <StarRating rating={review.rating} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{review.comment}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Este vendedor ainda não tem nenhuma avaliação.</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}