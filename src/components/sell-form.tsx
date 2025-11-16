"use client";

import { useState } from "react";
import Image from 'next/image';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/context/product-context";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { sellFormSchema, type SellFormValues } from "@/lib/schemas";
import { SelectOrInput } from "./ui/select-or-input";
import { fileToDataUri } from "@/lib/imageUtils"; // Importar a função
import { storage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const PREDEFINED_BRANDS = ["Nike", "Adidas", "Zara", "H&M", "Apple", "Samsung", "Fnac"];
const PREDEFINED_MATERIALS = ["Algodão", "Poliéster", "Lã", "Seda", "Plástico", "Metal"];

export function SellForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addProduct } = useProducts();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { control, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<SellFormValues>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      title: "", description: "", price: undefined, quantity: 1, category: "", condition: "", brand: "", material: "", sizes: "", images: [],
    },
  });

  const imagePreviews = watch("images");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        const newFiles = Array.from(files);
        setValue("images", [...(watch("images") || []), ...newFiles], { shouldValidate: true });
    }
  };
  
  const removeImage = (index: number) => {
    const currentImages = watch("images");
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue("images", newImages, { shouldValidate: true });
  };

  const onSubmit = async (data: SellFormValues) => {
    if (authLoading || !user) {
        toast({ variant: "destructive", title: "Erro de Autenticação", description: "Por favor, aguarde ou faça login novamente." });
        return;
    }
    setIsSubmitting(true);
    try {
        // 1) Validação rápida no cliente (tipo e tamanho) – regras também validam no servidor
        const files = (data.images || []).filter((f): f is File => typeof f !== 'string');
        for (const f of files) {
          if (!f.type.startsWith('image/')) {
            toast({ variant: "destructive", title: "Ficheiro inválido", description: `Apenas imagens são permitidas. (${f.name})` });
            return;
          }
          if (f.size > 5 * 1024 * 1024) {
            toast({ variant: "destructive", title: "Imagem muito grande", description: `${f.name} excede 5MB.` });
            return;
          }
        }

        // 2) Upload para Firebase Storage (com compressão simples via canvas)
        async function compressToBlob(file: File): Promise<Blob> {
          const img = document.createElement('img');
          const tmpUrl = URL.createObjectURL(file);
          await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = tmpUrl; });
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1200;
          const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(tmpUrl);
          return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.8));
        }

        const uploadPromises = (data.images || []).map(async (image, idx) => {
          if (typeof image === 'string') return image; // já é URL
          const blob = await compressToBlob(image as File);
          const path = `products/${user.uid}/${Date.now()}-${idx}.jpg`;
          const ref = storageRef(storage, path);
          await uploadBytes(ref, blob, { contentType: 'image/jpeg' });
          const url = await getDownloadURL(ref);
          return url;
        });

        const imageUrls = await Promise.all(uploadPromises);
        
        const sizesArray = data.sizes ? data.sizes.split(',').map(s => s.trim().toUpperCase()) : [];

        await addProduct({
          name: data.title, description: data.description, price: data.price, quantity: data.quantity, category: data.category as any,
          condition: data.condition as any, brand: data.brand, material: data.material, sizes: sizesArray, imageUrls: imageUrls,
          imageHint: data.title.split(" ").slice(0, 2).join(" "), userEmail: user.email!, userName: user.name, userId: user.uid,
        });

        toast({ title: "Anúncio Publicado!", description: "O seu produto foi listado com sucesso!" });
        reset();
        router.push('/');
    } catch (error) {
        toast({ variant: "destructive", title: "Erro ao Publicar", description: "Ocorreu um erro. Verifique as permissões da base de dados e tente novamente." })
    } finally {
        setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
        <Card><CardHeader><CardTitle>Venda o seu artigo</CardTitle><CardDescription>A verificar a sua sessão...</CardDescription></CardHeader><CardContent><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></CardContent></Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venda o seu artigo</CardTitle>
        <CardDescription>Preencha os detalhes abaixo. Campos com * são opcionais.</CardDescription>
      </CardHeader>
      <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Imagens do Produto</Label>
               <div className="relative flex justify-center items-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <Input id="image-upload" type="file" multiple className="absolute w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                  <div className="text-center text-muted-foreground">
                      <UploadCloud className="mx-auto h-8 w-8" />
                      <p className="mt-1 text-sm">Arraste e solte ou clique para carregar</p>
                  </div>
              </div>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2">
                  {imagePreviews.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                       <Image 
                         src={typeof image === 'string' ? image : URL.createObjectURL(image as File)} 
                         alt={`Pré-visualização ${index + 1}`} 
                         fill 
                         loading="lazy"
                         sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                         className="rounded-md object-cover" 
                       />
                       <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-4 w-4" />
                       </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && <p className="text-sm text-destructive">{errors.images.message?.toString()}</p>}
            </div>

            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Controller name="title" control={control} render={({ field }) => <Input id="title" placeholder="Ex: Casaco de Lã Vintage" {...field} />} />
                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Controller name="description" control={control} render={({ field }) => <Textarea id="description" placeholder="Descreva o seu artigo em detalhe..." rows={5} {...field} />} />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Preço (€)</Label>
                        <Controller name="price" control={control} render={({ field }) => <Input id="price" type="number" step="0.01" placeholder="25.00" {...field} value={field.value ?? ''} />} />
                        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Controller name="quantity" control={control} render={({ field }) => <Input id="quantity" type="number" step="1" placeholder="1" {...field} value={field.value ?? ''} />} />
                        {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="brand">Marca*</Label>
                        <Controller name="brand" control={control} render={({ field }) => <SelectOrInput id="brand" options={PREDEFINED_BRANDS} placeholder="Selecione ou escreva uma marca" {...field} />} />
                        {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="material">Material*</Label>
                        <Controller name="material" control={control} render={({ field }) => <SelectOrInput id="material" options={PREDEFINED_MATERIALS} placeholder="Selecione ou escreva um material" {...field} />} />
                        {errors.material && <p className="text-sm text-destructive">{errors.material.message}</p>}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="sizes">Tamanhos* (separados por vírgula)</Label>
                    <Controller name="sizes" control={control} render={({ field }) => <Input id="sizes" placeholder="S, M, L, XL" {...field} value={field.value ?? ''} />} />
                    {errors.sizes && <p className="text-sm text-destructive">{errors.sizes.message}</p>}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Categoria</Label>
                         <Controller name="category" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Roupa">Roupa</SelectItem>
                                    <SelectItem value="Calçado">Calçado</SelectItem>
                                    <SelectItem value="Livros">Livros</SelectItem>
                                    <SelectItem value="Eletrónica">Eletrónica</SelectItem>
                                    <SelectItem value="Móveis">Móveis</SelectItem>
                                    <SelectItem value="Decoração">Decoração</SelectItem>
                                    <SelectItem value="Esportes">Esportes</SelectItem>
                                    <SelectItem value="Jogos">Jogos</SelectItem>
                                    <SelectItem value="Arte">Arte</SelectItem>
                                    <SelectItem value="Outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                         )}/>
                        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Condição</Label>
                         <Controller name="condition" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione a condição" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Novo">Novo</SelectItem>
                                    <SelectItem value="Muito bom">Muito bom</SelectItem>
                                    <SelectItem value="Bom">Bom</SelectItem>
                                </SelectContent>
                            </Select>
                         )}/>
                        {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
                    </div>
                 </div>
                 <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || authLoading}>
                    {(isSubmitting || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Publicar Anúncio
                 </Button>
            </div>
        </form>
      </CardContent>
    </Card>
  );
}