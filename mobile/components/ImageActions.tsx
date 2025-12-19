import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import {
  cacheDirectory,
  writeAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import { printImage } from '../services/printing';
import { getImageBase64 } from '../services/storage';

interface ImageActionsProps {
  imageUri: string;
  imageId?: string;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export function ImageActions({
  imageUri,
  imageId,
  onDelete,
  showDelete = true,
}: ImageActionsProps) {
  const handlePrint = async () => {
    try {
      // Check if it's a base64 data URI or a file URI
      let base64: string;
      if (imageUri.startsWith('data:image')) {
        // Extract base64 from data URI
        base64 = imageUri.split(',')[1];
      } else {
        base64 = await getImageBase64(imageUri);
      }
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

      let shareUri = imageUri;

      // For data URIs, save to a temp file first
      if (imageUri.startsWith('data:image')) {
        const base64 = imageUri.split(',')[1];
        const tempPath = `${cacheDirectory}temp_share_${Date.now()}.png`;
        await writeAsStringAsync(tempPath, base64, {
          encoding: EncodingType.Base64,
        });
        shareUri = tempPath;
      }

      await Sharing.shareAsync(shareUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Sticker',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Error', 'Failed to share image. Please try again.');
    }
  };

  const handleDelete = () => {
    if (!imageId || !onDelete) return;

    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this sticker?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(imageId),
        },
      ]
    );
  };

  return (
    <View style={styles.actions}>
      <Pressable style={styles.actionButton} onPress={handlePrint}>
        <Text style={styles.actionText}>Print</Text>
      </Pressable>
      <Pressable style={styles.actionButton} onPress={handleShare}>
        <Text style={styles.actionText}>Share</Text>
      </Pressable>
      {showDelete && (
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
