import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { themeStyle, useScheme } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Every tap across the app gets the same subtle "press in" feedback —
// applied once here and reused by buttons, chips, cards, and the FAB.
export default function AnimatedTouchable({ children, style, onPress, disabled, scaleTo = 0.96, ...rest }) {
  useScheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => { scale.value = withTiming(scaleTo, { duration: 90 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 140 }); }}
      style={[themeStyle(style), animStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
