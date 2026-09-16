// src/app/account.tsx
import { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

export default function AccountScreen() {
  const { user, token, login, logout, isLoading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errText = await res.text();
        Alert.alert('Login failed', errText || 'Please try again.');
        return;
      }
      const data = await res.json();
      await login(data.token, data.user);
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const errText = await res.text();
        Alert.alert('Signup failed', errText || 'Please try again.');
        return;
      }
      Alert.alert('Success', 'Account created! Please log in.');
      setIsSignup(false);
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Loading...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // লগইন করা থাকলে — Account info দেখানো
  if (token && user) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="title">My Account</ThemedText>
          <ThemedView type="backgroundElement" style={styles.infoBox}>
            <ThemedText type="defaultSemiBold">{user.name}</ThemedText>
            <ThemedText type="small">{user.email}</ThemedText>
          </ThemedView>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // লগইন করা না থাকলে — Login/Signup ফর্ম
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          {isSignup ? 'Create Account' : 'Login'}
        </ThemedText>

        {isSignup && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={isSignup ? handleSignup : handleLogin}
          disabled={submitting}
        >
          <ThemedText style={styles.submitText}>
            {submitting ? 'Please wait...' : isSignup ? 'Sign Up' : 'Sign In'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignup((prev) => !prev)}>
          <ThemedText type="small" style={styles.toggleText}>
            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, gap: Spacing.three, justifyContent: 'center' },
  title: { textAlign: 'center', marginBottom: Spacing.three },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitText: { color: '#fff', fontWeight: '600' },
  toggleText: { textAlign: 'center', marginTop: Spacing.two },
  infoBox: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: 'center',
  },
  logoutText: { color: '#dc2626', fontWeight: '600' },
});