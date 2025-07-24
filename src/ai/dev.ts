import { config } from 'dotenv';
config();

import '@/ai/flows/generate-image-from-text.ts';
import '@/ai/flows/generate-caption-from-image.ts';
import '@/ai/flows/generate-summary-from-image.ts';
import '@/ai/flows/analyze-formula-from-image.ts';
