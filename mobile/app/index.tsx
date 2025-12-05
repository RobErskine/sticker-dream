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
import { hasApiKey } from '../services/storage';
import {
  playPressSound,
  playLoadingSound,
  playFinishedSound,
  stopLoadingSound,
} from '../services/sounds';

type AppStatus = 'idle' | 'listening' | 'processing' | 'success' | 'error' | 'cancelled';

export default function HomeScreen() {
  const [appStatus, setAppStatus] = useState<AppStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('Press the button and tell Sticker Lizard what to draw!');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  const { transcript, startListening, stopListening, reset: resetSpeech } = useSpeechRecognition();
  const { saveNewImage } = useImageArchive();

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

  const handlePressIn = useCallback(async () => {
    if (!hasKey) {
      router.push('/settings');
      return;
    }

    playPressSound();
    setAppStatus('listening');
    setStatusMessage('Listening...');
    setCurrentImage(null);
    await startListening();
  }, [hasKey, startListening]);

  const handlePressOut = useCallback(async () => {
    stopListening();

    // Wait a moment for final transcript
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if we have a transcript to process
    if (!transcript || transcript.trim().length === 0) {
      setAppStatus('cancelled');
      setStatusMessage('No speech detected. Try again!');
      setTimeout(() => {
        setAppStatus('idle');
        setStatusMessage('Press the button and tell Sticker Lizard what to draw!');
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
        setStatusMessage('Press the button and tell Sticker Lizard what to draw!');
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
        setStatusMessage('Press the button and tell Sticker Lizard what to draw!');
        resetSpeech();
      }, 3000);
      return;
    }

    // Save to archive
    await saveNewImage(result.base64, transcript);

    // Display the image
    setCurrentImage(`data:image/png;base64,${result.base64}`);
    setStatusMessage(`"${transcript}"`);

    // Print the image
    setAppStatus('processing');
    const printResult = await printImage(result.base64);

    if (printResult.success) {
      playFinishedSound();
      setAppStatus('success');
      setTimeout(() => {
        setAppStatus('idle');
        setStatusMessage('Press the button and tell Sticker Lizard what to draw!');
        resetSpeech();
      }, 3000);
    } else {
      setAppStatus('error');
      setStatusMessage('Print failed. You can print again from Archive.');
      setTimeout(() => {
        setAppStatus('idle');
        resetSpeech();
      }, 3000);
    }
  }, [transcript, stopListening, resetSpeech, saveNewImage]);

  const isProcessing = appStatus === 'processing';

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: currentImage }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navButtons}>
          <Pressable
            style={styles.navButton}
            onPress={() => router.push('/archive')}
          >
            <Text style={styles.navButtonText}>My Stickers</Text>
          </Pressable>
          <Pressable
            style={styles.navButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.navButtonText}>Settings</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFB3D9',
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
    borderWidth: 2,
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
  imageContainer: {
    marginTop: 30,
    width: '60%',
    aspectRatio: 9 / 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2d2d2d',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navButtons: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 30,
    gap: 20,
  },
  navButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2d2d2d',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d2d2d',
  },
});
