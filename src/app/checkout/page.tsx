"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react"; // <-- ADICIONADO useState
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/schemas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, CheckCircle, ShieldCheck, Loader2 } from "lucide-react"; // <-- ADICIONADO Loader2
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/auth-context";
import { ErrorBoundary } from "@/components/error-boundary";

// Componente para o Resumo da Encomenda (à direita)
const OrderSummary = ({ overrideTotal, walletApplied }: { overrideTotal?: number; walletApplied?: number }) => {
    const { cartItems, subtotal, verificationFee, total, isVerificationEnabled, toggleVerification } = useCart();
    const shippingCost = 0;
    const displayTotal = typeof overrideTotal === 'number' ? overrideTotal : total;

    return (
        <div className="sticky top-24">
            <Card>
                <CardHeader>
                    <CardTitle>Resumo da Encomenda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="space-y-4">
                        {cartItems.map(item => (
                            <li key={item.id} className="flex items-center gap-4">
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                    <Image src={item.product.imageUrls[0]} alt={item.product.name} fill className="object-cover"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                                </div>
                                <p className="font-medium">{(item.product.price * item.quantity).toFixed(2)}€</p>
                            </li>
                        ))}
                    </ul>
                    <Separator/>
                    {/* Opção de Verificação */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center space-x-3">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <div>
                                <Label htmlFor="verification-switch" className="font-semibold">Verificação de Artigo</Label>
                                <p className="text-xs text-muted-foreground">Adicione por 5.00€</p>
                            </div>
                        </div>
                        <Switch id="verification-switch" checked={isVerificationEnabled} onCheckedChange={toggleVerification} />
                    </div>
                    <Separator/>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{subtotal.toFixed(2)}€</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Envio</span><span>{shippingCost > 0 ? `${shippingCost.toFixed(2)}€` : 'Grátis'}</span></div>
                    {isVerificationEnabled && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Taxa de Verificação</span><span>{verificationFee.toFixed(2)}€</span></div>}
                                        {walletApplied && walletApplied > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Saldo da Carteira</span>
                                                <span className="text-green-600 font-medium">- {walletApplied.toFixed(2)}€</span>
                                            </div>
                                        )}
                    <Separator/>
                                        <div className="flex justify-between font-semibold text-base"><span>Total</span><span>{displayTotal.toFixed(2)}€</span></div>
                </CardContent>
            </Card>
        </div>
    );
};

// Hook e Página Principal (sem alterações necessárias)
const useCheckoutGuard = () => {
    const { cartCount } = useCart();
    const router = useRouter();
    useEffect(() => {
        // Redireciona se o carrinho estiver vazio
        const timer = setTimeout(() => { if (cartCount === 0) router.replace('/cart'); }, 500);
        return () => clearTimeout(timer);
    }, [cartCount, router]);
    return { cartCount, router };
};

