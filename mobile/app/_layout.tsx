import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { loadSounds, unloadSounds } from '../services/sounds';
import { cleanupOldImages } from '../services/storage';

export default function RootLayout() {
  useEffect(() => {
    // Load sounds on app start
    loadSounds();

    // Cleanup old images on app start
    cleanupOldImages();

    return () => {
      unloadSounds();
    };
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFB3D9',
          },
          headerTintColor: '#2d2d2d',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#FFB3D9',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Picture Wizard',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="archive"
          options={{
            title: 'My Stickers',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  );
}
