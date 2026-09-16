// src/app/product/[id].tsx
import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, router, Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { getProductById, Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';

const BASE_IMAGE_URL = 'https://ecommerce-app-alroman.vercel.app';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addItem(product);
    Alert.alert('Added', `${product.name} added to cart`);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addItem(product);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Loading...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Car not found.</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const price = product.discount_price ?? product.price;
  const hasDiscount = typeof product.discount_price === 'number';

  return (
    <ThemedView style={styles.container}>
      {/* উপরের header এ ট্যাবের বদলে product name দেখানো + back বাটন */}
      <Stack.Screen options={{ title: product.name, headerBackTitle: 'Back' }} />

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image
            source={{ uri: `${BASE_IMAGE_URL}${product.image_url}` }}
            style={styles.heroImage}
            contentFit="cover"
          />

          <ThemedView style={styles.infoSection}>
            <ThemedText type="title">{product.name}</ThemedText>
            <ThemedText type="small">{product.description}</ThemedText>

            <ThemedView style={styles.priceRow}>
              <ThemedText type="title">${price}</ThemedText>
              {hasDiscount && (
                <ThemedText type="small" style={styles.strikethrough}>
                  ${product.price}
                </ThemedText>
              )}
              {product.is_new && (
                <ThemedView style={styles.badge}>
                  <ThemedText type="small" style={styles.badgeText}>NEW</ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.buttonRow}>
            <TouchableOpacity style={styles.outlineButton} onPress={handleAddToCart}>
              <ThemedText style={styles.outlineButtonText}>Add to Cart</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.solidButton} onPress={handleBuyNow}>
              <ThemedText style={styles.solidButtonText}>Buy Now</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' },
  scrollContent: { paddingBottom: Spacing.four },
  heroImage: { width: '100%', height: 240 },
  infoSection: { padding: Spacing.four, gap: Spacing.two },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.6 },
  badge: { backgroundColor: '#16a34a', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#fff' },
  buttonRow: { flexDirection: 'row', gap: Spacing.three, paddingHorizontal: Spacing.four, marginTop: Spacing.three },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: 'center',
  },
  outlineButtonText: { color: '#2563eb', fontWeight: '600' },
  solidButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: 'center',
  },
  solidButtonText: { color: '#fff', fontWeight: '600' },
});