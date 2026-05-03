import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'worklyn:userDisplayName:v1';

export async function loadDisplayName(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === '') {
      return '';
    }
    return raw;
  } catch {
    return '';
  }
}

export async function saveDisplayName(displayName: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, displayName);
}
