import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { MoodType, getRandomMoodResponse } from '../data/dailyMoodResponses';

export interface DailyMoodRecord {
  date: string; // YYYY-MM-DD
  mood: MoodType;
  quote: string;
  timestamp: number;
  userId?: string | null;
}

const STORAGE_PREFIX = '@entre_nosotros_daily_mood_';
const HISTORY_STORAGE_KEY = '@entre_nosotros_mood_history';

/**
 * Format Date as YYYY-MM-DD string in local time
 */
export const getTodayDateKey = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's mood record if already answered
 */
export const getTodayMoodRecord = async (userId?: string | null): Promise<DailyMoodRecord | null> => {
  try {
    const todayKey = getTodayDateKey();
    const localKey = `${STORAGE_PREFIX}${todayKey}`;
    const rawLocal = await AsyncStorage.getItem(localKey);

    if (rawLocal) {
      return JSON.parse(rawLocal) as DailyMoodRecord;
    }

    // If logged in and not found in local, check Firestore
    if (userId) {
      const docRef = doc(db, 'users', userId, 'mood_checkins', todayKey);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const record = snap.data() as DailyMoodRecord;
        await AsyncStorage.setItem(localKey, JSON.stringify(record));
        return record;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching today mood record:', error);
    return null;
  }
};

/**
 * Create instant mood record in 0ms (synchronous)
 */
export const createInstantMoodRecord = (
  mood: MoodType,
  userId?: string | null
): DailyMoodRecord => {
  const todayKey = getTodayDateKey();
  const quote = getRandomMoodResponse(mood);
  return {
    date: todayKey,
    mood,
    quote,
    timestamp: Date.now(),
    userId: userId || null,
  };
};

/**
 * Persist mood record in background without blocking the UI
 */
export const persistMoodRecordInBackground = async (
  record: DailyMoodRecord
): Promise<void> => {
  try {
    const todayKey = record.date;

    // 1. Save locally
    const localKey = `${STORAGE_PREFIX}${todayKey}`;
    await AsyncStorage.setItem(localKey, JSON.stringify(record));

    // 2. Append to local history list
    const historyRaw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    let history: DailyMoodRecord[] = historyRaw ? JSON.parse(historyRaw) : [];
    history = history.filter((item) => item.date !== todayKey);
    history.unshift(record);
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 365)));

    // 3. Save to Firestore if user is authenticated
    if (record.userId) {
      const userCheckinRef = doc(db, 'users', record.userId, 'mood_checkins', todayKey);
      await setDoc(userCheckinRef, record, { merge: true });
    }
  } catch (error) {
    console.error('Error saving daily mood record in background:', error);
  }
};

/**
 * Save today's mood response (instant record + background persist)
 */
export const saveDailyMoodRecord = async (
  mood: MoodType,
  userId?: string | null
): Promise<DailyMoodRecord> => {
  const record = createInstantMoodRecord(mood, userId);
  // Persist in background without awaiting network
  persistMoodRecordInBackground(record);
  return record;
};

/**
 * Get all past mood records for future analytics / insights
 */
export const getMoodHistory = async (userId?: string | null): Promise<DailyMoodRecord[]> => {
  try {
    const historyRaw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (historyRaw) {
      return JSON.parse(historyRaw) as DailyMoodRecord[];
    }
    return [];
  } catch (error) {
    console.error('Error getting mood history:', error);
    return [];
  }
};
