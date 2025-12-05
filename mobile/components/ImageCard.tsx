import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { ArchivedImage } from '../services/storage';
import { printImage } from '../services/printing';
import { getImageBase64 } from '../services/storage';

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

  const handlePrint = async () => {
    try {
      const base64 = await getImageBase64(image.uri);
      await printImage(base64);
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Print Error', 'Failed to print image. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
        return;
      }

      // Share the image file directly
      await Sharing.shareAsync(image.uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Sticker',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Error', 'Failed to share image. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this sticker?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(image.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: image.uri }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.prompt} numberOfLines={2}>
          {image.prompt}
        </Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={handlePrint}>
          <Text style={styles.actionText}>Print</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
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
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d2d2d',
  },
  deleteButton: {
    borderRightWidth: 0,
  },
  deleteText: {
    color: '#ff4444',
  },
});
