import { GoogleGenAI } from '@google/genai';
import { getApiKey } from './storage';

const IMAGE_MODEL = 'imagen-4.0-generate-001';

export interface GenerationResult {
  success: boolean;
  base64?: string;
  error?: string;
}

export async function generateColoringPage(prompt: string): Promise<GenerationResult> {
  try {
    const apiKey = await getApiKey();

    if (!apiKey) {
      return {
        success: false,
        error: 'No API key configured. Please add your Gemini API key in Settings.',
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    console.log(`Generating image: "${prompt}"`);
    const startTime = Date.now();

    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: `A black and white kids coloring page.
      <image-description>
      ${prompt}
      </image-description>
      ${prompt}`,
      config: {
        numberOfImages: 1,
        aspectRatio: '9:16',
      },
    });

    console.log(`Generation took ${Date.now() - startTime}ms`);

    if (!response.generatedImages || response.generatedImages.length === 0) {
      return {
        success: false,
        error: 'No images generated. Please try again.',
      };
    }

    const imageBytes = response.generatedImages[0].image?.imageBytes;
    if (!imageBytes) {
      return {
        success: false,
        error: 'No image data returned. Please try again.',
      };
    }

    return {
      success: true,
      base64: imageBytes,
    };
  } catch (error) {
    console.error('Image generation error:', error);

    let errorMessage = 'Failed to generate image.';

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key. Please check your Gemini API key in Settings.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'API quota exceeded. Please try again later.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const ai = new GoogleGenAI({ apiKey });

    // Try a simple request to validate the key
    // We'll use a minimal generation to test
    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: 'A simple circle',
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
      },
    });

    return response.generatedImages !== undefined;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}
