import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TestResult } from '../types/psychologyTest';

const LOCAL_STORAGE_KEY = '@entre_nosotros_latest_test_result';

export const saveLatestTestResult = async (result: TestResult, userId?: string): Promise<void> => {
  try {
    // 1. Save to local AsyncStorage for immediate offline availability
    await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));

    // 2. If user is logged in, sync with Firestore under user profile
    if (userId && userId !== 'anonymous') {
      const userTestRef = doc(db, 'users', userId, 'psychologyData', 'latestTest');
      await setDoc(userTestRef, {
        ...result,
        syncedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (error) {
    console.warn('Error saving latest test result:', error);
  }
};

export const getLatestTestResult = async (userId?: string): Promise<TestResult | null> => {
  try {
    // 1. Try fetching from Firestore if logged in
    if (userId && userId !== 'anonymous') {
      const userTestRef = doc(db, 'users', userId, 'psychologyData', 'latestTest');
      const snap = await getDoc(userTestRef);
      if (snap.exists()) {
        const data = snap.data() as TestResult;
        // Also cache locally
        await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }

    // 2. Fallback to AsyncStorage
    const localData = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      return JSON.parse(localData) as TestResult;
    }

    return null;
  } catch (error) {
    console.warn('Error retrieving latest test result:', error);
    try {
      const localData = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) return JSON.parse(localData) as TestResult;
    } catch {
      // ignore
    }
    return null;
  }
};
