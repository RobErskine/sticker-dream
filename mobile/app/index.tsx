import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { DreamButton } from '../components/DreamButton';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useImageArchive } from '../hooks/useImageArchive';
import { generateColoringPage } from '../services/imageGeneration';
import { printImage } from '../services/printing';
import { ImageActions } from '../components/ImageActions';
import { AnimatedIconBackground, BACKGROUND_ICONS } from '../components/AnimatedBackgrounds';
import { hasApiKey } from '../services/storage';
import {
  playPressSound,
  playLoadingSound,
  playFinishedSound,
  stopLoadingSound,
} from '../services/sounds';

type AppStatus = 'idle' | 'listening' | 'processing' | 'success' | 'error' | 'cancelled';

// Helper to format time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default function HomeScreen() {
  const [appStatus, setAppStatus] = useState<AppStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('Press and hold the button and tell the \n Sticker Lizard what to draw!');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [imageGeneratedAt, setImageGeneratedAt] = useState<Date | null>(null);
  const [timeAgoText, setTimeAgoText] = useState<string>('');
  const [hasKey, setHasKey] = useState(false);
  const [backgroundIconIndex, setBackgroundIconIndex] = useState(0);

  const { transcript, startListening, stopListening, reset: resetSpeech } = useSpeechRecognition();
  const { saveNewImage, removeImage } = useImageArchive();

  // Check for API key when screen comes into focus (including returning from settings)
  useFocusEffect(
    useCallback(() => {
      checkApiKey();
    }, [])
  );

  const checkApiKey = async () => {
    const keyExists = await hasApiKey();
    setHasKey(keyExists);
    if (!keyExists) {
      setStatusMessage('Please add your API key in Settings first!');
    }
  };

  // Update status message when transcript changes
  useEffect(() => {
    if (transcript) {
      setStatusMessage(transcript);
    }
  }, [transcript]);

  // Update time ago text every 30 seconds
  useEffect(() => {
    if (!imageGeneratedAt) return;

    const updateTimeAgo = () => {
      setTimeAgoText(getTimeAgo(imageGeneratedAt));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000);

    return () => clearInterval(interval);
  }, [imageGeneratedAt]);

  const handlePressIn = useCallback(async () => {
    if (!hasKey) {
      router.push('/settings');
      return;
    }

    playPressSound();
    setAppStatus('listening');
    setStatusMessage('Listening...');
    setCurrentImage(null);
    setCurrentPrompt(null);
    setImageGeneratedAt(null);
    await startListening();
  }, [hasKey, startListening]);

  const handlePressOut = useCallback(async () => {
    // Add a 1.5 second buffer before stopping so the last word doesn't get cut off
    setStatusMessage('Listening...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    stopListening();

    // Wait a moment for final transcript to process
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if we have a transcript to process
    if (!transcript || transcript.trim().length === 0) {
      setAppStatus('cancelled');
      setStatusMessage('No speech detected. Try again!');
      setTimeout(() => {
        setAppStatus('idle');
        setStatusMessage('Press and hold the button and tell the Sticker Lizard what to draw!');
        resetSpeech();
      }, 2000);
      return;
    }

    // Check for cancel words
    const upperTranscript = transcript.toUpperCase();
    const abortWords = ['BLANK', 'NO IMAGE', 'NO STICKER', 'CANCEL', 'ABORT', 'START OVER'];
    if (abortWords.some(word => upperTranscript.includes(word))) {
      setAppStatus('cancelled');
      setStatusMessage('Cancelled!');
      setTimeout(() => {
        setAppStatus('idle');
        setStatusMessage('Press and hold the button and tell the Sticker Lizard what to draw!');
        resetSpeech();
      }, 2000);
      return;
    }

    // Generate image
    setAppStatus('processing');
    setStatusMessage(`"${transcript}"\n\nSticker Lizard is drawing...`);
    playLoadingSound();

    const result = await generateColoringPage(transcript);
    stopLoadingSound();

    if (!result.success || !result.base64) {
      setAppStatus('error');
      setStatusMessage(result.error || 'Failed to generate image');
      Alert.alert('Error', result.error || 'Failed to generate image');
      setTimeout(() => {
        setAppStatus('idle');
        setStatusMessage('Press and hold the button and tell the Sticker Lizard what to draw!');
        resetSpeech();
      }, 3000);
      return;
    }

    // Save to archive
    const savedImage = await saveNewImage(result.base64, transcript);

    // Cycle to next background icon
    setBackgroundIconIndex(prev => (prev + 1) % BACKGROUND_ICONS.length);

    // Display the image with metadata
    setCurrentImage(savedImage.uri);
    setCurrentImageId(savedImage.id);
    setCurrentPrompt(transcript);
    setImageGeneratedAt(new Date());
    setStatusMessage(`"${transcript}"`);

    // Print the image
    setAppStatus('processing');
    const printResult = await printImage(result.base64);

    if (printResult.success) {
      playFinishedSound();
      setAppStatus('success');
      setTimeout(() => {
        setAppStatus('idle');
        setStatusMessage('Press and hold the button and tell the Sticker Lizard what to draw!');
        resetSpeech();
      }, 3000);
    } else {
      // Print was cancelled or failed - show friendly message via toast
      // but keep the original prompt displayed
      playFinishedSound(); // Still play success sound since image was created
      setAppStatus('success');

      // Show toast about print status
      if (printResult.error === 'cancelled') {
        Alert.alert(
          'Image Saved!',
          "Print was skipped, but we've saved this image to My Stickers.",
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Image Saved!',
          "No printer found, so we've saved this image to My Stickers.",
          [{ text: 'OK' }]
        );
      }

      // Keep showing the original prompt
      setStatusMessage(`"${transcript}"`);
      setTimeout(() => {
        setAppStatus('idle');
        setStatusMessage('Press and hold the button and tell the Sticker Lizard what to draw!');
        resetSpeech();
      }, 3000);
    }
  }, [transcript, stopListening, resetSpeech, saveNewImage]);

  const isProcessing = appStatus === 'processing';

  const handleDeleteCurrentImage = useCallback(async (id: string) => {
    await removeImage(id);
    setCurrentImage(null);
    setCurrentImageId(null);
    setCurrentPrompt(null);
    setImageGeneratedAt(null);
  }, [removeImage]);

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <AnimatedIconBackground
        icon={BACKGROUND_ICONS[backgroundIconIndex]}
        backgroundColor="#FFB3D9"
        iconOpacity={0.1}
        speed={5000}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Settings button - top right, subtle */}
        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </Pressable>

        <View style={styles.content}>
          {/* Status Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{statusMessage}</Text>
          </View>

          {/* Main Button */}
          <DreamButton
            status={appStatus}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isProcessing}
          />

          {/* Generated Image Preview */}
          {currentImage && (
            <View style={styles.imageCard}>
              <View style={styles.imageCardContent}>
                <View style={styles.imageCardInfo}>
                  {currentPrompt && (
                    <Text style={styles.imageCardPrompt}>Last photo: {'\n'} {currentPrompt}</Text>
                  )}
                  <Text style={styles.imageCardTime}>{timeAgoText}</Text>
                </View>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: currentImage }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <ImageActions
                imageUri={currentImage}
                imageId={currentImageId ?? undefined}
                onDelete={handleDeleteCurrentImage}
                showDelete={true}
              />
            </View>
          )}
        </View>

        {/* My Stickers button - full width at bottom */}
        <Pressable
          style={styles.myStickersButton}
          onPress={() => router.push('/archive')}
        >
          <Text style={styles.myStickersButtonText}>🖼️ My Stickers</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 0,
    borderColor: '#2d2d2d',
    padding: 16,
    marginBottom: 30,
    width: '100%',
    minHeight: 80,
    justifyContent: 'center',
  },
  message: {
    fontSize: 18,
    color: '#2d2d2d',
    textAlign: 'center',
    lineHeight: 24,
  },
  imageCard: {
    marginTop: 30,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#2d2d2d',
    overflow: 'hidden',
  },
  imageCardContent: {
    flexDirection: 'row',
  },
  imageCardInfo: {
    width: '60%',
    padding: 12,
    justifyContent: 'center',
  },
  imageCardPrompt: {
    fontSize: 14,
    color: '#2d2d2d',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  imageCardTime: {
    fontSize: 12,
    color: '#666',
  },
  imageContainer: {
    width: '60%',
    position: 'relative',
    left: '-6%',
    aspectRatio: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
    opacity: 0.5,
    zIndex: 10,
  },
  settingsButtonText: {
    fontSize: 20,
  },
  myStickersButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#2d2d2d',
    alignItems: 'center',
  },
  myStickersButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d2d2d',
  },
});
