import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

const MAX_RECORDING_MS = 15000; // 15 seconds max
const ABORT_WORDS = ['BLANK', 'NO IMAGE', 'NO STICKER', 'CANCEL', 'ABORT', 'START OVER'];

export type RecognitionStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'cancelled'
  | 'error';

interface UseSpeechRecognitionResult {
  status: RecognitionStatus;
  transcript: string;
  error: string | null;
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  reset: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle recognition results
  useSpeechRecognitionEvent('result', (event) => {
    // expo-speech-recognition provides results in event.results
    // Each result has a transcript property
    if (event.results && event.results.length > 0) {
      // Get the transcript from the most recent result
      const lastResult = event.results[event.results.length - 1];
      // The result object has a transcript property directly
      const transcriptText = (lastResult as { transcript?: string })?.transcript || '';
      if (transcriptText) {
        setTranscript(transcriptText);
      }
    }
  });

  // Handle recognition end
  useSpeechRecognitionEvent('end', () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Check for abort words
    const upperTranscript = transcript.toUpperCase();
    const shouldAbort = ABORT_WORDS.some(word => upperTranscript.includes(word));

    if (shouldAbort || !transcript.trim()) {
      setStatus('cancelled');
    } else {
      setStatus('processing');
    }
  });

  // Handle errors
  useSpeechRecognitionEvent('error', (event) => {
    // 'no-speech' is not really an error - just means user didn't speak
    // Treat it as a cancellation rather than an error
    if (event.error === 'no-speech') {
      console.log('No speech detected');
      setStatus('cancelled');
    } else {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      setStatus('error');
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  });

  const startListening = useCallback(async () => {
    try {
      // Request permissions
      const permissionResult = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permissionResult.granted) {
        setError('Microphone permission denied');
        setStatus('error');
        return;
      }

      // Reset state
      setTranscript('');
      setError(null);
      setStatus('listening');

      // Start recognition
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
      });

      // Auto-stop after max duration
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, MAX_RECORDING_MS);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition');
      setStatus('error');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setTranscript('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (err) {
        // Ignore cleanup errors
      }
    };
  }, []);

  return {
    status,
    transcript,
    error,
    isListening: status === 'listening',
    startListening,
    stopListening,
    reset,
  };
}
