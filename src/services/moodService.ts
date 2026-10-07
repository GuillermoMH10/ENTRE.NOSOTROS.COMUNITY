import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { MoodType, getRandomMoodResponse } from '../data/dailyMoodResponses';

export interface DailyMoodRecord {
  date: string; // YYYY-MM-DD
  mood: MoodType;
  quote: string;
  timestamp: number;
  userId?: string | null;
}

export interface WeekDayInfo {
  dateKey: string; // "2026-10-05"
  dayNameShort: string; // "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"
  dayNameFull: string; // "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
  dayNumber: number; // 5, 6, 7...
  isToday: boolean;
  isFuture: boolean;
  monthName: string; // "Octubre", etc.
}

const STORAGE_PREFIX = '@entre_nosotros_daily_mood_';
const HISTORY_STORAGE_KEY = '@entre_nosotros_mood_history';

type MoodChangeListener = (record: DailyMoodRecord) => void;
const moodChangeListeners = new Set<MoodChangeListener>();

export const subscribeToMoodChanges = (listener: MoodChangeListener): (() => void) => {
  moodChangeListeners.add(listener);
  return () => {
    moodChangeListeners.delete(listener);
  };
};

export const notifyMoodChanged = (record: DailyMoodRecord): void => {
  moodChangeListeners.forEach((fn) => {
    try {
      fn(record);
    } catch (e) {
      console.error('Error notifying mood change:', e);
    }
  });
};

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
 * Get the 7 days of the current week (Monday to Sunday)
 */
export const getCurrentWeekDays = (referenceDate = new Date()): WeekDayInfo[] => {
  const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const todayKey = getTodayDateKey();

  // Current day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const currentDayOfWeek = referenceDate.getDay();
  // Monday offset: Mon(1) -> 0, Tue(2) -> 1, ..., Sun(0) -> 6
  const mondayOffset = (currentDayOfWeek + 6) % 7;

  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - mondayOffset);

  const weekDays: WeekDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const dayOfWeek = d.getDay();

    const isToday = dateKey === todayKey;
    const isFuture = dateKey > todayKey;

    weekDays.push({
      dateKey,
      dayNameShort: dayNamesShort[dayOfWeek],
      dayNameFull: dayNamesFull[dayOfWeek],
      dayNumber: d.getDate(),
      isToday,
      isFuture,
      monthName: monthNames[d.getMonth()],
    });
  }

  return weekDays;
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
 * Get all mood records for the current week mapped by dateKey
 */
export const getWeeklyMoodRecords = async (
  userId?: string | null
): Promise<Record<string, DailyMoodRecord>> => {
  try {
    const weekDays = getCurrentWeekDays();
    const results: Record<string, DailyMoodRecord> = {};

    // 1. First check local storage keys
    for (const day of weekDays) {
      const localKey = `${STORAGE_PREFIX}${day.dateKey}`;
      const raw = await AsyncStorage.getItem(localKey);
      if (raw) {
        try {
          results[day.dateKey] = JSON.parse(raw) as DailyMoodRecord;
        } catch {
          // ignore json parse error
        }
      }
    }

    // 2. If user is logged in, check Firestore for missing days (up to today)
    if (userId) {
      const todayKey = getTodayDateKey();
      for (const day of weekDays) {
        if (!results[day.dateKey] && day.dateKey <= todayKey) {
          try {
            const docRef = doc(db, 'users', userId, 'mood_checkins', day.dateKey);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
              const record = snap.data() as DailyMoodRecord;
              results[day.dateKey] = record;
              await AsyncStorage.setItem(`${STORAGE_PREFIX}${day.dateKey}`, JSON.stringify(record));
            }
          } catch (e) {
            // non-fatal
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error fetching weekly mood records:', error);
    return {};
  }
};

/**
 * Create instant mood record in 0ms (synchronous)
 */
export const createInstantMoodRecord = (
  mood: MoodType,
  userId?: string | null,
  customDateKey?: string
): DailyMoodRecord => {
  const dateKey = customDateKey || getTodayDateKey();
  const quote = getRandomMoodResponse(mood);
  const record: DailyMoodRecord = {
    date: dateKey,
    mood,
    quote,
    timestamp: Date.now(),
    userId: userId || null,
  };
  notifyMoodChanged(record);
  return record;
};

/**
 * Persist mood record in background without blocking the UI
 */
export const persistMoodRecordInBackground = async (
  record: DailyMoodRecord
): Promise<void> => {
  try {
    const dateKey = record.date;

    // 1. Save locally
    const localKey = `${STORAGE_PREFIX}${dateKey}`;
    await AsyncStorage.setItem(localKey, JSON.stringify(record));

    // 2. Append to local history list
    const historyRaw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    let history: DailyMoodRecord[] = historyRaw ? JSON.parse(historyRaw) : [];
    history = history.filter((item) => item.date !== dateKey);
    history.unshift(record);
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 365)));

    // 3. Save to Firestore if user is authenticated
    if (record.userId) {
      const userCheckinRef = doc(db, 'users', record.userId, 'mood_checkins', dateKey);
      await setDoc(userCheckinRef, record, { merge: true });
    }

    notifyMoodChanged(record);
  } catch (error) {
    console.error('Error saving daily mood record in background:', error);
  }
};

/**
 * Save today's mood response (instant record + background persist)
 */
export const saveDailyMoodRecord = async (
  mood: MoodType,
  userId?: string | null,
  customDateKey?: string
): Promise<DailyMoodRecord> => {
  const record = createInstantMoodRecord(mood, userId, customDateKey);
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
