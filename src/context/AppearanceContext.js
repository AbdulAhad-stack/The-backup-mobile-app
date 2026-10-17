import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { setScheme, notifyScheme } from '../theme';
import { PreferencesProvider } from './PreferencesContext';

const AppearanceContext = createContext(null);

const MODES = ['Light', 'Dark', 'System'];

const LIGHT_COLORS = {
  bg: '#f4f5fd', white: '#ffffff', faint: '#eceefb', border: '#dcdff3',
  text: '#1d1f4a', textMuted: '#62668f', slate: '#62668f', muted: '#9a9dc2',
  blueSoft: '#ecefff', navyMid: '#4b4e96', blue: '#5b5fc7', header: '#4b4e96',
};
const DARK_COLORS = {
  bg: '#101426', white: '#1b2238', faint: '#252c47', border: '#3b4360',
  text: '#f0f2ff', textMuted: '#b9c1da', slate: '#b9c1da', muted: '#9aa6c7',
  blueSoft: '#262b55', navyMid: '#8a91ee', blue: '#6c72de', header: '#242b57',
};

const readSystem = () => (Appearance.getColorScheme?.() === 'dark' ? 'dark' : 'light');

// Safe to mount more than once: if an ancestor already provides the theme (e.g. the app root),
// a nested AppearanceProvider just passes its children through instead of creating a second,
// competing theme state.
export function AppearanceProvider({ children }) {
  const parent = useContext(AppearanceContext);
  if (parent) return <>{children}</>;
  return <AppearanceRoot>{children}</AppearanceRoot>;
}

function AppearanceRoot({ children }) {
  // New installs follow the device (System). A saved choice always wins.
  const [appearance, setAppearance] = useState('System');
  const [loaded, setLoaded] = useState(false);
  const [system, setSystem] = useState(readSystem);

  useEffect(() => {
    AsyncStorage.getItem('pref:appearance')
      .then((v) => { if (MODES.includes(v)) setAppearance(v); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Follow the device live: OS toggle while the app is open, and re-read on coming back to the
  // foreground (iOS can miss the change event while the app is suspended).
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystem(colorScheme === 'dark' ? 'dark' : 'light'));
    const app = AppState.addEventListener('change', (st) => { if (st === 'active') setSystem(readSystem()); });
    return () => { sub?.remove?.(); app?.remove?.(); };
  }, []);

  const changeAppearance = useCallback((value) => {
    if (!MODES.includes(value)) return;
    setAppearance(value);
    AsyncStorage.setItem('pref:appearance', value).catch(console.warn);
  }, []);

  // Make native pieces (alerts, keyboards, system dialogs) match the in-app choice.
  // `null` hands control back to the device for System.
  useEffect(() => {
    if (typeof Appearance.setColorScheme !== 'function') return;
    try {
      Appearance.setColorScheme(appearance === 'System' ? null : appearance.toLowerCase());
      if (appearance === 'System') setSystem(readSystem());
    } catch { /* older RN: ignore */ }
  }, [appearance]);

  const dark = appearance === 'Dark' || (appearance === 'System' && system === 'dark');

  // Flip the theme engine *before* children render (so first paint is correct),
  // then tell already-mounted screens to re-render with the new palette.
  setScheme(dark ? 'dark' : 'light');
  useEffect(() => { notifyScheme(); }, [dark]);

  const colors = dark ? DARK_COLORS : LIGHT_COLORS;
  // Hand this to <NavigationContainer theme={navTheme}> so transitions, drawers and
  // any screen without its own background use the right colour instead of white.
  const navTheme = useMemo(() => ({
    ...(dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(dark ? DarkTheme : DefaultTheme).colors,
      primary: colors.blue, background: colors.bg, card: colors.white,
      text: colors.text, border: colors.border, notification: '#dc2626',
    },
  }), [dark, colors]);

  const value = useMemo(
    () => ({ appearance, changeAppearance, dark, system, colors, navTheme }),
    [appearance, changeAppearance, dark, system, colors, navTheme],
  );

  // Wait for the saved choice so a Dark user never sees a light first frame (and vice versa).
  if (!loaded) return null;
  return (
    <AppearanceContext.Provider value={value}>
      <PreferencesProvider>{children}</PreferencesProvider>
    </AppearanceContext.Provider>
  );
}
// Never returns null: outside a provider (should not happen, but a missing provider must not
// crash a screen) it falls back to the light theme.
const FALLBACK = {
  appearance: 'Light', changeAppearance: () => {}, dark: false, system: 'light',
  colors: LIGHT_COLORS, navTheme: DefaultTheme,
};
export const useAppearance = () => useContext(AppearanceContext) ?? FALLBACK;
