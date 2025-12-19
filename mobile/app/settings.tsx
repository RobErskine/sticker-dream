import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getApiKey, saveApiKey, deleteApiKey } from '../services/storage';
import { validateApiKey } from '../services/imageGeneration';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isApiKeyExpanded, setIsApiKeyExpanded] = useState(false);

  useEffect(() => {
    loadExistingKey();
  }, []);

  const loadExistingKey = async () => {
    try {
      const existingKey = await getApiKey();
      if (existingKey) {
        // Mask the key for display
        setApiKey(existingKey);
        setHasExistingKey(true);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    setIsSaving(true);

    try {
      // Validate the key first (button shows loading spinner, no need for alert)
      const isValid = await validateApiKey(apiKey.trim());

      if (!isValid) {
        Alert.alert(
          'Invalid API Key',
          'The API key appears to be invalid. Please check it and try again.',
        );
        setIsSaving(false);
        return;
      }

      // Save the key
      await saveApiKey(apiKey.trim());
      setHasExistingKey(true);
      setIsApiKeyExpanded(false);

      Alert.alert(
        'Success!',
        'Your API key has been saved. You can now create stickers!',
        [{ text: 'Continue', onPress: () => router.back() }],
      );
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '❌ Delete API Key',
      'Are you sure you want to remove your API key?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteApiKey();
            setApiKey('');
            setHasExistingKey(false);
            setIsApiKeyExpanded(false);
            Alert.alert('Deleted', 'Your API key has been removed.');
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2d2d2d" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            {hasExistingKey ? (
              <>
                {/* Collapsed state - show status and expand button */}
                <Pressable
                  style={styles.accordionHeader}
                  onPress={() => setIsApiKeyExpanded(!isApiKeyExpanded)}
                >
                  <View>
                    <Text style={styles.sectionTitle}>Gemini API Key</Text>
                    <Text style={styles.statusText}>✓ API key configured</Text>
                  </View>
                  <Text style={styles.accordionArrow}>
                    {isApiKeyExpanded ? '▲' : '▼'}
                  </Text>
                </Pressable>

                {/* Expanded content */}
                {isApiKeyExpanded && (
                  <View style={styles.accordionContent}>
                    <Text style={styles.sectionDescription}>
                      Your API key is saved. You can update or remove it below.
                    </Text>

                    <TextInput
                      style={styles.input}
                      value={apiKey}
                      onChangeText={setApiKey}
                      placeholder="Enter your API key"
                      placeholderTextColor="#999"
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={true}
                    />

                    <Pressable
                      style={[styles.button, isSaving && styles.buttonDisabled]}
                      onPress={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Update API Key</Text>
                      )}
                    </Pressable>

                    <Pressable style={styles.deleteButton} onPress={handleDelete}>
                      <Text style={styles.deleteButtonText}>Remove API Key</Text>
                    </Pressable>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* No key - show full form */}
                <Text style={styles.sectionTitle}>Gemini API Key</Text>
                <Text style={styles.sectionDescription}>
                  Enter your Google Gemini API key to generate stickers.
                  You can get one at{' '}
                  <Text style={styles.link}>ai.google.dev</Text>
                </Text>

                <TextInput
                  style={styles.input}
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="Enter your API key"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Pressable
                  style={[styles.button, isSaving && styles.buttonDisabled]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Save API Key</Text>
                  )}
                </Pressable>
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              Picture Wizard turns your voice into coloring sticker pages!
              Press and hold the button, tell Sticker Lizard what you want to draw,
              and watch as he creates a unique sticker just for you.
            </Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFB3D9',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2d2d2d',
    padding: 20,
    marginBottom: 20,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionArrow: {
    fontSize: 16,
    color: '#666',
  },
  accordionContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d2d2d',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  link: {
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#2d2d2d',
  },
  button: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  version: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
