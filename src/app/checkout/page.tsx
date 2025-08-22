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
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/schemas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, CheckCircle, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Componente para o Resumo da Encomenda (à direita)
const OrderSummary = () => {
    const { cartItems, subtotal, verificationFee, total, isVerificationEnabled, toggleVerification } = useCart();
    const shippingCost = 0;

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
                    <Separator/>
                    <div className="flex justify-between font-semibold text-base"><span>Total</span><span>{total.toFixed(2)}€</span></div>
                </CardContent>
            </Card>
        </div>
    );
};

// Hook e Página Principal (sem alterações necessárias)
const useCheckoutGuard = () => {
    const { cartCount, clearCart } = useCart();
    const router = useRouter();
    useEffect(() => {
        const timer = setTimeout(() => { if (cartCount === 0) router.replace('/cart'); }, 500);
        return () => clearTimeout(timer);
    }, [cartCount, router]);
    return { cartCount, clearCart, router };
};

export default function CheckoutPage() {
    const { cartCount, clearCart, router } = useCheckoutGuard();
    const { toast } = useToast();
    const { control, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { email: "", firstName: "", lastName: "", phone: "", country: "Portugal", address: "", city: "", region: "", postalCode: "" }
    });
    
    const onFinalSubmit = (data: CheckoutFormValues) => {
        console.log("Dados Finais:", data);
        toast({ title: "Compra Realizada com Sucesso!", description: "Obrigado pela sua compra simulada." });
        clearCart();
        router.push('/');
    };

    if (cartCount === 0) {
        return <div className="container text-center py-16"><p>A redirecionar...</p></div>;
    }

    return (
        <div className="bg-muted/40">
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="text-center mb-10"><h1 className="text-4xl font-bold tracking-tight">Finalizar Compra</h1></div>
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
                                <RadioGroup defaultValue="card" className="mb-4">
                                    <div className="flex items-center space-x-2 border p-4 rounded-md"><RadioGroupItem value="card" id="card" /><Label htmlFor="card" className="flex items-center gap-2 font-medium"><CreditCard className="h-5 w-5" /> Cartão de Crédito/Débito</Label></div>
                                </RadioGroup>
                                <div className="space-y-4">
                                    <div className="space-y-1"><Label htmlFor="card-number">Número do Cartão</Label><Input id="card-number" placeholder="0000 0000 0000 0000" /></div>
                                    <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><Label htmlFor="expiry-date">Validade</Label><Input id="expiry-date" placeholder="MM/AA" /></div><div className="space-y-1"><Label htmlFor="cvc">CVC</Label><Input id="cvc" placeholder="123" /></div></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Button type="submit" size="lg" className="w-full">Pagar e Finalizar Encomenda <CheckCircle className="ml-2 h-5 w-5" /></Button>
                    </div>
                    <div className="lg:col-span-1"><OrderSummary /></div>
                </form>
            </div>
        </div>
    );
}