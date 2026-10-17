import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// EXPO_PUBLIC_API_URL is the recommended override (set in mobile/.env) — required
// when testing on a physical device or Android emulator, since "localhost" there
// resolves to the device itself, not this computer. Android emulators reach the
// host machine at 10.0.2.2; a real phone on the same Wi-Fi needs the host's LAN IP.
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let _forceLogout = null;
export const setAuthInterceptor = (forceLogoutFn) => {
  _forceLogout = forceLogoutFn;
};

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['authToken', 'authUserId', 'authRole']);
      if (_forceLogout) _forceLogout();
    }
    return Promise.reject(error);
  }
);

export default api;
