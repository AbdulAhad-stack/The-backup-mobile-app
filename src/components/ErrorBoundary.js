import React from 'react';
import { StyleSheet } from 'react-native';
import { C, RADIUS, SPACE, createStyles } from '../theme';
import { View, Text, TouchableOpacity, ScrollView, Feather } from './Themed';

// Catches render-time crashes so one bad screen/record shows a friendly error
// card (with the real error text, handy while testing the APK) instead of
// closing the whole app.
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Feather name="alert-triangle" size={32} color={C.red} />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.sub}>This screen ran into a problem. You can try again.</Text>
          <ScrollView style={styles.msgBox}>
            <Text style={styles.msg} selectable>{String(error?.message || error)}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.btn} onPress={this.reset}>
            <Text style={styles.btnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = createStyles({
  wrap: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', padding: SPACE.xl },
  card: {
    backgroundColor: C.white, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border,
    padding: SPACE.xl, alignItems: 'center', gap: 8,
  },
  title: { fontWeight: '800', fontSize: 17, color: C.text, marginTop: 6 },
  sub: { fontSize: 13, color: C.textMuted, textAlign: 'center' },
  msgBox: { maxHeight: 120, alignSelf: 'stretch', backgroundColor: C.redBg, borderRadius: RADIUS.sm, padding: 10, marginTop: 6 },
  msg: { fontSize: 11.5, color: '#991b1b' },
  btn: { backgroundColor: C.blue, borderRadius: RADIUS.md, paddingVertical: 11, paddingHorizontal: 26, marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
