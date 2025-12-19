import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageCard } from '../components/ImageCard';
import { useImageArchive } from '../hooks/useImageArchive';

export default function ArchiveScreen() {
  const { images, loading, removeImage, refreshImages } = useImageArchive();
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshImages();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2d2d2d" />
          <Text style={styles.loadingText}>Loading stickers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (images.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No Stickers Yet!</Text>
          <Text style={styles.emptyText}>
            Press and hold the button on the home screen{'\n'}, imagine a sticker, and speak it out loud!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 16 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2d2d2d"
          />
        }
      >
        <Text style={styles.subtitle}>
          Stickers from the last 7 days ({images.length})
        </Text>
        <View style={styles.grid}>
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onDelete={removeImage}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFB3D9',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2d2d2d',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d2d2d',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#2d2d2d',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subtitle: {
    fontSize: 14,
    color: '#2d2d2d',
    marginBottom: 16,
    textAlign: 'center',
  },
});
