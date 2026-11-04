import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { TestResult, EmotionalStreakState } from '../types/psychologyTest';
import {
  FOCUS_CATEGORY_META,
  OFFICIAL_STREAK_BADGES,
  getRandomStreakMotivationalQuote,
  resolveFreshTaskItem,
} from '../data/streakChallengesData';
import { buildInitialStreakState } from '../data/psychologyTestQuestions';
import { createPost, uploadMediaToStorage } from './postsService';
import { showAnimaToast } from '../components/Anima/AnimaToast';

const LEGACY_STORAGE_KEY = '@entre_nosotros_latest_test_result';

// Proactively clean up legacy shared storage key
AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});

// Local reactive listeners so UI updates instantaneously across tabs
type StreakResultListener = (result: TestResult | null) => void;
const resultListeners = new Set<StreakResultListener>();

const notifyResultListeners = (result: TestResult | null) => {
  resultListeners.forEach((fn) => {
    try {
      fn(result);
    } catch (e) {}
  });
};

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
 * Ensures older TestResult records automatically get initialized with a valid streakState
 */
export const normalizeTestResultWithStreak = (
  raw: TestResult,
  userId?: string
): TestResult => {
  const focusCategory = raw.focusCategory || 'tristeza';
  const unlockedBadges = Array.isArray(raw.unlockedBadges) ? raw.unlockedBadges : [];
  const totalCompletedStreaks =
    typeof raw.totalCompletedStreaks === 'number'
      ? raw.totalCompletedStreaks
      : unlockedBadges.length;

  const baseStreakState: EmotionalStreakState =
    raw.streakState && Array.isArray(raw.streakState.days) && raw.streakState.days.length > 0
      ? raw.streakState
      : buildInitialStreakState(focusCategory, userId || raw.userId, unlockedBadges);

  const streakState: EmotionalStreakState = {
    ...baseStreakState,
    days: baseStreakState.days.map((d) => ({
      ...d,
      task: resolveFreshTaskItem(d.task, d.dayNumber),
    })),
  };

  return {
    ...raw,
    focusCategory,
    unlockedBadges,
    totalCompletedStreaks,
    streakState,
  };
};

/**
 * Saves test result strictly in the user's isolated local key and their Firestore profile
 */
export const saveLatestTestResult = async (
  result: TestResult,
  userId?: string
): Promise<TestResult> => {
  const cleanUserId = userId && userId !== 'anonymous' ? userId.trim() : undefined;
  const storageKey = getUserStorageKey(cleanUserId);
  const enrichedResult = normalizeTestResultWithStreak(
    {
      ...result,
      userId: cleanUserId || 'anonymous',
    },
    cleanUserId
  );

  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(enrichedResult));
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});

    notifyResultListeners(enrichedResult);

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

  return enrichedResult;
};

/**
 * Retrieves the latest test result ensuring 100% strict user session isolation.
 */
export const getLatestTestResult = async (userId?: string): Promise<TestResult | null> => {
  try {
    const cleanUserId = userId && userId !== 'anonymous' ? userId.trim() : undefined;

    if (cleanUserId) {
      const userStorageKey = getUserStorageKey(cleanUserId);

      try {
        const userTestRef = doc(db, 'users', cleanUserId, 'psychologyData', 'latestTest');
        const snap = await getDoc(userTestRef);
        if (snap.exists()) {
          const data = snap.data() as TestResult;
          if (!data.userId || data.userId === cleanUserId) {
            const validResult = normalizeTestResultWithStreak(
              { ...data, userId: cleanUserId },
              cleanUserId
            );
            await AsyncStorage.setItem(userStorageKey, JSON.stringify(validResult));
            return validResult;
          }
        }
      } catch (firestoreErr) {
        console.warn('Error fetching user test from Firestore, checking local cache:', firestoreErr);
      }

      const userLocalData = await AsyncStorage.getItem(userStorageKey);
      if (userLocalData) {
        const parsed = JSON.parse(userLocalData) as TestResult;
        if (!parsed.userId || parsed.userId === cleanUserId) {
          return normalizeTestResultWithStreak({ ...parsed, userId: cleanUserId }, cleanUserId);
        }
      }

      return null;
    }

    const guestStorageKey = getUserStorageKey(null);
    const guestData = await AsyncStorage.getItem(guestStorageKey);
    if (guestData) {
      const parsed = JSON.parse(guestData) as TestResult;
      if (!parsed.userId || parsed.userId === 'anonymous') {
        return normalizeTestResultWithStreak(parsed);
      }
    }

    return null;
  } catch (error) {
    console.warn('Error retrieving latest test result:', error);
    return null;
  }
};

