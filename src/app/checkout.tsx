// src/app/checkout.tsx
import { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

export default function CheckoutScreen() {
  const { items, totalPrice, clearCart } = useCart();
  const { token } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!token) {
      Alert.alert('Please log in', 'You need to log in before placing an order.');
      router.push('/account');
      return;
    }
    if (!name || !phone || !address) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ customer_name: name, phone, address }),
      });

      if (!res.ok) {
        const errText = await res.text();
        Alert.alert('Order failed', errText || 'Please try again.');
        return;
      }

      await clearCart();
      Alert.alert('Success', 'Order placed successfully!');
      router.push('/orders');
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>Checkout</ThemedText>

          <ThemedView type="backgroundElement" style={styles.summaryBox}>
            <ThemedText type="defaultSemiBold">Order Summary</ThemedText>
            {items.map((item) => {
              const price = item.product.discount_price ?? item.product.price;
              return (
                <ThemedView key={item.productId} style={styles.summaryRow}>
                  <ThemedText type="small">{item.product.name} × {item.quantity}</ThemedText>
                  <ThemedText type="small">${price * item.quantity}</ThemedText>
                </ThemedView>
              );
            })}
            <ThemedView style={[styles.summaryRow, styles.totalRow]}>
              <ThemedText type="defaultSemiBold">Total</ThemedText>
              <ThemedText type="defaultSemiBold">${totalPrice}</ThemedText>
            </ThemedView>
          </ThemedView>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Delivery Address"
            multiline
            numberOfLines={3}
            value={address}
            onChangeText={setAddress}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handlePlaceOrder}
            disabled={submitting}
          >
            <ThemedText style={styles.submitText}>
              {submitting ? 'Placing Order...' : 'Place Order'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' },
  scrollContent: { paddingHorizontal: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.four },
  title: { textAlign: 'center', marginTop: Spacing.three },
  summaryBox: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: Spacing.two, marginTop: Spacing.one },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    fontSize: 16,
  },
  addressInput: { height: 80, textAlignVertical: 'top' },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitText: { color: '#fff', fontWeight: '600' },
});