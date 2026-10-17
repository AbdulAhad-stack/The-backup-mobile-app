import React from 'react';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { ScrollAnimContext } from '../../context/ScrollAnimContext';
import { themeStyle, useScheme } from '../../theme';

// Drop-in replacement for <ScrollView> — tracks scroll position in a shared
// value and exposes it via context, so any <Reveal> underneath knows exactly
// when it crosses into view and can animate in every time (scrolling either
// direction), not just once when the screen first mounts.
export default function AnimatedScreen({ children, contentContainerStyle, style, refreshControl, ...rest }) {
  useScheme();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <ScrollAnimContext.Provider value={scrollY}>
      <Animated.ScrollView
        style={themeStyle(style)}
        contentContainerStyle={themeStyle(contentContainerStyle)}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={rest.showsVerticalScrollIndicator ?? true}
        {...rest}
      >
        {children}
      </Animated.ScrollView>
    </ScrollAnimContext.Provider>
  );
}