/**
 * Real-time subscription to the user's test result and active streak
 */
export const subscribeToUserTestAndStreak = (
  userId: string | undefined,
  callback: (result: TestResult | null) => void
): (() => void) => {
  const localHandler: StreakResultListener = (res) => {
    callback(res);
  };
  resultListeners.add(localHandler);

  // Initial load
  getLatestTestResult(userId).then((res) => callback(res));

  const cleanUserId = userId && userId !== 'anonymous' ? userId.trim() : undefined;
  let unsubscribeFirestore: (() => void) | null = null;

  if (cleanUserId) {
    try {
      const userTestRef = doc(db, 'users', cleanUserId, 'psychologyData', 'latestTest');
      unsubscribeFirestore = onSnapshot(
        userTestRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as TestResult;
            if (!data.userId || data.userId === cleanUserId) {
              const normalized = normalizeTestResultWithStreak(
                { ...data, userId: cleanUserId },
                cleanUserId
              );
              callback(normalized);
            }
          }
        },
        () => {}
      );
    } catch (e) {}
  }

  return () => {
    resultListeners.delete(localHandler);
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
};

/**
 * Activates the 7-Day Emotional Streak when the user accepts ANIMA's invitation
 */
export const acceptEmotionalStreak = async (
  currentResult: TestResult,
  userId?: string
): Promise<TestResult> => {
  const normalized = normalizeTestResultWithStreak(currentResult, userId);
  const streak = normalized.streakState!;

  const updatedStreak: EmotionalStreakState = {
    ...streak,
    isActive: true,
    status: 'active',
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    days: streak.days.map((d, idx) => ({
      ...d,
      status: idx === 0 ? 'unlocked' : d.status === 'completed' ? 'completed' : 'locked',
    })),
  };

  const updatedResult: TestResult = {
    ...normalized,
    streakState: updatedStreak,
  };

  const saved = await saveLatestTestResult(updatedResult, userId);

  showAnimaToast({
    title: '¡Ruta de 7 Días Activada! 🔥',
    message:
      'Tu racha de 7 días ya está lista en tu Perfil y en tu barra de navegación. ¡Comencemos con el Día 1!',
    emoji: '🔥',
    accentColor: '#FF7A00',
  });

  return saved;
};

/**
 * Completes a day of the 7-day streak, uploads evidence photo, and publishes to the community feed
 */
