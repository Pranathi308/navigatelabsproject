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
  count: z.number().min(1).max(4).default(1).describe('The number of images to generate.'),
});
export type GenerateImageFromTextInput = z.infer<
  typeof GenerateImageFromTextInputSchema
>;

const GenerateImageFromTextOutputSchema = z.object({
  images: z.array(z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    )
  ).describe('An array of generated images.'),
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
    const {message} = await ai.generate({
      model:
        'googleai/gemini-2.0-flash-preview-image-generation', 
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        numberOfImages: input.count,
      },
    });

    const images = message.content.filter(p => p.media).map(p => p.media!.url);

    if (!images || images.length === 0) {
      throw new Error('No image was generated.');
    }

    return {images};
  }
);