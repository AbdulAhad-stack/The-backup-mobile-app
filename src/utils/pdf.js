import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../api/client';
import { showError } from './toast';

// Downloads a protected PDF from the backend straight to a local file (auth
// header attached), then hands it to the native share sheet — the mobile-
// native replacement for the web app's "download as blob" pattern. From
// there the user can save it, or share it directly via WhatsApp, email, etc.
export async function downloadAndSharePdf(path, filename, { onStart, onEnd } = {}) {
  onStart?.();
  try {
    const token = await AsyncStorage.getItem('authToken');
    const url = `${API_BASE_URL}${path}`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    const result = await FileSystem.downloadAsync(url, fileUri, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (result.status !== 200) throw new Error(`Download failed with status ${result.status}`);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: filename,
        UTI: 'com.adobe.pdf',
      });
    }
  } catch {
    showError('Failed to download the PDF. Please try again.');
  } finally {
    onEnd?.();
  }
}
