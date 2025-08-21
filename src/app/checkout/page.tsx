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
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/schemas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, CheckCircle } from "lucide-react";

const OrderSummary = () => {
    const { cartItems, subtotal } = useCart();
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resumo do pedido ({cartItems.length})</CardTitle>
                <Button variant="link" size="sm" asChild><Link href="/cart">Editar carrinho</Link></Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <ul className="divide-y divide-border">
                    {cartItems.map(item => (
                        <li key={item.id} className="flex items-center py-4">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                <Image src={item.product.imageUrls[0]} alt={item.product.name} width={64} height={64} className="h-full w-full object-cover"/>
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                            </div>
                            <p className="font-medium">{(item.product.price * item.quantity).toFixed(2)}€</p>
                        </li>
                    ))}
                </ul>
                <Separator/>
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{subtotal.toFixed(2)}€</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Envio</span><span>{shippingCost > 0 ? `${shippingCost.toFixed(2)}€` : 'Grátis'}</span></div>
                <Separator/>
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{total.toFixed(2)}€</span></div>
            </CardContent>
        </Card>
    );
};

const useCheckoutGuard = () => {
    const { cartCount, clearCart } = useCart();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (cartCount === 0) {
                router.replace('/cart');
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [cartCount, router]);

    return { cartCount, router, clearCart, toast };
};

export default function CheckoutPage() {
    const { cartCount, router, clearCart, toast } = useCheckoutGuard();
    const [step, setStep] = useState(1);
    const [checkoutData, setCheckoutData] = useState<CheckoutFormValues | null>(null);
    const [shippingMethod, setShippingMethod] = useState("express");
    const [paymentMethod, setPaymentMethod] = useState("card");

    const { control, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { email: "", firstName: "", lastName: "", phone: "", country: "Portugal", address: "", city: "", region: "", postalCode: "" }
    });

    const onDetailsSubmit = (data: CheckoutFormValues) => {
        setCheckoutData(data);
        setStep(2);
    };
    
    const handleFinalPayment = () => {
        toast({
            title: "Compra Realizada com Sucesso!",
            description: "Obrigado pela sua compra simulada.",
        });
        clearCart();
        router.push('/');
    };

    if (cartCount === 0) {
        return <div className="container text-center py-16"><p>A redirecionar para o carrinho...</p></div>;
    }

    return (
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                <div className="lg:col-span-2">
                    {step === 1 && (
                        <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-6">
                            <h2 className="text-2xl font-bold">Detalhes do cliente e da entrega</h2>
                            <Card>
                                <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2 sm:col-span-2"><Label htmlFor="email">Email</Label><Controller name="email" control={control} render={({ field }) => <Input id="email" {...field} />} /><p className="text-sm text-destructive">{errors.email?.message}</p></div>
                                    <div className="space-y-2"><Label htmlFor="firstName">Nome</Label><Controller name="firstName" control={control} render={({ field }) => <Input id="firstName" {...field} />} /><p className="text-sm text-destructive">{errors.firstName?.message}</p></div>
                                    <div className="space-y-2"><Label htmlFor="lastName">Apelido</Label><Controller name="lastName" control={control} render={({ field }) => <Input id="lastName" {...field} />} /><p className="text-sm text-destructive">{errors.lastName?.message}</p></div>
                                    <div className="space-y-2 sm:col-span-2"><Label htmlFor="address">Morada</Label><Controller name="address" control={control} render={({ field }) => <Input id="address" {...field} />} /><p className="text-sm text-destructive">{errors.address?.message}</p></div>
                                    <div className="space-y-2"><Label htmlFor="city">Cidade</Label><Controller name="city" control={control} render={({ field }) => <Input id="city" {...field} />} /><p className="text-sm text-destructive">{errors.city?.message}</p></div>
                                    <div className="space-y-2"><Label htmlFor="postalCode">Código Postal</Label><Controller name="postalCode" control={control} render={({ field }) => <Input id="postalCode" {...field} />} /><p className="text-sm text-destructive">{errors.postalCode?.message}</p></div>
                                    <div className="space-y-2"><Label htmlFor="region">Região</Label><Controller name="region" control={control} render={({ field }) => <Input id="region" {...field} />} /><p className="text-sm text-destructive">{errors.region?.message}</p></div>
                                    <div className="space-y-2"><Label htmlFor="phone">Telefone (Opcional)</Label><Controller name="phone" control={control} render={({ field }) => <Input id="phone" {...field} />} /></div>
                                </CardContent>
                                <CardFooter><Button type="submit" size="lg" className="w-full">Continuar</Button></CardFooter>
                            </Card>
                        </form>
                    )}
                    
                    {step === 2 && checkoutData && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Método de envio</h2>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center border p-4 rounded-md">
                                        <div>
                                            <p className="text-muted-foreground">{`${checkoutData.firstName} ${checkoutData.lastName}`}</p>
                                            <p className="text-muted-foreground">{checkoutData.address}, {checkoutData.city}</p>
                                        </div>
                                        <Button variant="link" onClick={() => setStep(1)}>Editar</Button>
                                    </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardContent className="pt-6">
                                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                                        <div className="flex items-center justify-between border p-4 rounded-md">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="express" id="express" />
                                                <Label htmlFor="express">Envio Express (24-48 horas)</Label>
                                            </div>
                                            <span className="font-medium">Grátis</span>
                                        </div>
                                    </RadioGroup>
                                </CardContent>
                                <CardFooter><Button size="lg" className="w-full" onClick={() => setStep(3)}>Continuar para o Pagamento</Button></CardFooter>
                            </Card>
                        </div>
                    )}
                    
                    {step === 3 && checkoutData && (
                         <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Pagamento</h2>
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                     <div className="flex justify-between items-center border p-4 rounded-md"><div><p className="text-muted-foreground">{`${checkoutData.firstName} ${checkoutData.lastName}, ${checkoutData.address}`}</p></div><Button variant="link" onClick={() => setStep(1)}>Editar</Button></div>
                                     <div className="flex justify-between items-center border p-4 rounded-md"><div><p className="text-muted-foreground">Envio Express</p></div><Button variant="link" onClick={() => setStep(2)}>Editar</Button></div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardContent className="pt-6">
                                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <div className="border p-4 rounded-t-md"><div className="flex items-center space-x-2"><RadioGroupItem value="card" id="card" /><Label htmlFor="card">Cartão de Crédito/Débito</Label></div></div>
                                        {paymentMethod === 'card' && (
                                            <div className="border border-t-0 p-4 rounded-b-md space-y-4">
                                                <div className="space-y-2"><Label htmlFor="card-number">Número do Cartão</Label><Input id="card-number" placeholder="0000 0000 0000 0000" /></div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2"><Label htmlFor="expiry-date">Validade</Label><Input id="expiry-date" placeholder="MM/AA" /></div>
                                                    <div className="space-y-2"><Label htmlFor="cvc">CVC</Label><Input id="cvc" placeholder="123" /></div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="border p-4 rounded-md mt-4"><div className="flex items-center space-x-2"><RadioGroupItem value="paypal" id="paypal" /><Label htmlFor="paypal">PayPal</Label></div></div>
                                    </RadioGroup>
                                </CardContent>
                                <CardFooter><Button size="lg" className="w-full" onClick={handleFinalPayment}><CheckCircle className="mr-2 h-5 w-5" />Realizar pedido e pagar</Button></CardFooter>
                            </Card>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1"><OrderSummary /></div>
            </div>
        </div>
    );
}