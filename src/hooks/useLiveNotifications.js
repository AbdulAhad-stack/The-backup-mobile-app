import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../api/client';

let sharedSocket = null;
let liveEnabled = true;
let reconnectTimer = null;
const socketListeners = new Set();

const wsUrl = () => API_BASE_URL.replace(/^http/, 'ws').replace(/\/+$/, '');

async function ensureSocket() {
  if (!liveEnabled) return;
  if (sharedSocket && (sharedSocket.readyState === WebSocket.OPEN || sharedSocket.readyState === WebSocket.CONNECTING)) return;
  const token = await AsyncStorage.getItem('authToken');
  if (!token) return;

  const ws = new WebSocket(`${wsUrl()}/ws/notifications?token=${encodeURIComponent(token)}`);
  ws.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data);
      socketListeners.forEach((fn) => fn(data));
    } catch {
      // ignore malformed frame
    }
  };
  ws.onclose = () => {
    sharedSocket = null;
    if (socketListeners.size > 0 && !reconnectTimer) {
      reconnectTimer = setTimeout(() => { reconnectTimer = null; ensureSocket(); }, 4000);
    }
  };
  ws.onerror = () => { try { ws.close(); } catch { /* ignore */ } };
  sharedSocket = ws;
}

// Settings > Notifications > "Real-time updates". When switched off the shared
// socket is closed and screens fall back to pull-to-refresh.
export function setLiveUpdatesEnabled(enabled) {
  liveEnabled = !!enabled;
  if (!liveEnabled) {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (sharedSocket) { try { sharedSocket.close(); } catch { /* ignore */ } sharedSocket = null; }
  } else if (socketListeners.size > 0) {
    ensureSocket();
  }
}

// Subscribes to every push notification for the component's lifetime — one
// shared socket backs every screen that calls this, mirroring the web app's
// dashboardChrome.js so both clients follow the same reconnect/broadcast rules.
export function useLiveNotifications(onNotification) {
  const cbRef = useRef(onNotification);
  cbRef.current = onNotification;
  useEffect(() => {
    const handler = (data) => cbRef.current(data);
    socketListeners.add(handler);
    ensureSocket();
    return () => {
      socketListeners.delete(handler);
      if (socketListeners.size === 0 && sharedSocket) {
        sharedSocket.close();
        sharedSocket = null;
      }
    };
  }, []);
}
