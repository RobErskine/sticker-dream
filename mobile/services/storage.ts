import * as SecureStore from 'expo-secure-store';
import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  writeAsStringAsync,
  readAsStringAsync,
  readDirectoryAsync,
  deleteAsync,
  EncodingType,
} from 'expo-file-system/legacy';

const API_KEY_STORAGE_KEY = 'gemini_api_key';
const IMAGES_DIR = `${documentDirectory}sticker-dream-images/`;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// ============ API Key Storage ============

export async function saveApiKey(apiKey: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
}

export async function getApiKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}

export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return key !== null && key.length > 0;
}

// ============ Image Archive Storage ============

export interface ArchivedImage {
  id: string;
  uri: string;
  prompt: string;
  createdAt: number; // timestamp
}

async function ensureImagesDir(): Promise<void> {
  const dirInfo = await getInfoAsync(IMAGES_DIR);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
}

export async function saveImage(base64Data: string, prompt: string): Promise<ArchivedImage> {
  await ensureImagesDir();

  const id = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const uri = `${IMAGES_DIR}${id}.png`;

  await writeAsStringAsync(uri, base64Data, {
    encoding: EncodingType.Base64,
  });

  const image: ArchivedImage = {
    id,
    uri,
    prompt,
    createdAt: Date.now(),
  };

  // Save metadata
  await saveImageMetadata(image);

  return image;
}

async function getMetadataPath(): Promise<string> {
  await ensureImagesDir();
  return `${IMAGES_DIR}metadata.json`;
}

async function saveImageMetadata(newImage: ArchivedImage): Promise<void> {
  const images = await getAllImages();
  images.unshift(newImage); // Add to beginning (newest first)

  const metadataPath = await getMetadataPath();
  await writeAsStringAsync(metadataPath, JSON.stringify(images));
}

export async function getAllImages(): Promise<ArchivedImage[]> {
  try {
    const metadataPath = await getMetadataPath();
    const metadataInfo = await getInfoAsync(metadataPath);

    if (!metadataInfo.exists) {
      return [];
    }

    const content = await readAsStringAsync(metadataPath);
    const images: ArchivedImage[] = JSON.parse(content);

    // Filter to only images from last 7 days
    const cutoff = Date.now() - SEVEN_DAYS_MS;
    return images.filter(img => img.createdAt > cutoff);
  } catch (error) {
    console.error('Error reading image metadata:', error);
    return [];
  }
}

export async function getImageBase64(uri: string): Promise<string> {
  return await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });
}

export async function cleanupOldImages(): Promise<void> {
  try {
    const allImages = await getAllImages(); // Already filtered to 7 days
    const metadataPath = await getMetadataPath();

    // Get all files in directory
    const dirInfo = await getInfoAsync(IMAGES_DIR);
    if (!dirInfo.exists) return;

    const files = await readDirectoryAsync(IMAGES_DIR);
    const validIds = new Set(allImages.map(img => img.id));

    // Delete files that aren't in valid list (excluding metadata.json)
    for (const file of files) {
      if (file === 'metadata.json') continue;

      const fileId = file.replace('.png', '');
      if (!validIds.has(fileId)) {
        await deleteAsync(`${IMAGES_DIR}${file}`, { idempotent: true });
      }
    }

    // Update metadata file with only valid images
    await writeAsStringAsync(metadataPath, JSON.stringify(allImages));
  } catch (error) {
    console.error('Error cleaning up old images:', error);
  }
}

export async function deleteImage(id: string): Promise<void> {
  try {
    const uri = `${IMAGES_DIR}${id}.png`;
    await deleteAsync(uri, { idempotent: true });

    const images = await getAllImages();
    const filtered = images.filter(img => img.id !== id);

    const metadataPath = await getMetadataPath();
    await writeAsStringAsync(metadataPath, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}
