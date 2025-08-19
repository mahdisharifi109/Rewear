'use server';

/**
 * @fileOverview AI-powered product detail suggestion flow.
 *
 * - suggestProductDetails - A function that suggests titles, descriptions, and categories for a product listing based on an image.
 * - SuggestProductDetailsInput - The input type for the suggestProductDetails function.
 * - SuggestProductDetailsOutput - The return type for the suggestProductDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProductDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestProductDetailsInput = z.infer<typeof SuggestProductDetailsInputSchema>;

const validCategories = z.enum(["Roupa", "Calçado", "Livros", "Eletrónica", "Outro"]);

const SuggestProductDetailsOutputSchema = z.object({
  suggestedTitle: z.string().describe('A suggested title for the product listing.'),
  suggestedDescription: z.string().describe('A suggested description for the product listing.'),
  suggestedCategory: validCategories.describe('A suggested category for the product.'),
});
export type SuggestProductDetailsOutput = z.infer<typeof SuggestProductDetailsOutputSchema>;

export async function suggestProductDetails(input: SuggestProductDetailsInput): Promise<SuggestProductDetailsOutput> {
  return suggestProductDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProductDetailsPrompt',
  input: {schema: SuggestProductDetailsInputSchema},
  output: {schema: SuggestProductDetailsOutputSchema},
  prompt: `You are an expert product listing assistant. You will analyze the image of the product and generate a relevant title, description, and category for a listing on an online marketplace.

Analyze the following image to generate the title, description, and category:

{{media url=photoDataUri}}

Ensure that the title is concise and appealing, the description is informative, and the category is accurate.

The category MUST be one of the following values: ${validCategories.options.join(
    ', '
  )}.

Title:
Suggested Title

Description:
Suggested Description

Category:
Suggested Category`,
});

const suggestProductDetailsFlow = ai.defineFlow(
  {
    name: 'suggestProductDetailsFlow',
    inputSchema: SuggestProductDetailsInputSchema,
    outputSchema: SuggestProductDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
