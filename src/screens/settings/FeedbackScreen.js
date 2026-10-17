import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Feather, Ionicons } from '../../components/Themed';
import { SettingsPage, Section } from '../../components/settings/SettingsUI';
import { PrimaryButton, SecondaryButton } from '../../components/ui';
import { showError } from '../../utils/toast';
import { C, RADIUS, SPACE, createStyles, mapColor } from '../../theme';

const CATEGORIES = ['General', 'Appointments', 'Medications', 'App experience', 'Bug report'];
const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
const MAX = 500;

export default function FeedbackScreen({ navigation, route }) {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState(route.params?.category || 'General');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (rating === 0) { showError('Please choose a star rating first.'); return; }
    setSending(true);
    // Feedback is not wired to a backend yet — simulate the round trip.
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  };

  const again = () => { setRating(0); setCategory('General'); setMessage(''); setSent(false); };

  if (sent) {
    return (
      <SettingsPage contentStyle={styles.centerPage}>
        <View style={styles.doneIcon}><Feather name="check" size={34} color="#16a34a" /></View>
        <Text style={styles.doneTitle}>Thank you!</Text>
        <Text style={styles.doneText}>Your feedback helps us make MediCare better for everyone.</Text>
        <View style={styles.doneBtns}>
          <PrimaryButton label="Back to settings" onPress={() => navigation.navigate('SettingsHome')} />
          <SecondaryButton label="Send another" onPress={again} />
        </View>
      </SettingsPage>
    );
  }

  return (
    <SettingsPage>
      <Section title="How was your experience?">
        <View style={styles.card}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setRating(n)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }} accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}>
                <Ionicons
                  name={n <= rating ? 'star' : 'star-outline'}
                  size={38}
                  color={n <= rating ? mapColor('#f59e0b', 'color') : mapColor('#cbd5e1', 'color')}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.ratingLabel, rating === 0 && { color: C.muted }]}>{rating ? LABELS[rating] : 'Tap a star to rate'}</Text>
        </View>
      </Section>

      <Section title="Topic">
        <View style={styles.card}>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => {
              const on = c === category;
              return (
                <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, on && styles.chipOn]} activeOpacity={0.7}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Section>

      <Section title="Tell us more (optional)">
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            multiline
            maxLength={MAX}
            value={message}
            onChangeText={setMessage}
            placeholder="What went well? What could be better?"
            textAlignVertical="top"
          />
          <Text style={styles.counter}>{message.length}/{MAX}</Text>
        </View>
      </Section>

      <PrimaryButton label={sending ? 'Sending…' : 'Submit feedback'} onPress={submit} loading={sending} />
    </SettingsPage>
  );
}

const styles = createStyles({
  card: { padding: SPACE.lg },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  ratingLabel: { textAlign: 'center', marginTop: 10, fontSize: 14, fontWeight: '700', color: C.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.pill, paddingHorizontal: 13, paddingVertical: 7, backgroundColor: C.white },
  chipOn: { backgroundColor: C.navyMid, borderColor: C.navyMid },
  chipText: { fontSize: 13, fontWeight: '600', color: C.text },
  chipTextOn: { color: '#ffffff' },
  input: {
    minHeight: 120, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, backgroundColor: '#f9fafb',
    padding: 12, fontSize: 14.5, color: C.text,
  },
  counter: { alignSelf: 'flex-end', marginTop: 6, fontSize: 11.5, color: C.muted },
  centerPage: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  doneIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: C.greenBg, borderWidth: 1, borderColor: C.greenBorder, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginTop: SPACE.lg },
  doneText: { fontSize: 14, color: C.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20, maxWidth: 280 },
  doneBtns: { alignSelf: 'stretch', gap: SPACE.sm, marginTop: SPACE.xxl },
});
