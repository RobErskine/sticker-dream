import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';

interface AnimatedIconBackgroundProps {
  // Pattern configuration
  icon?: string;              // The icon/character to display
  iconSize?: number;          // Size of each icon
  gridSpacing?: number;       // Space between icons
  iconColor?: string;         // Icon color
  iconOpacity?: number;       // Icon opacity (0-1)

  // Animation configuration
  speed?: number;             // Animation duration in ms (lower = faster)

  // Background
  backgroundColor?: string;
}

export function AnimatedIconBackground({
  icon = '★',
  iconSize = 16,
  gridSpacing = 50,
  iconColor = '#2d2d2d',
  iconOpacity = 0.1,
  speed = 4000,
  backgroundColor = '#FFB3D9',
}: AnimatedIconBackgroundProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Calculate grid dimensions
  const cols = Math.ceil(screenWidth / gridSpacing) + 3;
  const rows = Math.ceil(screenHeight / gridSpacing) + 3;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: speed,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [speed, animatedValue]);

  // Animate diagonally from top-left to bottom-right
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -gridSpacing],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -gridSpacing],
  });

  // Generate icon grid
  const icons = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Offset every other row
      const offsetX = row % 2 === 0 ? 0 : gridSpacing / 2;
      icons.push(
        <Text
          key={`${row}-${col}`}
          style={[
            styles.icon,
            {
              fontSize: iconSize,
              color: iconColor,
              opacity: iconOpacity,
              left: col * gridSpacing + offsetX - gridSpacing,
              top: row * gridSpacing - gridSpacing,
            },
          ]}
        >
          {icon}
        </Text>
      );
    }
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.patternContainer,
          {
            transform: [{ translateX }, { translateY }],
          },
        ]}
      >
        {icons}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  icon: {
    position: 'absolute',
  },
});
