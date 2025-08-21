import * as z from "zod";

const imageSchema = z.union([z.string(), z.instanceof(File)]);

export const sellFormSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  price: z.coerce.number({ invalid_type_error: "O preço é obrigatório." }).min(0.01, "O preço deve ser positivo."),
  category: z.string().min(1, "Por favor, selecione uma categoria."),
  condition: z.string().min(1, "Por favor, selecione a condição do artigo."),
  images: z.array(imageSchema).min(1, "Pelo menos uma imagem é obrigatória."),
  
  // Campo Quantidade adicionado e obrigatório
  quantity: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1."),

  // Campos opcionais
  brand: z.string().optional(),
  material: z.string().optional(),
  sizes: z.string().optional(),
});

export const editFormSchema = sellFormSchema;

export const loginSchema = z.object({
  email: z.string().email("Por favor, introduza um email válido."),
  password: z.string().min(1, "A palavra-passe é obrigatória."),
});

export const registerSchema = z.object({
  username: z.string().min(3, "O nome de utilizador deve ter pelo menos 3 caracteres."),
  email: z.string().email("Por favor, introduza um email válido."),
  password: z.string().min(8, "A palavra-passe deve ter pelo menos 8 caracteres."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "As palavras-passe não correspondem.",
  path: ["confirmPassword"],
});

// Esquema para o novo formulário de checkout
export const checkoutSchema = z.object({
    email: z.string().email("Email inválido."),
    firstName: z.string().min(1, "O nome é obrigatório."),
    lastName: z.string().min(1, "O apelido é obrigatório."),
    phone: z.string().optional(),
    country: z.string().min(1, "O país é obrigatório."),
    address: z.string().min(1, "A morada é obrigatória."),
    city: z.string().min(1, "A cidade é obrigatória."),
    region: z.string().min(1, "A região é obrigatória."),
    postalCode: z.string().min(1, "O código postal é obrigatório."),
});

export type SellFormValues = z.infer<typeof sellFormSchema>;
export type EditFormValues = z.infer<typeof editFormSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;