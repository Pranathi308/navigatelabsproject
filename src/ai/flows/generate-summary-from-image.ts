'use server';

/**
 * @fileOverview An image summarization AI agent.
 *
 * - generateSummaryFromImage - A function that handles the image summarization process.
 * - GenerateSummaryFromImageInput - The input type for the generateSummaryFromImage function.
 * - GenerateSummaryFromImageOutput - The return type for the generateSummaryFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to summarize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateSummaryFromImageInput = z.infer<typeof GenerateSummaryFromImageInputSchema>;

const GenerateSummaryFromImageOutputSchema = z.object({
  summary: z.string().describe('The generated summary for the image.'),
});
export type GenerateSummaryFromImageOutput = z.infer<typeof GenerateSummaryFromImageOutputSchema>;

export async function generateSummaryFromImage(input: GenerateSummaryFromImageInput): Promise<GenerateSummaryFromImageOutput> {
  return generateSummaryFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryFromImagePrompt',
  input: {schema: GenerateSummaryFromImageInputSchema},
  output: {schema: GenerateSummaryFromImageOutputSchema},
  prompt: `You are an expert in understanding images and creating detailed summaries of their content.

  Generate a summary for the following image.

  Image: {{media url=photoDataUri}}`,
});

const generateSummaryFromImageFlow = ai.defineFlow(
  {
    name: 'generateSummaryFromImageFlow',
    inputSchema: GenerateSummaryFromImageInputSchema,
    outputSchema: GenerateSummaryFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
