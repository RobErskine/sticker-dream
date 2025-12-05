import { useState, useEffect, useCallback } from 'react';
import {
  ArchivedImage,
  getAllImages,
  saveImage,
  deleteImage,
  cleanupOldImages,
  getImageBase64,
} from '../services/storage';

interface UseImageArchiveResult {
  images: ArchivedImage[];
  loading: boolean;
  saveNewImage: (base64Data: string, prompt: string) => Promise<ArchivedImage>;
  removeImage: (id: string) => Promise<void>;
  refreshImages: () => Promise<void>;
  getBase64: (uri: string) => Promise<string>;
}

export function useImageArchive(): UseImageArchiveResult {
  const [images, setImages] = useState<ArchivedImage[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshImages = useCallback(async () => {
    try {
      setLoading(true);
      // Cleanup old images first
      await cleanupOldImages();
      // Then get all valid images
      const allImages = await getAllImages();
      setImages(allImages);
    } catch (error) {
      console.error('Error refreshing images:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveNewImage = useCallback(async (base64Data: string, prompt: string): Promise<ArchivedImage> => {
    const newImage = await saveImage(base64Data, prompt);
    setImages(prev => [newImage, ...prev]);
    return newImage;
  }, []);

  const removeImage = useCallback(async (id: string): Promise<void> => {
    await deleteImage(id);
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const getBase64 = useCallback(async (uri: string): Promise<string> => {
    return getImageBase64(uri);
  }, []);

  // Load images on mount
  useEffect(() => {
    refreshImages();
  }, [refreshImages]);

  return {
    images,
    loading,
    saveNewImage,
    removeImage,
    refreshImages,
    getBase64,
  };
}
