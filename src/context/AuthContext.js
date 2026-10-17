import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { setAuthInterceptor } from '../api/client';
import { AppearanceProvider } from './AppearanceContext';

const AuthContext = createContext(null);

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Heading font. Loading it here keeps the splash up until it is ready.
  const [fontsLoaded, fontError] = useFonts({
    Poppins_600SemiBold: require('../assets/fonts/Poppins_600SemiBold.ttf'),
    Poppins_700Bold: require('../assets/fonts/Poppins_700Bold.ttf'),
  });

  useEffect(() => {
    (async () => {
      const [token, user_id, role] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('authUserId'),
        AsyncStorage.getItem('authRole'),
      ]);
      if (token && user_id && role) {
        if (isTokenExpired(token)) {
          await AsyncStorage.multiRemove(['authToken', 'authUserId', 'authRole']);
        } else {
          setCurrentUser({ token, user_id, role });
        }
      }
      setLoading(false);
    })();
  }, []);

  const forceLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    setAuthInterceptor(forceLogout);
  }, [forceLogout]);

  const login = useCallback(async (userData) => {
    setCurrentUser(userData);
    await AsyncStorage.multiSet([
      ['authToken', userData.token],
      ['authUserId', userData.user_id],
      ['authRole', userData.role],
    ]);
  }, []);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    await AsyncStorage.multiRemove(['authToken', 'authUserId', 'authRole']);
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout, forceLogout, loading: loading || (!fontsLoaded && !fontError), isAuthenticated: !!currentUser }}
    >
      <AppearanceProvider>{children}</AppearanceProvider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
