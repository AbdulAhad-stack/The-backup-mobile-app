import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { View, Feather } from '../components/Themed';
import { Text } from '../components/AppText';
import { C, RADIUS, SPACE, createStyles } from '../theme';

let _push = null;

const KINDS = {
  success: { bg: C.greenBg, border: C.greenBorder, color: '#166534', icon: 'check-circle' },
  error: { bg: C.redBg, border: C.redBorder, color: '#991b1b', icon: 'x-circle' },
  info: { bg: C.blueSoft, border: '#cfd2f4', color: '#3a3d86', icon: 'info' },
};

export const showSuccess = (message) => _push && _push({ message, kind: 'success' });
export const showError = (message) => _push && _push({ message: message || 'Something went wrong', kind: 'error' });
export const showInfo = (message) => _push && _push({ message, kind: 'info' });

export function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _push = ({ message, kind }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, kind }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
    return () => { _push = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="none" style={styles.host}>
      {toasts.map((t) => {
        const k = KINDS[t.kind] || KINDS.info;
        return (
          <View key={t.id} style={[styles.toast, { backgroundColor: k.bg, borderColor: k.border }]}>
            <Feather name={k.icon} size={16} color={k.color} />
            <Text style={[styles.text, { color: k.color }]} numberOfLines={3}>{t.message}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = createStyles({
  host: { position: 'absolute', top: 50, left: SPACE.lg, right: SPACE.lg, zIndex: 999, gap: SPACE.sm },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    borderWidth: 1, borderRadius: RADIUS.md, padding: SPACE.md,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  text: { flex: 1, fontSize: 13, fontWeight: '600' },
});
