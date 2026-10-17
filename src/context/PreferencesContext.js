import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLiveUpdatesEnabled } from '../hooks/useLiveNotifications';

// Device-level preferences (theme, language, notification choices). Stored
// separately from the auth keys so signing out does not reset them.
const STORAGE_KEY = 'prefs:v1';

export const DEFAULT_PREFS = {
  language: 'en',
  liveUpdates: true,
  notify: {},
};

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
      } catch {
        // corrupted value -> fall back to defaults
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => { setLiveUpdatesEnabled(prefs.liveUpdates !== false); }, [prefs.liveUpdates]);

  const update = useCallback((patch) => {
    setPrefs((prev) => {
      const next = { ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    ready,
    prefs,
    setLanguage: (language) => update({ language }),
    setLiveUpdates: (liveUpdates) => update({ liveUpdates }),
    setNotify: (key, on) => update((p) => ({ notify: { ...p.notify, [key]: on } })),
    resetPrefs: () => update({ ...DEFAULT_PREFS, notify: {} }),
  }), [ready, prefs, update]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePrefs must be used within PreferencesProvider');
  return ctx;
}
