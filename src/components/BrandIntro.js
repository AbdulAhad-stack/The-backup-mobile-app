import React, { useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
import { Text } from './AppText';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, Easing, runOnJS,
} from 'react-native-reanimated';
import { C } from '../theme';

// Brief branded intro shown right after the native splash hands off to JS —
// bridges the static splash image into the live app with a logo pop + title
// fade, instead of cutting straight to a bare screen.
export default function BrandIntro({ onDone }) {
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(10);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) });
    logoScale.value = withSpring(1, { damping: 9, stiffness: 140 });
    titleOpacity.value = withTiming(1, { duration: 380 }, () => {});
    titleY.value = withTiming(0, { duration: 380 });

    const timer = setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 260 }, (finished) => {
        if (finished) runOnJS(onDone)();
      });
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const wrapStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value, transform: [{ scale: logoScale.value }] }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value, transform: [{ translateY: titleY.value }] }));

  return (
    <Animated.View style={[styles.wrap, wrapStyle]}>
      <Animated.View style={logoStyle}>
        <Image source={require('../../assets/medicare-logo.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <Animated.Text style={[styles.title, titleStyle]}>MediCare</Animated.Text>
      <Animated.Text style={[styles.tag, titleStyle]}>WELLMIND Data Solutions</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject, backgroundColor: C.navy,
    alignItems: 'center', justifyContent: 'center', zIndex: 999,
  },
  logo: { width: 96, height: 96, marginBottom: 18 },
  title: { color: '#fff', fontWeight: '800', fontSize: 26, letterSpacing: -0.5 },
  tag: { color: 'rgba(255,255,255,0.55)', fontSize: 12.5, marginTop: 6, letterSpacing: 0.3 },
});
