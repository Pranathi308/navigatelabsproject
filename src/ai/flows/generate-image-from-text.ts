// Text-to-image generation flow.
'use server';
/**
 * @fileOverview Generates an image from a text prompt.
 *
 * - generateImageFromText - A function that generates an image from a text prompt.
 * - GenerateImageFromTextInput - The input type for the generateImageFromText function.
 * - GenerateImageFromTextOutput - The return type for the generateImageFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromTextInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the image from.'),
});
export type GenerateImageFromTextInput = z.infer<
  typeof GenerateImageFromTextInputSchema
>;

const GenerateImageFromTextOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    )
    .describe('The generated image.'),
});
export type GenerateImageFromTextOutput = z.infer<
  typeof GenerateImageFromTextOutputSchema
>;

export async function generateImageFromText(
  input: GenerateImageFromTextInput
): Promise<GenerateImageFromTextOutput> {
  return generateImageFromTextFlow(input);
}

const generateImageFromTextFlow = ai.defineFlow(
  {
    name: 'generateImageFromTextFlow',
    inputSchema: GenerateImageFromTextInputSchema,
    outputSchema: GenerateImageFromTextOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model:
        'googleai/gemini-2.0-flash-preview-image-generation', 
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const image = media?.url;

    if (!image) {
      throw new Error('No image was generated.');
    }

    return {image};
  }
);
