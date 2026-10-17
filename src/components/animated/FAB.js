import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import AnimatedTouchable from './AnimatedTouchable';
import { Feather } from '../Themed';
import { C, SPACE, themeStyle, useScheme } from '../../theme';

export default function FAB({ onPress, icon = 'plus', color = C.blue, style }) {
  useScheme();
  const pop = useSharedValue(0);
  useEffect(() => { pop.value = withSpring(1, { damping: 11, stiffness: 160 }); }, []);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <Animated.View style={[styles.wrap, themeStyle({ backgroundColor: color }), popStyle, themeStyle(style)]}>
      <AnimatedTouchable onPress={onPress} style={styles.touchable} scaleTo={0.88}>
        <Feather name={icon} size={22} color="#fff" />
      </AnimatedTouchable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', right: SPACE.lg, bottom: SPACE.lg, width: 52, height: 52, borderRadius: 26,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  touchable: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 26 },
});
