// src/app/cart.tsx
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useCart, CartItem } from '@/context/CartContext';

const BASE_IMAGE_URL = 'https://ecommerce-app-alroman.vercel.app';

function CartRow({ item }: { item: CartItem }) {
  const { increaseQty, decreaseQty, removeItem } = useCart();
  const price = item.product.discount_price ?? item.product.price;

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <Image
        source={{ uri: `${BASE_IMAGE_URL}${item.product.image_url}` }}
        style={styles.image}
        contentFit="cover"
      />
      <ThemedView style={styles.rowInfo}>
        <ThemedText type="defaultSemiBold">{item.product.name}</ThemedText>
        <ThemedText type="small">${price} × {item.quantity}</ThemedText>
        <ThemedView style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyButton} onPress={() => decreaseQty(item.productId)}>
            <ThemedText>−</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.qtyText}>{item.quantity}</ThemedText>
          <TouchableOpacity style={styles.qtyButton} onPress={() => increaseQty(item.productId)}>
            <ThemedText>+</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeItem(item.productId)}>
            <ThemedText type="small" style={styles.removeText}>Remove</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

export default function CartScreen() {
  const { items, totalPrice, isLoading } = useCart();

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Loading cart...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (items.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="title">Your cart is empty</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>Your Cart</ThemedText>

        <FlatList
          style={styles.list}
          data={items}
          keyExtractor={(item) => item.productId.toString()}
          renderItem={({ item }) => <CartRow item={item} />}
        />

        <ThemedView style={styles.totalRow}>
          <ThemedText type="defaultSemiBold">Total</ThemedText>
          <ThemedText type="defaultSemiBold">${totalPrice}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  title: { textAlign: 'center', marginTop: Spacing.three },
  list: { flex: 1 },
  row: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.two,
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  image: { width: 80, height: 60, borderRadius: Spacing.two },
  rowInfo: { flex: 1, gap: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyButton: {
    width: 26,
    height: 26,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { minWidth: 16, textAlign: 'center' },
  removeText: { color: '#dc2626' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});