// src/app/collection.tsx
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProductCard } from '@/components/product-card';
import { Spacing, BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { getAllProducts, Product } from '@/lib/api';

export default function CollectionScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          All Collections
        </ThemedText>

        {loading && <ThemedText type="small">Loading cars...</ThemedText>}
        {error ? <ThemedText type="small">Error: {error}</ThemedText> : null}

        <FlatList
          style={styles.list}
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ProductCard item={item} />}
        />
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
});