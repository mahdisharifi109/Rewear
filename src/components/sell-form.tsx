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
import { Sparkles, UploadCloud, Loader2, X } from "lucide-react";
import { suggestProductDetails } from "@/ai/flows/suggest-product-details";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/context/product-context";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { sellFormSchema, type SellFormValues } from "@/lib/schemas"; // Corrigido

export function SellForm() {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addProduct } = useProducts();
  const { user } = useAuth();
  const router = useRouter();

  const { control, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<SellFormValues>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: '' as any, // Corrigido
      category: "",
      condition: "",
      images: [],
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
        try {
            const newDataUris = await Promise.all(newFiles.map(fileToDataUri));
            setValue("images", [...(watch("images") || []), ...newDataUris], { shouldValidate: true });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao carregar imagem",
                description: "Não foi possível processar uma das imagens."
            })
        }
    }
  };
  
  const removeImage = (index: number) => {
    const currentImages = watch("images");
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue("images", newImages, { shouldValidate: true });
  };

  const handleSuggestion = async () => {
    const images = watch("images");
    if (images.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhuma imagem selecionada",
        description: "Por favor, carregue uma imagem para obter sugestões.",
      });
      return;
    }
    
    setIsSuggesting(true);
    try {
      const base64data = images[0];
      const result = await suggestProductDetails({ photoDataUri: base64data });
      setValue("title", result.suggestedTitle, { shouldValidate: true });
      setValue("description", result.suggestedDescription, { shouldValidate: true });
      setValue("category", result.suggestedCategory, { shouldValidate: true });

      toast({
          title: "Sugestões Geradas!",
          description: "Preenchemos alguns campos para si.",
      });
    } catch (error) {
      console.error("Error suggesting product details:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar sugestões",
        description: "Não foi possível analisar a imagem. Por favor, tente novamente.",
      });
    } finally {
        setIsSuggesting(false);
    }
  };

  const onSubmit = (data: SellFormValues) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Erro de Autenticação",
            description: "Precisa de estar autenticado para publicar um anúncio.",
        });
        return;
    }
    setIsSubmitting(true);
    try {
        addProduct({
          name: data.title,
          description: data.description,
          price: data.price,
          category: data.category as any,
          condition: data.condition as any,
          imageUrls: data.images,
          imageHint: data.title.split(" ").slice(0, 2).join(" "),
          userEmail: user.email,
        });

        toast({
          title: "Anúncio Publicado!",
          description: "O seu produto foi listado com sucesso!",
        });
        
        reset();
        router.push('/');
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao Publicar",
            description: "Não foi possível publicar o seu anúncio. Tente novamente."
        })
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venda o seu artigo</CardTitle>
        <CardDescription>Preencha os detalhes abaixo. Carregue uma ou mais imagens e use a IA para obter ajuda!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
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
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative group aspect-square">
                       <Image src={src} alt={`Pré-visualização ${index + 1}`} fill objectFit="cover" className="rounded-md" />
                       <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-4 w-4" />
                       </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && <p className="text-sm text-destructive">{errors.images.message?.toString()}</p>}
            </div>
            <Button type="button" onClick={handleSuggestion} disabled={isSuggesting || imagePreviews.length === 0} className="w-full">
              {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Gerar Sugestões com IA (baseado na 1ª imagem)
            </Button>
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
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Preço (€)</Label>
                    <Controller name="price" control={control} render={({ field }) => <Input id="price" type="number" step="0.01" placeholder="0.00" {...field} />} />
                    {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                     <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Roupa">Roupa</SelectItem>
                                    <SelectItem value="Calçado">Calçado</SelectItem>
                                    <SelectItem value="Livros">Livros</SelectItem>
                                    <SelectItem value="Eletrónica">Eletrónica</SelectItem>
                                    <SelectItem value="Outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>
             </div>
             <div className="space-y-2">
                <Label htmlFor="condition">Condição</Label>
                 <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecione a condição" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Novo">Novo</SelectItem>
                                <SelectItem value="Muito bom">Muito bom</SelectItem>
                                <SelectItem value="Bom">Bom</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
             </div>
             <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publicar Anúncio
             </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}