export default function CheckoutPage() {
    const { cartCount, router, } = useCheckoutGuard();
    const { toast } = useToast();
    const { user } = useAuth(); // OBTER USER PARA A TRANSAÇÃO
    const { clearCart, total, isVerificationEnabled, createSecureCheckoutPayload } = useCart();
    const walletAvailable = (user?.wallet?.available ?? user?.walletBalance ?? 0);
    const [useWallet, setUseWallet] = useState<boolean>(walletAvailable > 0);
    const effectiveWalletApplied = Math.min(walletAvailable, total);
    const effectiveTotal = useWallet ? Math.max(0, total - effectiveWalletApplied) : total;
    const [isProcessing, setIsProcessing] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { 
            email: user?.email || "", 
            firstName: user?.name.split(' ')[0] || "", 
            lastName: user?.name.split(' ').slice(1).join(' ') || "", 
            phone: user?.phone || "", // Assumindo que user.phone existe no AppUser
            country: "Portugal", 
            address: "", city: "", region: "", postalCode: "" 
        }
    });
    
    const onFinalSubmit = async (data: CheckoutFormValues) => {
        if (!user) {
            toast({ variant: "destructive", title: "Erro de Autenticação", description: "Sessão expirada. Por favor, inicie sessão novamente." });
            router.push('/login?redirect=/checkout');
            return;
        }

        setIsProcessing(true);
        try {
            let cartPayload = {};
            if (typeof createSecureCheckoutPayload === 'function') {
                cartPayload = createSecureCheckoutPayload();
            }
            const payload = {
                userId: user.uid,
                checkoutData: data,
                useWallet,
                ...cartPayload,
            };
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (result.success) {
                clearCart();
                toast({ title: "Compra Realizada com Sucesso!", description: "Obrigado pela sua compra. O histórico foi atualizado." });
                router.push('/profile');
            } else {
                toast({ variant: "destructive", title: "Erro de Transação", description: result.error || "Não foi possível finalizar a compra. Tente novamente." });
            }
        } catch (error) {
            console.error("Erro no checkout:", error);
            toast({ variant: "destructive", title: "Erro de Transação", description: "Não foi possível finalizar a compra. Tente novamente." });
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartCount === 0) {
        return <div className="container text-center py-16"><p>A redirecionar...</p></div>;
    }

    return (
        <ErrorBoundary>
        <div className="bg-muted/40">
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tight">Finalizar Compra</h1>
                    {/* Progress Indicator */}
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <div className="flex items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">1</div>
                            <span className="ml-2 text-sm font-medium">Entrega</span>
                        </div>
                        <div className="h-px w-12 bg-border"></div>
                        <div className="flex items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">2</div>
                            <span className="ml-2 text-sm font-medium">Pagamento</span>
                        </div>
                        <div className="h-px w-12 bg-border"></div>
                        <div className="flex items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted text-muted-foreground font-semibold text-sm">3</div>
                            <span className="ml-2 text-sm text-muted-foreground">Confirmação</span>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onFinalSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader><CardTitle>1. Detalhes de Entrega</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1 sm:col-span-2"><Label htmlFor="email">Email</Label><Controller name="email" control={control} render={({ field }) => <Input id="email" {...field} />} /><p className="text-sm text-destructive">{errors.email?.message}</p></div>
                                <div className="space-y-1"><Label htmlFor="firstName">Nome</Label><Controller name="firstName" control={control} render={({ field }) => <Input id="firstName" {...field} />} /><p className="text-sm text-destructive">{errors.firstName?.message}</p></div>
                                <div className="space-y-1"><Label htmlFor="lastName">Apelido</Label><Controller name="lastName" control={control} render={({ field }) => <Input id="lastName" {...field} />} /><p className="text-sm text-destructive">{errors.lastName?.message}</p></div>
                                <div className="space-y-1 sm:col-span-2"><Label htmlFor="address">Morada</Label><Controller name="address" control={control} render={({ field }) => <Input id="address" {...field} />} /><p className="text-sm text-destructive">{errors.address?.message}</p></div>
                                <div className="space-y-1"><Label htmlFor="city">Cidade</Label><Controller name="city" control={control} render={({ field }) => <Input id="city" {...field} />} /><p className="text-sm text-destructive">{errors.city?.message}</p></div>
                                <div className="space-y-1"><Label htmlFor="postalCode">Código Postal</Label><Controller name="postalCode" control={control} render={({ field }) => <Input id="postalCode" {...field} />} /><p className="text-sm text-destructive">{errors.postalCode?.message}</p></div>
                                <div className="space-y-1"><Label htmlFor="region">Região</Label><Controller name="region" control={control} render={({ field }) => <Input id="region" {...field} />} /><p className="text-sm text-destructive">{errors.region?.message}</p></div>
                                <div className="space-y-1"><Label htmlFor="phone">Telefone (Opcional)</Label><Controller name="phone" control={control} render={({ field }) => <Input id="phone" {...field} />} /></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>2. Pagamento</CardTitle></CardHeader>
                            <CardContent>
                                                                {walletAvailable > 0 && (
                                                                    <div className="flex items-center justify-between rounded-lg border p-3 mb-4">
                                                                        <div>
                                                                            <Label className="font-semibold">Usar saldo da carteira</Label>
                                                                            <p className="text-xs text-muted-foreground">Saldo disponível: {walletAvailable.toFixed(2)}€</p>
                                                                        </div>
                                                                        <Switch checked={useWallet} onCheckedChange={setUseWallet} />
                                                                    </div>
                                                                )}
                                <RadioGroup defaultValue="card" className="mb-4">
                                    <div className="flex items-center space-x-2 border p-4 rounded-md"><RadioGroupItem value="card" id="card" /><Label htmlFor="card" className="flex items-center gap-2 font-medium"><CreditCard className="h-5 w-5" /> Cartão de Crédito/Débito</Label></div>
                                </RadioGroup>
                                <div className="space-y-4">
                                    <div className="space-y-1"><Label htmlFor="card-number">Número do Cartão</Label><Input id="card-number" placeholder="0000 0000 0000 0000" /></div>
                                    <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><Label htmlFor="expiry-date">Validade</Label><Input id="expiry-date" placeholder="MM/AA" /></div><div className="space-y-1"><Label htmlFor="cvc">CVC</Label><Input id="cvc" placeholder="123" /></div></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="ml-2 h-5 w-5" />}
                            {`Pagar ${effectiveTotal.toFixed(2)}€ e Finalizar Encomenda`}
                            {isVerificationEnabled ? " (Com Verificação)" : ""}
                        </Button>
                    </div>
                    <div className="lg:col-span-1"><OrderSummary overrideTotal={effectiveTotal} walletApplied={useWallet ? effectiveWalletApplied : 0} /></div>
                </form>
            </div>
        </div>
        </ErrorBoundary>
    );
}