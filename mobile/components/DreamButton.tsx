import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface DreamButtonProps {
  status: 'idle' | 'listening' | 'processing' | 'success' | 'error' | 'cancelled';
  onPressIn: () => void;
  onPressOut: () => void;
  disabled?: boolean;
}

const BUTTON_HEIGHT = 12; // The 3D depth of the button

const STATUS_CONFIG = {
  idle: {
    text: '🦎\nPress, speak, then release!',
    topColor: '#b4e7ce', // pastel green
    bottomColor: '#7bc9a3', // darker green for 3D base
  },
  listening: {
    text: '🎧\nListening...',
    topColor: '#ffb3d9', // pastel pink
    bottomColor: '#e091b8', // darker pink
  },
  processing: {
    text: '🧑‍🎨\nCreating...',
    topColor: '#c2e7ff', // pastel blue
    bottomColor: '#94c7e8', // darker blue
  },
  success: {
    text: '✨\nDone!',
    topColor: '#b4e7ce', // pastel green
    bottomColor: '#7bc9a3',
  },
  error: {
    text: '🔄\nTry Again',
    topColor: '#ffb3b3', // pastel red
    bottomColor: '#e09090',
  },
  cancelled: {
    text: '❌\nCancelled',
    topColor: '#fff5b8', // pastel yellow
    bottomColor: '#e0d890',
  },
};

export function DreamButton({
  status,
  onPressIn,
  onPressOut,
  disabled = false,
}: DreamButtonProps) {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const config = STATUS_CONFIG[status];

  const handlePressIn = () => {
    if (disabled) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Press down animation
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();

    onPressIn();
  };

  const handlePressOut = () => {
    if (disabled) return;

    // Release animation
    Animated.spring(pressAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();

    onPressOut();
  };

  // Animate the button pressing down
  const translateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BUTTON_HEIGHT - 2],
  });

  // Animate shadow opacity when pressed (fades out)
  const shadowOpacity = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.1],
  });

  // Animate shadow shrinking when pressed (105% -> 102%)
  const shadowScaleX = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.97], // 102/105 ≈ 0.97
  });

  // Animate shadow shrinking vertically when pressed
  const shadowScaleY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.97],
  });

  // Animate the base shrinking using scaleY (height not supported by native driver)
  const baseScaleY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });

  return (
    <View style={styles.container}>
      {/* Shadow layer */}
      <Animated.View
        style={[
          styles.shadow,
          {
            opacity: shadowOpacity,
            transform: [{ scaleX: shadowScaleX }, { scaleY: shadowScaleY }],
          },
        ]}
      />

      {/* 3D Base (bottom part that shows depth) */}
      <Animated.View
        style={[
          styles.buttonBase,
          {
            backgroundColor: config.bottomColor,
            transform: [{ scaleY: baseScaleY }],
          },
        ]}
      />

      {/* Top button surface */}
      <Animated.View
        style={[
          styles.buttonTop,
          {
            backgroundColor: config.topColor,
            transform: [{ translateY }],
          },
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            styles.pressable,
            disabled && styles.disabled,
          ]}
        >
          <Text style={styles.text}>{config.text}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    minWidth: '100%',
    height: 180,
  },
  shadow: {
    position: 'absolute',
    bottom: -20,
    left: '-2.5%',
    right: 10,
    height: '100%',
    width: '105%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  buttonBase: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 160,
    borderRadius: 24,
    borderWidth: 0,
    borderColor: '#222',
    borderTopWidth: 0,
    transformOrigin: 'bottom',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderLeftWidth: 2
  },
  buttonTop: {
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#222',
    overflow: 'hidden',
    width: '100%',
  },
  pressable: {
    paddingHorizontal: 50,
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d2d2d',
    textAlign: 'center',
    lineHeight: 36,
  },
  disabled: {
    opacity: 0.6,
  },
});
