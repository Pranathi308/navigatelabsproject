'use server';

/**
 * @fileOverview An AI agent for analyzing mathematical formulas from images.
 *
 * - analyzeFormulaFromImage - A function that handles the formula analysis process.
 * - AnalyzeFormulaFromImageInput - The input type for the analyzeFormulaFromImage function.
 * - AnalyzeFormulaFromImageOutput - The return type for the analyzeFormulaFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFormulaFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a mathematical formula, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeFormulaFromImageInput = z.infer<typeof AnalyzeFormulaFromImageInputSchema>;

const AnalyzeFormulaFromImageOutputSchema = z.object({
  formulaName: z.string().describe('The name of the mathematical formula.'),
  use: z.string().describe('The primary use or application of the formula.'),
  example: z.string().describe('A short and simple example of how the formula is used.'),
});
export type AnalyzeFormulaFromImageOutput = z.infer<typeof AnalyzeFormulaFromImageOutputSchema>;

export async function analyzeFormulaFromImage(input: AnalyzeFormulaFromImageInput): Promise<AnalyzeFormulaFromImageOutput> {
  return analyzeFormulaFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFormulaFromImagePrompt',
  input: {schema: AnalyzeFormulaFromImageInputSchema},
  output: {schema: AnalyzeFormulaFromImageOutputSchema},
  prompt: `You are a mathematics expert. Analyze the image provided, which contains a mathematical formula. 
  
  Identify the formula, describe its primary use, and provide a concise example.

  Image: {{media url=photoDataUri}}`,
});

const analyzeFormulaFromImageFlow = ai.defineFlow(
  {
    name: 'analyzeFormulaFromImageFlow',
    inputSchema: AnalyzeFormulaFromImageInputSchema,
    outputSchema: AnalyzeFormulaFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
