import React from 'react';
import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { themeStyle, mapColor, isDark, useScheme, DARK } from '../theme';

// Poppins (Google Fonts) for headings. Everything else keeps the app's original fonts.
export const FONT = { heading: 'Poppins_600SemiBold', headingBold: 'Poppins_700Bold' };

const isBold = (w) => w === 'bold' || Number(w) >= 700;

// Theme-aware: in dark mode inline colours are remapped and text that sets no
// colour of its own gets the dark-palette text colour (instead of black-on-dark).
export const Text = React.forwardRef(function Text({ style, ...rest }, ref) {
  useScheme();
  const themed = themeStyle(style);
  const base = isDark() ? [{ color: DARK.text }, themed] : themed;
  const flat = StyleSheet.flatten(base) || {};
  const size = flat.fontSize || 14;
  const heading = !flat.fontFamily && isBold(flat.fontWeight) && size >= 15;
  if (!heading) return <RNText ref={ref} {...rest} style={base} />;
  // The weight is baked into each font file, so fontWeight is reset to avoid a doubled-up bold.
  return (
    <RNText
      ref={ref}
      {...rest}
      style={[base, { fontFamily: size >= 20 ? FONT.headingBold : FONT.heading, fontWeight: 'normal' }]}
    />
  );
});

export const TextInput = React.forwardRef(function TextInput({ style, placeholderTextColor, ...rest }, ref) {
  useScheme();
  const base = themeStyle(style);
  return (
    <RNTextInput
      ref={ref}
      {...rest}
      style={isDark() ? [{ color: DARK.text }, base] : base}
      placeholderTextColor={mapColor(placeholderTextColor ?? '#94a3b8', 'color')}
      keyboardAppearance={isDark() ? 'dark' : 'light'}
    />
  );
});

export default Text;
