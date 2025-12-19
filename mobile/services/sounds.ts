import { Audio } from 'expo-av';

let pressSound: Audio.Sound | null = null;
let loadingSound: Audio.Sound | null = null;
let finishedSound: Audio.Sound | null = null;

export async function loadSounds(): Promise<void> {
  try {
    // Configure audio mode for playback
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const [press, loading, finished] = await Promise.all([
      Audio.Sound.createAsync(require('../assets/sounds/press.mp3')),
      Audio.Sound.createAsync(require('../assets/sounds/loading.mp3')),
      Audio.Sound.createAsync(require('../assets/sounds/finished.wav')),
    ]);

    pressSound = press.sound;
    loadingSound = loading.sound;
    finishedSound = finished.sound;
  } catch (error) {
    console.error('Error loading sounds:', error);
  }
}

export async function playPressSound(): Promise<void> {
  try {
    if (pressSound) {
      await pressSound.replayAsync();
    }
  } catch (error) {
    console.error('Error playing press sound:', error);
  }
}

export async function playLoadingSound(): Promise<void> {
  try {
    if (loadingSound) {
      await loadingSound.replayAsync();
    }
  } catch (error) {
    console.error('Error playing loading sound:', error);
  }
}

export async function playFinishedSound(): Promise<void> {
  try {
    if (finishedSound) {
      await finishedSound.replayAsync();
    }
  } catch (error) {
    console.error('Error playing finished sound:', error);
  }
}

export async function stopLoadingSound(): Promise<void> {
  try {
    if (loadingSound) {
      await loadingSound.stopAsync();
    }
  } catch (error) {
    console.error('Error stopping loading sound:', error);
  }
}

export async function unloadSounds(): Promise<void> {
  try {
    await Promise.all([
      pressSound?.unloadAsync(),
      loadingSound?.unloadAsync(),
      finishedSound?.unloadAsync(),
    ]);
    pressSound = null;
    loadingSound = null;
    finishedSound = null;
  } catch (error) {
    console.error('Error unloading sounds:', error);
  }
}
