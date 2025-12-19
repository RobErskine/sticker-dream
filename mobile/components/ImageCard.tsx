import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import { ArchivedImage } from '../services/storage';
import { ImageActions } from './ImageActions';

interface ImageCardProps {
  image: ArchivedImage;
  onDelete?: (id: string) => void;
}

export function ImageCard({ image, onDelete }: ImageCardProps) {
  const formattedDate = new Date(image.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <Image source={{ uri: image.uri }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.prompt} numberOfLines={2}>
          {image.prompt}
        </Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <ImageActions
        imageUri={image.uri}
        imageId={image.id}
        onDelete={onDelete}
        showDelete={!!onDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2d2d2d',
    marginBottom: 16,
    overflow: 'hidden',
    width: '48%',
  },
  image: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#f0f0f0',
  },
  info: {
    padding: 12,
  },
  prompt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d2d2d',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
});
