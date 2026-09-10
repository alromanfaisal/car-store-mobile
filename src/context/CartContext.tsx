// src/context/CartContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAllProducts, Product, API_URL } from '@/lib/api';
import { useAuth } from './AuthContext';

export type CartItem = {
  cartItemId: number | null;
  productId: number;
  quantity: number;
  product: Product;
};

type RawCartItem = {
  id: number;
  product_id: number;
  quantity: number;
};

type GuestCartItem = {
  productId: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  increaseQty: (productId: number) => Promise<void>;
  decreaseQty: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'my-store-guest-cart';

async function loadGuestCart(): Promise<GuestCartItem[]> {
  try {
    const raw = await AsyncStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveGuestCart(items: GuestCartItem[]) {
  await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const previousToken = useRef<string | null>(null);
  const productsCache = useRef<Product[]>([]);

  const getProductsCache = async (): Promise<Product[]> => {
    if (productsCache.current.length === 0) {
      productsCache.current = await getAllProducts();
    }
    return productsCache.current;
  };

  const authHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const toDisplayItems = async (
    raw: { productId: number; quantity: number; cartItemId: number | null }[]
  ): Promise<CartItem[]> => {
    const products = await getProductsCache();
    return raw
      .map((r) => {
        const product = products.find((p) => p.id === r.productId);
        if (!product) return null;
        return { cartItemId: r.cartItemId, productId: r.productId, quantity: r.quantity, product };
      })
      .filter((item): item is CartItem => item !== null);
  };

  const fetchServerCart = async () => {
    const res = await fetch(`${API_URL}/api/cart`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch cart');
    const raw: RawCartItem[] = await res.json();
    const displayItems = await toDisplayItems(
      raw.map((r) => ({ productId: r.product_id, quantity: r.quantity, cartItemId: r.id }))
    );
    setItems(displayItems);
  };

  const loadFromGuestStorage = async () => {
    const guest = await loadGuestCart();
    const displayItems = await toDisplayItems(
      guest.map((g) => ({ productId: g.productId, quantity: g.quantity, cartItemId: null }))
    );
    setItems(displayItems);
  };

  useEffect(() => {
    if (authLoading) return;

    const run = async () => {
      setIsLoading(true);
      const justLoggedIn = !previousToken.current && token;

      if (token && justLoggedIn) {
        const guestItems = await loadGuestCart();
        for (const g of guestItems) {
          for (let i = 0; i < g.quantity; i++) {
            await fetch(`${API_URL}/api/cart`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ product_id: g.productId }),
            });
          }
        }
        await AsyncStorage.removeItem(GUEST_CART_KEY);
        await fetchServerCart();
      } else if (token) {
        await fetchServerCart();
      } else {
        await loadFromGuestStorage();
      }

      previousToken.current = token;
      setIsLoading(false);
    };

    run().catch((err) => {
      console.error('Cart load failed:', err);
      setIsLoading(false);
    });
  }, [token, authLoading]);

  const addItem = async (product: Product) => {
    if (token) {
      await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ product_id: product.id }),
      });
      await fetchServerCart();
    } else {
      const guest = await loadGuestCart();
      const existing = guest.find((g) => g.productId === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        guest.push({ productId: product.id, quantity: 1 });
      }
      await saveGuestCart(guest);
      await loadFromGuestStorage();
    }
  };

  const removeItem = async (productId: number) => {
    if (token) {
      const item = items.find((i) => i.productId === productId);
      if (!item?.cartItemId) return;
      await fetch(`${API_URL}/api/cart/${item.cartItemId}`, { method: 'DELETE', headers: authHeaders() });
      await fetchServerCart();
    } else {
      const guest = (await loadGuestCart()).filter((g) => g.productId !== productId);
      await saveGuestCart(guest);
      await loadFromGuestStorage();
    }
  };

  const updateQty = async (productId: number, delta: number) => {
    if (token) {
      const item = items.find((i) => i.productId === productId);
      if (!item?.cartItemId) return;
      const newQty = item.quantity + delta;
      await fetch(`${API_URL}/api/cart/${item.cartItemId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ quantity: newQty }),
      });
      await fetchServerCart();
    } else {
      const guest = await loadGuestCart();
      const existing = guest.find((g) => g.productId === productId);
      if (!existing) return;
      existing.quantity += delta;
      const filtered = guest.filter((g) => g.quantity > 0);
      await saveGuestCart(filtered);
      await loadFromGuestStorage();
    }
  };

  const increaseQty = (productId: number) => updateQty(productId, 1);
  const decreaseQty = (productId: number) => updateQty(productId, -1);

  const clearCart = async () => {
    if (token) {
      await fetch(`${API_URL}/api/cart`, { method: 'DELETE', headers: authHeaders() });
      setItems([]);
    } else {
      await AsyncStorage.removeItem(GUEST_CART_KEY);
      setItems([]);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.product.discount_price ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, isLoading, addItem, removeItem, increaseQty, decreaseQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}