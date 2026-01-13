import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage utilities for sensitive data (tokens, PIN, etc.)
 * Uses expo-secure-store which leverages:
 * - iOS: Keychain Services
 * - Android: EncryptedSharedPreferences
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_ID: 'userId',
  PARENTAL_PIN: 'parentalPin',
} as const;

/**
 * Save a value to secure storage
 */
export async function saveSecure(
  key: keyof typeof STORAGE_KEYS,
  value: string
): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS[key], value);
  } catch (error) {
    console.error(`Failed to save ${key} to secure storage:`, error);
    throw new Error(`Secure storage save failed for ${key}`);
  }
}

/**
 * Get a value from secure storage
 */
export async function getSecure(
  key: keyof typeof STORAGE_KEYS
): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS[key]);
  } catch (error) {
    console.error(`Failed to get ${key} from secure storage:`, error);
    return null;
  }
}

/**
 * Delete a value from secure storage
 */
export async function deleteSecure(
  key: keyof typeof STORAGE_KEYS
): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS[key]);
  } catch (error) {
    console.error(`Failed to delete ${key} from secure storage:`, error);
    throw new Error(`Secure storage delete failed for ${key}`);
  }
}

/**
 * Clear all secure storage (logout)
 */
export async function clearSecureStorage(): Promise<void> {
  try {
    await Promise.all([
      deleteSecure('ACCESS_TOKEN'),
      deleteSecure('REFRESH_TOKEN'),
      deleteSecure('USER_ID'),
    ]);
  } catch (error) {
    console.error('Failed to clear secure storage:', error);
    throw new Error('Secure storage clear failed');
  }
}

/**
 * Check if user is authenticated (has tokens)
 */
export async function hasAuthTokens(): Promise<boolean> {
  const accessToken = await getSecure('ACCESS_TOKEN');
  const refreshToken = await getSecure('REFRESH_TOKEN');
  return !!(accessToken && refreshToken);
}
