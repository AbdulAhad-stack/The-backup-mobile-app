import React from 'react';
import { SettingsPage, Section, CheckRow } from '../../components/settings/SettingsUI';
import { usePrefs } from '../../context/PreferencesContext';
import { showInfo } from '../../utils/toast';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', available: true },
  { code: 'ur', name: 'Urdu', native: 'اردو', available: false },
  { code: 'ar', name: 'Arabic', native: 'العربية', available: false },
];

export default function LanguageScreen() {
  const { prefs, setLanguage } = usePrefs();

  return (
    <SettingsPage>
      <Section
        title="App language"
        footer="English is the only language available right now. More languages are planned for future updates."
      >
        {LANGUAGES.map((l) => (
          <CheckRow
            key={l.code}
            title={l.name}
            subtitle={l.native}
            selected={prefs.language === l.code}
            badge={l.available ? undefined : 'COMING SOON'}
            disabled={!l.available}
            onPress={() => { setLanguage(l.code); showInfo(`Language set to ${l.name}`); }}
          />
        ))}
      </Section>
    </SettingsPage>
  );
}
