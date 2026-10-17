import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { themeStyle, useScheme } from '../../theme';

/**
 * Wraps a card/tile so it fades + slides (or scales) into place once, when it
 * first mounts — a standard one-time entrance animation. Previously this
 * re-animated on every scroll pass (opacity tied to on-screen position),
 * which reads as flickery/unpolished rather than a clean first-appearance.
 */
export default function Reveal({ children, style, variant = 'up', distance = 18, delay = 0 }) {
  useScheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    const anim = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
    progress.value = delay > 0 ? withDelay(delay, anim) : anim;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => {
    if (variant === 'scale') {
      return { opacity: progress.value, transform: [{ scale: 0.94 + progress.value * 0.06 }] };
    }
    return { opacity: progress.value, transform: [{ translateY: (1 - progress.value) * distance }] };
  });

  return (
    <Animated.View style={[themeStyle(style), animStyle]}>
      {children}
    </Animated.View>
  );
}
