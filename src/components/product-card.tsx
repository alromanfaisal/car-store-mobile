// src/components/product-card.tsx
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';

const BASE_IMAGE_URL = 'https://ecommerce-app-alroman.vercel.app';

export function ProductCard({ item }: { item: Product }) {
  const { addItem } = useCart();
  const price = item.discount_price ?? item.price;
  const hasDiscount = typeof item.discount_price === 'number';

  const handleAddToCart = async () => {
    await addItem(item);
    Alert.alert('Added', `${item.name} added to cart`);
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Image
        source={{ uri: `${BASE_IMAGE_URL}${item.image_url}` }}
        style={styles.image}
        contentFit="cover"
      />
      <ThemedView style={styles.cardInfo}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText type="small">{item.description}</ThemedText>
        <ThemedView style={styles.priceRow}>
          <ThemedText type="defaultSemiBold">${price}</ThemedText>
          {hasDiscount && (
            <ThemedText type="small" style={styles.strikethrough}>
              ${item.price}
            </ThemedText>
          )}
          {item.is_new && (
            <ThemedView style={styles.badge}>
              <ThemedText type="small" style={styles.badgeText}>NEW</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <ThemedText type="small" style={styles.addButtonText}>Add to Cart</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.two,
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  image: {
    width: 90,
    height: 70,
    borderRadius: Spacing.two,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  badge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    color: '#fff',
  },
});