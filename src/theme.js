import { useEffect, useState } from 'react';

export const C = {
  // Brand: indigo / violet (from the purple reference)
  navy: '#2b2d6e',
  navyMid: '#4b4e96',
  royal: '#4a4fb5',
  blue: '#5b5fc7',
  blueDark: '#4548a8',
  blueSoft: '#ecefff',
  tabPill: '#dcdffa',
  skyTop: '#7271b3',
  skyBottom: '#5d60a7',
  sky: '#7c83e8',
  skyBg: '#f0f2ff',
  skyBorder: '#c9ccf0',

  // Surfaces and text
  bg: '#f4f5fd',
  white: '#ffffff',
  faint: '#eceefb',
  border: '#dcdff3',
  text: '#1d1f4a',
  textMuted: '#62668f',
  slate: '#62668f',
  muted: '#9a9dc2',

  // Status colors (kept distinct so meaning stays clear)
  green: '#16a34a',
  greenBg: '#f0fdf4',
  greenBorder: '#bbf7d0',
  amber: '#d97706',
  amberBg: '#fffbeb',
  amberBorder: '#fde68a',
  red: '#dc2626',
  redBg: '#fef2f2',
  redBorder: '#fecaca',

  // Secondary accents
  purple: '#6d4fd0',
  purpleBg: '#f1edfc',
  indigo: '#5b5fc7',
  indigoBg: '#ecefff',
  indigoBorder: '#c9ccf0',
};

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

export const SHADOW = {
  card: {
    shadowColor: '#2b2d6e',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};
// ---------------------------------------------------------------------------
// Theme engine
//
// Screens are written against the light palette above (C.*, hex literals).
// In dark mode every colour that is *read at render time* is passed through
// mapColor(), so existing screens re-theme without being rewritten:
//   - createStyles()  -> drop-in for StyleSheet.create (lazy colour getters)
//   - Themed.js       -> View/Text/TextInput/... wrappers map inline styles
// The mapping is idempotent (mapping an already-dark colour is a no-op).
// ---------------------------------------------------------------------------
let _scheme = 'light';
const _listeners = new Set();
// setScheme is safe to call while rendering (it only flips the module variable).
// AppearanceProvider calls notifyScheme() from an effect afterwards so every
// mounted themed component re-renders with the new palette.
export const setScheme = (s) => { _scheme = s === 'dark' ? 'dark' : 'light'; };
export const notifyScheme = () => { _listeners.forEach((fn) => fn(_scheme)); };
export const getScheme = () => _scheme;
export const isDark = () => _scheme === 'dark';

// Subscribes a component to scheme changes. Any component whose style is read
// lazily (createStyles / themeStyle) must call this, otherwise it keeps the old
// colours until something else happens to re-render it.
export function useScheme() {
  const [, force] = useState(_scheme);
  useEffect(() => {
    _listeners.add(force);
    force(_scheme);
    return () => { _listeners.delete(force); };
  }, []);
  return _scheme;
}

const hexToRgb = (hex) => {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 && h.length !== 8) return null;
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: h.length === 8 ? h.slice(6) : '' };
};

const rgbToHsl = ({ r, g, b }) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
};

const hslToHex = (h, s, l) => {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
};

// Dark palette (neutral surfaces + readable text).
export const DARK = {
  screen: '#101426',
  surface: '#1b2238',
  surface2: '#252c47',
  surface3: '#303750',
  input: '#151b30',
  header: '#242b57', // app bars: deep indigo so white titles keep strong contrast
  border: '#3b4360',
  text: '#f0f2ff',
  textMuted: '#b9c1da',
};

const NEUTRAL_BG = { '#f8fafc': DARK.screen, '#f9fafb': DARK.input, '#fafafa': DARK.input };
// The app's own light palette, mapped by hand so dark mode keeps a clear hierarchy:
// page < card < raised/filled areas, with brand-tinted surfaces for chips and callouts.
const EXACT_BG = {
  '#f4f5fd': DARK.screen,   // C.bg        page
  '#ffffff': DARK.surface,  // C.white     cards, sheets
  '#fff': DARK.surface,
  '#eceefb': DARK.surface2, // C.faint     filled / raised areas
  '#f6f7fe': DARK.input,    //             text inputs, idle chips
  '#ecefff': '#262b55',     // C.blueSoft  brand-tinted chips, icon tiles
  '#f0f2ff': '#1f2448',     // C.skyBg
  '#dcdffa': '#313769',     // C.tabPill
  '#f1edfc': '#2a2352',     // C.purpleBg
};
// Grey/slate shades that look tinted to an HSL calculation but are really neutrals.
const NEUTRAL_HEX = new Set([
  '#ffffff', '#fff', '#f8fafc', '#f9fafb', '#fafafa', '#f5f5f5', '#f3f4f6', '#f1f5f9', '#eef2f6',
  '#e5e7eb', '#e2e8f0', '#d1d5db', '#cbd5e1',
]);

