'use server';

/**
 * @fileOverview An image captioning AI agent.
 *
 * - generateCaptionFromImage - A function that handles the image captioning process.
 * - GenerateCaptionFromImageInput - The input type for the generateCaptionFromImage function.
 * - GenerateCaptionFromImageOutput - The return type for the generateCaptionFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCaptionFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to caption, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateCaptionFromImageInput = z.infer<typeof GenerateCaptionFromImageInputSchema>;

const GenerateCaptionFromImageOutputSchema = z.object({
  caption: z.string().describe('The generated caption for the image.'),
});
export type GenerateCaptionFromImageOutput = z.infer<typeof GenerateCaptionFromImageOutputSchema>;

export async function generateCaptionFromImage(input: GenerateCaptionFromImageInput): Promise<GenerateCaptionFromImageOutput> {
  return generateCaptionFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCaptionFromImagePrompt',
  input: {schema: GenerateCaptionFromImageInputSchema},
  output: {schema: GenerateCaptionFromImageOutputSchema},
  prompt: `You are an expert in understanding images and creating concise and descriptive captions.

  Generate a caption for the following image.

  Image: {{media url=photoDataUri}}`,
});

const generateCaptionFromImageFlow = ai.defineFlow(
  {
    name: 'generateCaptionFromImageFlow',
    inputSchema: GenerateCaptionFromImageInputSchema,
    outputSchema: GenerateCaptionFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
