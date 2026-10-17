import React from 'react';
import {
  View as RNView, TouchableOpacity as RNTouchableOpacity, Pressable as RNPressable,
  ScrollView as RNScrollView, ActivityIndicator as RNActivityIndicator, RefreshControl as RNRefreshControl,
} from 'react-native';
import {
  Feather as RNFeather, MaterialCommunityIcons as RNMaterialCommunityIcons, Ionicons as RNIonicons,
} from '@expo/vector-icons';
import { Text, TextInput } from './AppText';
import { C, themeStyle, mapColor, isDark, useScheme, DARK } from '../theme';

// Drop-in replacements for the core RN primitives. In light mode they pass
// props straight through; in dark mode inline colours are mapped to the dark
// palette (see theme.js), so every screen re-themes without being rewritten.
// Each one subscribes to scheme changes, so flipping Light / Dark / System
// updates everything on screen immediately — no restart, no navigation needed.

const mapStyleProp = (style) => (typeof style === 'function' ? (s) => themeStyle(style(s)) : themeStyle(style));

function wrap(Comp, name) {
  const W = React.forwardRef(({ style, contentContainerStyle, ...rest }, ref) => {
    useScheme();
    const extra = {};
    if (contentContainerStyle !== undefined) extra.contentContainerStyle = themeStyle(contentContainerStyle);
    return <Comp ref={ref} {...rest} {...extra} style={mapStyleProp(style)} />;
  });
  W.displayName = `Themed(${name})`;
  return W;
}

export const View = wrap(RNView, 'View');
export const TouchableOpacity = wrap(RNTouchableOpacity, 'TouchableOpacity');
export const Pressable = wrap(RNPressable, 'Pressable');
export const ScrollView = wrap(RNScrollView, 'ScrollView');

// Text and TextInput live in AppText (they also handle the heading font).
export { Text, TextInput };

export const ActivityIndicator = React.forwardRef(({ color, ...rest }, ref) => {
  useScheme();
  return <RNActivityIndicator ref={ref} {...rest} color={mapColor(color ?? C.blue, 'color')} />;
});
ActivityIndicator.displayName = 'Themed(ActivityIndicator)';

// Pull-to-refresh spinner: tintColor on iOS, colors on Android (plus a surface-coloured disc in dark).
export const RefreshControl = ({ tintColor, colors, progressBackgroundColor, ...rest }) => {
  useScheme();
  const tint = mapColor(tintColor ?? C.blue, 'color');
  return (
    <RNRefreshControl
      {...rest}
      tintColor={tint}
      colors={colors ? colors.map((c) => mapColor(c, 'color')) : [tint]}
      progressBackgroundColor={progressBackgroundColor ?? (isDark() ? DARK.surface2 : undefined)}
    />
  );
};

const icon = (Comp, name) => {
  const I = React.forwardRef(({ color, ...rest }, ref) => {
    useScheme();
    return <Comp ref={ref} {...rest} color={mapColor(color ?? '#000000', 'color')} />;
  });
  I.displayName = `Themed(${name})`;
  return I;
};

export const Feather = icon(RNFeather, 'Feather');
export const MaterialCommunityIcons = icon(RNMaterialCommunityIcons, 'MaterialCommunityIcons');
export const Ionicons = icon(RNIonicons, 'Ionicons');
