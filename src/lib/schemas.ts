// src/lib/schemas.ts

import * as z from "zod";

// Aceita strings (para imagens já existentes) ou ficheiros (para novos uploads)
const imageSchema = z.union([z.string(), z.instanceof(File)]);

// Esquema para o formulário de venda
export const sellFormSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  price: z.coerce.number().min(0.01, "O preço deve ser positivo."),
  category: z.string().min(1, "Por favor, selecione uma categoria."),
  condition: z.string().min(1, "Por favor, selecione a condição do artigo."),
  // O campo de imagens agora aceita um array de ficheiros ou strings
  images: z.array(imageSchema).min(1, "Pelo menos uma imagem é obrigatória."),
});

// Esquema para o formulário de edição
export const editFormSchema = sellFormSchema;

// Esquema para o formulário de login
export const loginSchema = z.object({
  email: z.string().email("Por favor, introduza um email válido."),
  password: z.string().min(1, "A palavra-passe é obrigatória."),
});

// Esquema para o formulário de registo
export const registerSchema = z.object({
  username: z.string().min(3, "O nome de utilizador deve ter pelo menos 3 caracteres."),
  email: z.string().email("Por favor, introduza um email válido."),
  password: z.string().min(8, "A palavra-passe deve ter pelo menos 8 caracteres."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "As palavras-passe não correspondem.",
  path: ["confirmPassword"],
});


// Exportar os tipos inferidos a partir dos esquemas
export type SellFormValues = z.infer<typeof sellFormSchema>;
export type EditFormValues = z.infer<typeof editFormSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
