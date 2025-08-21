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
import { UploadCloud, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/context/product-context";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { editFormSchema, type EditFormValues } from "@/lib/schemas";
import { useAuth } from "@/context/auth-context";
import { SelectOrInput } from "./ui/select-or-input";

const PREDEFINED_BRANDS = ["Nike", "Adidas", "Zara", "H&M", "Apple", "Samsung", "Fnac"];
const PREDEFINED_MATERIALS = ["Algodão", "Poliéster", "Lã", "Seda", "Plástico", "Metal"];

interface EditFormProps {
  product: Product;
}

export function EditForm({ product }: EditFormProps) {
  const { toast } = useToast();
  const { updateProduct } = useProducts();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: product.name || "",
      description: product.description || "",
      price: product.price ?? undefined,
      quantity: product.quantity || 1,
      category: product.category || "",
      condition: product.condition || "",
      brand: product.brand || "",
      material: product.material || "",
      sizes: product.sizes?.join(', ') || "",
      images: product.imageUrls || [],
    },
  });

  const imagePreviews = watch("images");

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

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

  const onSubmit = async (data: EditFormValues) => {
    setIsSubmitting(true);
    try {
        const imageUrls = await Promise.all(
            data.images.map(image => {
                if (typeof image === 'string') return image;
                return fileToDataUri(image as File);
            })
        );

        const sizesArray = data.sizes ? data.sizes.split(',').map(s => s.trim().toUpperCase()) : [];

        const productData: Product = {
          id: product.id,
          name: data.title,
          description: data.description,
          price: data.price,
          quantity: data.quantity,
          category: data.category as any,
          condition: data.condition as any,
          brand: data.brand || "",
          material: data.material || "",
          sizes: sizesArray,
          imageUrls: imageUrls,
          imageHint: data.title.split(" ").slice(0, 2).join(" "),
          userEmail: product.userEmail,
          userName: product.userName || user?.name || 'Vendedor Desconhecido',
          userId: product.userId,
        };

        await updateProduct(productData);

        toast({ title: "Anúncio Atualizado!", description: "O seu produto foi atualizado com sucesso!" });
        router.push(`/product/${product.id}`);
    } catch (error) {
        console.error("Erro ao atualizar o produto:", error);
        toast({ variant: "destructive", title: "Erro ao atualizar", description: "Ocorreu um erro ao guardar as alterações. Por favor, tente novamente." })
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Artigo</CardTitle>
        <CardDescription>Faça as alterações necessárias ao seu produto.</CardDescription>
      </CardHeader>
      <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Imagens do Produto</Label>
               <div className="relative flex justify-center items-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <Input id="image-upload" type="file" multiple className="absolute w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                  <div className="text-center text-muted-foreground">
                      <UploadCloud className="mx-auto h-8 w-8" />
                      <p className="mt-1 text-sm">Arraste e solte ou clique para carregar mais imagens</p>
                  </div>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2">
                  {imagePreviews.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                       <Image src={typeof image === 'string' ? image : URL.createObjectURL(image as File)} alt={`Pré-visualização ${index + 1}`} fill className="rounded-md object-cover" />
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
                    <Controller name="title" control={control} render={({ field }) => <Input id="title" {...field} />} />
                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Controller name="description" control={control} render={({ field }) => <Textarea id="description" rows={5} {...field} />} />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                 </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Preço (€)</Label>
                        <Controller name="price" control={control} render={({ field }) => <Input id="price" type="number" step="0.01" {...field} />} />
                        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Controller name="quantity" control={control} render={({ field }) => <Input id="quantity" type="number" step="1" {...field} />} />
                        {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="brand">Marca*</Label>
                        <Controller name="brand" control={control} render={({ field }) => <SelectOrInput options={PREDEFINED_BRANDS} placeholder="Selecione ou escreva uma marca" {...field} />} />
                        {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="material">Material*</Label>
                        <Controller name="material" control={control} render={({ field }) => <SelectOrInput options={PREDEFINED_MATERIALS} placeholder="Selecione ou escreva um material" {...field} />} />
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
                        <Label htmlFor="category">Categoria</Label>
                         <Controller name="category" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Roupa">Roupa</SelectItem>
                                    <SelectItem value="Calçado">Calçado</SelectItem>
                                    <SelectItem value="Livros">Livros</SelectItem>
                                    <SelectItem value="Eletrónica">Eletrónica</SelectItem>
                                    <SelectItem value="Outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                         )}/>
                        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="condition">Condição</Label>
                         <Controller name="condition" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
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
                 <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Alterações
                </Button>
            </div>
        </form>
      </CardContent>
    </Card>
  );
}