import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TestResult } from '../types/psychologyTest';

const LEGACY_STORAGE_KEY = '@entre_nosotros_latest_test_result';

// Proactively clean up legacy shared storage key so older mixed test results don't bleed into new sessions
AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});

/**
 * Generates an isolated AsyncStorage key unique to the user or guest session
 */
export const getUserStorageKey = (userId?: string | null): string => {
  if (userId && userId !== 'anonymous' && userId.trim().length > 0) {
    return `@entre_nosotros_test_result_user_${userId.trim()}`;
  }
  return `@entre_nosotros_test_result_guest_session`;
};

/**
 * Saves test result strictly in the user's isolated local key and their Firestore profile
 */
export const saveLatestTestResult = async (result: TestResult, userId?: string): Promise<void> => {
  try {
    const cleanUserId = userId && userId !== 'anonymous' ? userId.trim() : undefined;
    const storageKey = getUserStorageKey(cleanUserId);
    const enrichedResult: TestResult = {
      ...result,
      userId: cleanUserId || 'anonymous',
    };

    // 1. Save strictly under this specific user's isolated local key
    await AsyncStorage.setItem(storageKey, JSON.stringify(enrichedResult));

    // 2. Also ensure legacy key is deleted to prevent cross-contamination
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});

    // 3. If user is logged in, sync with Firestore under their own user document
    if (cleanUserId) {
      const userTestRef = doc(db, 'users', cleanUserId, 'psychologyData', 'latestTest');
      await setDoc(
        userTestRef,
        {
          ...enrichedResult,
          syncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.warn('Error saving latest test result:', error);
  }
};

/**
 * Retrieves the latest test result ensuring 100% strict user session isolation.
 * A user never sees tests from guests or other users.
 */
export const getLatestTestResult = async (userId?: string): Promise<TestResult | null> => {
  try {
    const cleanUserId = userId && userId !== 'anonymous' ? userId.trim() : undefined;

    // CASE 1: Logged in authenticated user
    if (cleanUserId) {
      const userStorageKey = getUserStorageKey(cleanUserId);

      // 1. Try fetching from Firestore under their own user document
      try {
        const userTestRef = doc(db, 'users', cleanUserId, 'psychologyData', 'latestTest');
        const snap = await getDoc(userTestRef);
        if (snap.exists()) {
          const data = snap.data() as TestResult;
          // Validate ownership: only accept if it matches this user or has no foreign userId
          if (!data.userId || data.userId === cleanUserId) {
            const validResult: TestResult = { ...data, userId: cleanUserId };
            await AsyncStorage.setItem(userStorageKey, JSON.stringify(validResult));
            return validResult;
          }
        }
      } catch (firestoreErr) {
        console.warn('Error fetching user test from Firestore, checking isolated local cache:', firestoreErr);
      }

      // 2. Fallback ONLY to this user's isolated local storage key
      const userLocalData = await AsyncStorage.getItem(userStorageKey);
      if (userLocalData) {
        const parsed = JSON.parse(userLocalData) as TestResult;
        if (!parsed.userId || parsed.userId === cleanUserId) {
          return { ...parsed, userId: cleanUserId };
        }
      }

      // If this authenticated user has NOT taken a test, return null.
      // NEVER fall back to guest, legacy key, or other accounts.
      return null;
    }

    // CASE 2: Guest / Unauthenticated session
    const guestStorageKey = getUserStorageKey(null);
    const guestData = await AsyncStorage.getItem(guestStorageKey);
    if (guestData) {
      const parsed = JSON.parse(guestData) as TestResult;
      // Only return if it belongs to guest (not a leaked authenticated account)
      if (!parsed.userId || parsed.userId === 'anonymous') {
        return parsed;
      }
    }

    return null;
  } catch (error) {
    console.warn('Error retrieving latest test result:', error);
    return null;
  }
};

/**
 * Clears the temporary guest test result
 */
export const clearGuestTestResult = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(getUserStorageKey(null));
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.warn('Error clearing guest test result:', err);
  }
};

/**
 * Clears cached tests across user and guest keys
 */
export const clearUserTestCache = async (userId?: string): Promise<void> => {
  try {
    if (userId) {
      await AsyncStorage.removeItem(getUserStorageKey(userId));
    }
    await AsyncStorage.removeItem(getUserStorageKey(null));
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.warn('Error clearing user test cache:', err);
  }
};