export const completeStreakDayWithEvidence = async (params: {
  currentResult: TestResult;
  dayNumber: number;
  mediaSource: string;
  userNote: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string;
}): Promise<{ updatedResult: TestResult; newlyUnlockedBadgeId?: string }> => {
  const {
    currentResult,
    dayNumber,
    mediaSource,
    userNote,
    authorId,
    authorUsername,
    authorAvatarUrl,
  } = params;

  const normalized = normalizeTestResultWithStreak(currentResult, authorId);
  const streak = normalized.streakState!;
  const focusMeta = FOCUS_CATEGORY_META[streak.focusCategory || 'tristeza'];

  // 1. Upload evidence photo so we can store the URL both in the streak day and in the community post
  const storagePath = `streaks/${authorId}/day_${dayNumber}_${Date.now()}.jpg`;
  const publicEvidenceUrl = await uploadMediaToStorage(mediaSource, storagePath);

  // 2. Find the day object
  const targetDay = streak.days.find((d) => d.dayNumber === dayNumber) || streak.days[0];
  const quoteForDay = getRandomStreakMotivationalQuote();

  // 3. Build inspiring community post content
  const cleanNote = userNote.trim();
  const postHeader = `🔥 Racha Día ${dayNumber}/7 • ${focusMeta.postTagText}`;
  const taskLine = `${targetDay.task.emoji} Reto de hoy cumplido: "${targetDay.task.title}"`;
  const postBody = cleanNote
    ? `${postHeader}\n${taskLine}\n\n"${cleanNote}"\n\n💬 ANIMA: ${quoteForDay}`
    : `${postHeader}\n${taskLine}\n\nHoy di un paso más en mi camino de 7 días ${focusMeta.shortProblemLabel}.\n\n💬 ANIMA: ${quoteForDay}`;

  await createPost(
    authorId,
    authorUsername,
    authorAvatarUrl,
    postBody,
    [publicEvidenceUrl],
    ['#MiRachaEntreNosotros', `#Dia${dayNumber}De7`, '#PasoAPaso', '#BienestarEmocional']
  );

  // 4. Update streak days progression
  const updatedDays = streak.days.map((d) => {
    if (d.dayNumber === dayNumber) {
      return {
        ...d,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
        evidenceImageUrl: publicEvidenceUrl,
        evidenceNote: cleanNote || `Logré el reto: ${d.task.title}`,
        motivationalQuoteUsed: quoteForDay,
      };
    }
    if (d.dayNumber === dayNumber + 1 && d.status === 'locked') {
      return {
        ...d,
        status: 'unlocked' as const,
      };
    }
    return d;
  });

  const completedCount = updatedDays.filter((d) => d.status === 'completed').length;
  const isAllSevenCompleted = completedCount >= 7;

  let newlyUnlockedBadgeId: string | undefined;
  const existingBadges = [...(normalized.unlockedBadges || [])];
  let totalCompletedStreaks = normalized.totalCompletedStreaks || 0;

  if (isAllSevenCompleted) {
    totalCompletedStreaks += 1;
    const badgeToUnlock =
      OFFICIAL_STREAK_BADGES.find((b) => !existingBadges.includes(b.id)) ||
      OFFICIAL_STREAK_BADGES[Math.min(totalCompletedStreaks - 1, OFFICIAL_STREAK_BADGES.length - 1)];

    if (badgeToUnlock && !existingBadges.includes(badgeToUnlock.id)) {
      existingBadges.push(badgeToUnlock.id);
      newlyUnlockedBadgeId = badgeToUnlock.id;
    } else if (badgeToUnlock) {
      newlyUnlockedBadgeId = badgeToUnlock.id;
    }
  }

  const nextUnlockedDay = updatedDays.find((d) => d.status !== 'completed');

  const updatedStreak: EmotionalStreakState = {
    ...streak,
    isActive: true,
    status: isAllSevenCompleted ? 'completed' : 'active',
    completedAt: isAllSevenCompleted ? new Date().toISOString() : streak.completedAt,
    currentDayNumber: nextUnlockedDay ? nextUnlockedDay.dayNumber : 7,
    completedDaysCount: completedCount,
    days: updatedDays,
    lastUpdatedAt: new Date().toISOString(),
  };

  const updatedResult: TestResult = {
    ...normalized,
    streakState: updatedStreak,
    unlockedBadges: existingBadges,
    totalCompletedStreaks,
  };

  const saved = await saveLatestTestResult(updatedResult, authorId);

  if (isAllSevenCompleted) {
    const unlockedBadgeObj = OFFICIAL_STREAK_BADGES.find((b) => b.id === newlyUnlockedBadgeId);
    showAnimaToast({
      title: `¡Completaste los 7 Días! ${unlockedBadgeObj?.emoji || '🏆'}`,
      message: `¡Lo lograste! Desbloqueaste la insignia "${unlockedBadgeObj?.name || 'Semilla de Valentía'}" en tu perfil. ¡Estoy muy orgullosa de ti!`,
      emoji: '👑',
      accentColor: '#10B981',
      durationMs: 7000,
    });
  } else {
    showAnimaToast({
      title: `¡Día ${dayNumber} de 7 Completado! 🔥`,
      message: quoteForDay,
      emoji: '✨',
      accentColor: '#FF7A00',
      durationMs: 5800,
    });
  }

  return { updatedResult: saved, newlyUnlockedBadgeId };
};

/**
 * Postpones / shifts a day with warm encouragement when the user couldn't complete it today
 */
export const postponeStreakDayWithEncouragement = async (
  currentResult: TestResult,
  dayNumber: number,
  userId?: string
): Promise<{ updatedResult: TestResult; quote: string }> => {
  const normalized = normalizeTestResultWithStreak(currentResult, userId);
  const streak = normalized.streakState!;
  const quote = getRandomStreakMotivationalQuote();

  const updatedDays = streak.days.map((d) => {
    if (d.dayNumber === dayNumber) {
      return {
        ...d,
        status: 'postponed' as const,
        postponedCount: (d.postponedCount || 0) + 1,
        motivationalQuoteUsed: quote,
      };
    }
    return d;
  });

  const updatedStreak: EmotionalStreakState = {
    ...streak,
    postponedDaysCount: (streak.postponedDaysCount || 0) + 1,
    days: updatedDays,
    lastUpdatedAt: new Date().toISOString(),
  };

  const updatedResult: TestResult = {
    ...normalized,
    streakState: updatedStreak,
  };

  const saved = await saveLatestTestResult(updatedResult, userId);

  showAnimaToast({
    title: 'Día recorrido con cariño 💙',
    message: `No pasa nada si hoy fue difícil: recorrí tu Día ${dayNumber} para que lo repongas mañana con calma. ${quote}`,
    emoji: '🌱',
    accentColor: '#3B82F6',
    durationMs: 6500,
  });

  return { updatedResult: saved, quote };
};

