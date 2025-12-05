import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface DreamButtonProps {
  status: 'idle' | 'listening' | 'processing' | 'success' | 'error' | 'cancelled';
  onPressIn: () => void;
  onPressOut: () => void;
  disabled?: boolean;
}

const STATUS_CONFIG = {
  idle: {
    text: 'Picture Wizard',
    backgroundColor: '#b4e7ce', // pastel green
  },
  listening: {
    text: 'Listening...',
    backgroundColor: '#ffb3d9', // pastel pink
  },
  processing: {
    text: 'Creating...',
    backgroundColor: '#c2e7ff', // pastel blue
  },
  success: {
    text: 'Printed!',
    backgroundColor: '#b4e7ce', // pastel green
  },
  error: {
    text: 'Try Again',
    backgroundColor: '#ffb3b3', // pastel red
  },
  cancelled: {
    text: 'Cancelled',
    backgroundColor: '#fff5b8', // pastel yellow
  },
};

export function DreamButton({
  status,
  onPressIn,
  onPressOut,
  disabled = false,
}: DreamButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const config = STATUS_CONFIG[status];

  const handlePressIn = () => {
    if (disabled) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Scale down animation
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    // Start pulse animation for listening state
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseRef.current.start();

    onPressIn();
  };

  const handlePressOut = () => {
    if (disabled) return;

    // Stop pulse
    if (pulseRef.current) {
      pulseRef.current.stop();
      pulseAnim.setValue(1);
    }

    // Scale back up
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    onPressOut();
  };

  const animatedStyle: Animated.WithAnimatedValue<ViewStyle> = {
    transform: [
      { scale: status === 'listening' ? Animated.multiply(scaleAnim, pulseAnim) : scaleAnim },
    ],
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          { backgroundColor: config.backgroundColor },
          disabled && styles.disabled,
        ]}
      >
        <Text style={styles.text}>{config.text}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 60,
    paddingVertical: 50,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#2d2d2d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d2d2d',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
