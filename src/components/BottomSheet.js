import React, { useEffect } from 'react';
import { Modal, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { View, ScrollView, Feather } from './Themed';
import { Text } from './AppText';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import AnimatedTouchable from './animated/AnimatedTouchable';
import { C, RADIUS, SPACE, createStyles } from '../theme';
import { useAppearance } from '../context/AppearanceContext';

export default function BottomSheet({ visible, onClose, title, icon, children }) {
  const theme = useAppearance();
  const colors = theme?.colors || C;
  const backdrop = useSharedValue(0);
  const sheetY = useSharedValue(40);

  useEffect(() => {
    if (visible) {
      backdrop.value = withTiming(1, { duration: 220 });
      sheetY.value = withSpring(0, { damping: 16, stiffness: 160 });
    } else {
      backdrop.value = withTiming(0, { duration: 150 });
      sheetY.value = 40;
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }] }));

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlayWrap}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        <Animated.View style={[styles.sheet, { backgroundColor: colors.white }, sheetStyle]}>
          <View style={[styles.head, { backgroundColor: colors.header }]}>
            <Text style={styles.title}>{icon ? <Feather name={icon} size={16} color="#fff" /> : null}  {title}</Text>
            <AnimatedTouchable onPress={onClose} style={styles.closeBtn} scaleTo={0.85}>
              <Feather name="x" size={20} color="#fff" />
            </AnimatedTouchable>
          </View>
          <ScrollView contentContainerStyle={{ padding: SPACE.lg }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = createStyles({
  overlayWrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.5)' },
  sheet: { backgroundColor: C.white, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, maxHeight: '90%' },
  head: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.navyMid, padding: SPACE.lg, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
  },
  title: { color: '#fff', fontWeight: '700', fontSize: 15.5 },
  closeBtn: { padding: 2 },
});
