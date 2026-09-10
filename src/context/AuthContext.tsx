// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'my-store-token';
const USER_KEY = 'my-store-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedUser = await AsyncStorage.getItem(USER_KEY);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Failed to load auth session:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}