/**
 * Publishes the full 7-Day Journey Summary (all evidence photos + unlocked badge + celebratory message)
 */
export const publishFullStreakSummaryToFeed = async (params: {
  currentResult: TestResult;
  customCelebrationMessage: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string;
}): Promise<TestResult> => {
  const {
    currentResult,
    customCelebrationMessage,
    authorId,
    authorUsername,
    authorAvatarUrl,
  } = params;

  const normalized = normalizeTestResultWithStreak(currentResult, authorId);
  const streak = normalized.streakState!;
  const focusMeta = FOCUS_CATEGORY_META[streak.focusCategory || 'tristeza'];

  const latestBadgeId =
    normalized.unlockedBadges?.[normalized.unlockedBadges.length - 1] ||
    streak.targetBadgeId ||
    'badge_semilla_valentia';
  const badgeObj =
    OFFICIAL_STREAK_BADGES.find((b) => b.id === latestBadgeId) || OFFICIAL_STREAK_BADGES[0];

  const allEvidenceUrls = streak.days
    .map((d) => d.evidenceImageUrl)
    .filter((url): url is string => Boolean(url));

  const finalQuote = getRandomStreakMotivationalQuote();
  const userText = customCelebrationMessage.trim() || '¡Lo logré! Completé mis 7 días paso a paso sin rendirme.';

  const summaryPostContent = [
    `🏆 ¡LO LOGRÉ! Racha de 7 Días Completada (7/7) 🔥`,
    `${badgeObj.emoji} Insignia Desbloqueada: ${badgeObj.name} (${badgeObj.levelLabel})`,
    `🌱 Camino recorrido: ${focusMeta.title}`,
    ``,
    `"${userText}"`,
    ``,
    `📋 Mis 7 pasos superados:`,
    ...streak.days.map((d) => `• Día ${d.dayNumber}: ${d.task.emoji} ${d.task.title}`),
    ``,
    `💬 Mensaje de ANIMA: ${finalQuote}`,
  ].join('\n');

  await createPost(
    authorId,
    authorUsername,
    authorAvatarUrl,
    summaryPostContent,
    allEvidenceUrls,
    ['#LoLogre', '#Racha7Dias', `#${badgeObj.name.replace(/\s+/g, '')}`, '#EntreNosotros']
  );

  const updatedResult: TestResult = {
    ...normalized,
    streakState: {
      ...streak,
      summaryPublished: true,
      lastUpdatedAt: new Date().toISOString(),
    },
  };

  const saved = await saveLatestTestResult(updatedResult, authorId);

  showAnimaToast({
    title: '¡Tu Camino Recorrido fue publicado! 🎉',
    message: `Tus fotos, tu logro y tu insignia "${badgeObj.name}" ya inspiran a toda la comunidad Entre Nosotros 💙.`,
    emoji: badgeObj.emoji,
    accentColor: badgeObj.color,
    durationMs: 6000,
  });

  return saved;
};

/**
 * Starts a brand new 7-Day Streak for the next badge level
 */
export const startNextSevenDayStreak = async (
  currentResult: TestResult,
  userId?: string
): Promise<TestResult> => {
  const normalized = normalizeTestResultWithStreak(currentResult, userId);
  const newStreak = buildInitialStreakState(
    normalized.focusCategory || 'felicidad',
    userId,
    normalized.unlockedBadges || []
  );

  const activatedStreak: EmotionalStreakState = {
    ...newStreak,
    isActive: true,
    status: 'active',
  };

  const updatedResult: TestResult = {
    ...normalized,
    streakState: activatedStreak,
  };

  const saved = await saveLatestTestResult(updatedResult, userId);

  showAnimaToast({
    title: '¡Nueva Ruta de 7 Días en marcha! 🔥',
    message: 'Se prepararon 7 nuevos desafíos interactivos para ti. ¡Vamos por tu siguiente insignia!',
    emoji: '🔥',
    accentColor: '#FF7A00',
  });

  return saved;
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
