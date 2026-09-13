// src/app/orders.tsx
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

type OrderItem = {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
};

export default function OrdersScreen() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="title">Please log in to view orders</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Loading orders...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (orders.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="title">No orders yet</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>My Orders</ThemedText>
        {error ? <ThemedText type="small">{error}</ThemedText> : null}

        <FlatList
          data={orders}
          keyExtractor={(order) => order.id.toString()}
          renderItem={({ item: order }) => (
            <ThemedView type="backgroundElement" style={styles.orderCard}>
              <ThemedView style={styles.orderHeader}>
                <ThemedText type="defaultSemiBold">Order #{order.id}</ThemedText>
                <ThemedText type="small" style={styles.status}>{order.status}</ThemedText>
              </ThemedView>
              {order.items.map((item, idx) => (
                <ThemedText key={idx} type="small">
                  {item.product_name} × {item.quantity} — ${item.price * item.quantity}
                </ThemedText>
              ))}
              <ThemedText type="defaultSemiBold" style={styles.orderTotal}>
                Total: ${order.total_price}
              </ThemedText>
            </ThemedView>
          )}
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
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  title: { textAlign: 'center', marginTop: Spacing.three },
  orderCard: { padding: Spacing.three, borderRadius: Spacing.three, marginBottom: Spacing.two, gap: 4 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  status: { textTransform: 'capitalize', color: '#2563eb' },
  orderTotal: { marginTop: 6 },
});