function mapBg(rgb, hex) {
  const exact = EXACT_BG[hex.toLowerCase()];
  if (exact) return exact;
  const { h, s, l } = rgbToHsl(rgb);
  const neutral = NEUTRAL_HEX.has(hex.toLowerCase());
  if (!neutral && (l < 0.35 || (l <= 0.8 && s > 0.12))) return hex; // already dark / mid-tone (buttons, accents)
  if (neutral || s < 0.14) { // neutral light backgrounds
    const key = hex.toLowerCase();
    if (NEUTRAL_BG[key]) return NEUTRAL_BG[key];
    if (l > 0.965) return DARK.surface;
    if (l > 0.88) return DARK.surface2;
    if (l > 0.7) return DARK.surface3;
    return hex;
  }
  if (l <= 0.8) return hex;
  return hslToHex(h, Math.min(s, 0.55) * 0.85, 0.17); // pastel -> deep tint
}

function mapBorder(rgb, hex) {
  const { h, s, l } = rgbToHsl(rgb);
  if (l < 0.6) return hex;
  if (hex.toLowerCase() === '#c9ccf0') return '#3a4170'; // C.skyBorder / indigoBorder
  if (s < 0.14 || NEUTRAL_HEX.has(hex.toLowerCase())) return DARK.border;
  return hslToHex(h, Math.min(s, 0.5) * 0.7, 0.28);
}

function mapText(rgb, hex) {
  const { h, s, l } = rgbToHsl(rgb);
  if (l >= 0.62) return hex; // already readable on dark
  if (l < 0.2) return DARK.text; // near-black inks (#0f172a, #0f2540 ...)
  if (s < 0.2) return l < 0.34 ? DARK.text : DARK.textMuted; // neutral inks
  // Dark indigo/navy "ink" (C.text, C.navy): headings and body copy -> real light text,
  // not a dim periwinkle. Dark greens/reds/ambers (status text) keep their hue below.
  if (l < 0.33 && h >= 205 && h <= 280) return DARK.text;
  // Blues/violets look darker than greens/ambers at the same lightness, so lift them more.
  const bluish = h >= 205 && h <= 300;
  return hslToHex(h, Math.min(s, 0.85), bluish ? 0.76 : 0.7); // brand/status coloured text
}

const BG_PROP = /^backgroundColor$/;
const BORDER_PROP = /^border.*Color$/;
const TEXT_PROP = /^(color|tintColor|textDecorationColor)$/;
export const isColorProp = (p) => BG_PROP.test(p) || BORDER_PROP.test(p) || TEXT_PROP.test(p);

export function mapColor(value, prop = 'color') {
  if (_scheme !== 'dark' || typeof value !== 'string') return value;
  let v = value.trim();
  if (v === 'white') v = '#ffffff';
  if (v[0] !== '#') return value; // rgba()/named/transparent overlays are left alone
  const rgb = hexToRgb(v);
  if (!rgb || rgb.a) return value;
  if (BG_PROP.test(prop)) return mapBg(rgb, v);
  if (BORDER_PROP.test(prop)) return mapBorder(rgb, v);
  if (TEXT_PROP.test(prop)) return mapText(rgb, v);
  return value;
}

// Maps every colour in a (possibly nested / array) style value. Light mode: no-op.
// Arrays are mapped element-by-element (never flattened) so Reanimated's
// animated-style objects keep their identity.
export function themeStyle(style) {
  if (_scheme !== 'dark' || !style) return style;
  if (Array.isArray(style)) return style.map(themeStyle);
  if (typeof style !== 'object') return style;
  let out = style;
  for (const k of Object.keys(style)) {
    const v = style[k];
    if (typeof v === 'string' && isColorProp(k)) {
      const m = mapColor(v, k);
      if (m !== v) { if (out === style) out = { ...style }; out[k] = m; }
    }
  }
  return out;
}

// Drop-in for StyleSheet.create. Each style key resolves to a *different plain object*
// per scheme (light = the original definition, dark = a colour-mapped copy, built once
// and cached). The identity change matters: React Native skips the native update when a
// view is handed the very same style object twice, so lazily-changing getters inside one
// shared object would leave half the screen on the old theme.
export function createStyles(defs) {
  const out = {};
  for (const key of Object.keys(defs)) {
    const def = defs[key];
    const colourProps = Object.keys(def).filter((p) => typeof def[p] === 'string' && isColorProp(p));
    let dark = null;
    Object.defineProperty(out, key, {
      enumerable: true,
      configurable: true,
      get: () => {
        if (_scheme !== 'dark' || colourProps.length === 0) return def;
        if (!dark) {
          dark = { ...def };
          for (const p of colourProps) dark[p] = mapColor(def[p], p);
        }
        return dark;
      },
    });
  }
  return out;
}

// Semantic colours for new code (Settings etc.) — correct in both schemes.
export const themed = () => ({
  bg: mapColor(C.bg, 'backgroundColor'),
  card: mapColor(C.white, 'backgroundColor'),
  border: mapColor(C.border, 'borderColor'),
  text: mapColor(C.text, 'color'),
  muted: mapColor(C.textMuted, 'color'),
  faint: mapColor(C.faint, 'backgroundColor'),
  blue: mapColor(C.blue, 'color'),
});
