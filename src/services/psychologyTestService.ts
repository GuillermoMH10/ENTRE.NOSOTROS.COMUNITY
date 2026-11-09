import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  TestResult,
  EmotionalStreakState,
  EmotionalFocusCategory,
  MainSupportTopicKey,
  StreakDayProgress,
} from '../types/psychologyTest';
import {
  FOCUS_CATEGORY_META,
  OFFICIAL_STREAK_BADGES,
  getRandomStreakMotivationalQuote,
  resolveFreshTaskItem,
  getTopicConfig,
  getTasksForTopic,
  normalizeTopicCategory,
} from '../data/streakChallengesData';
import { buildInitialStreakState } from '../data/psychologyTestQuestions';
import { createPost, deletePost, uploadMediaToStorage } from './postsService';
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
  const focusCategory = normalizeTopicCategory(raw.focusCategory || 'depresion');
  const topic = getTopicConfig(focusCategory);
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
    focusCategory,
    focusColor: topic.accentColor,
    focusEmoji: topic.emoji,
    targetBadgeId: topic.badgeId,
    days: baseStreakState.days.map((d) => ({
      ...d,
      dayName: `Actividad ${d.dayNumber}`,
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
 * Actively purges any legacy local storage keys so NOTHING is ever stored or read locally.
 * All test and streak state lives 100% in Firestore collection: `streaks/{userId}`
 */
const purgeAllLocalTestKeys = async (userId?: string | null) => {
  try {
    const keysToRemove = [
      LEGACY_STORAGE_KEY,
      '@entre_nosotros_test_result_guest_session',
    ];
    if (userId && userId !== 'anonymous') {
      keysToRemove.push(`@entre_nosotros_test_result_user_${userId.trim()}`);
    }
    await AsyncStorage.multiRemove(keysToRemove).catch(() => {});
  } catch (e) {}
};

// Purge legacy keys on load
purgeAllLocalTestKeys().catch(() => {});

/**
 * Deeply removes any `undefined` properties so Firestore `setDoc` never rejects an object.
 */
const stripUndefinedDeep = <T,>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Saves test & streak result EXCLUSIVELY in Firestore top-level collection `streaks/{userId}`
 * (No local AsyncStorage persistence).
 */
export const saveLatestTestResult = async (
  result: TestResult,
  userId?: string
): Promise<TestResult> => {
  const cleanUserId = userId && userId !== 'anonymous' ? userId.trim() : undefined;
  await purgeAllLocalTestKeys(cleanUserId);

  const enrichedResult = stripUndefinedDeep(
    normalizeTestResultWithStreak(
      {
        ...result,
        userId: cleanUserId || 'anonymous',
      },
      cleanUserId
    )
  );

  try {
    notifyResultListeners(enrichedResult);

    if (cleanUserId) {
      // Save sanitized payload in top-level collection `streaks/{userId}`
      const streakRef = doc(db, 'streaks', cleanUserId);
      const cleanPayload = stripUndefinedDeep({
        ...enrichedResult,
        syncedAt: new Date().toISOString(),
      });
      await setDoc(streakRef, cleanPayload);

      // Also clean up old hidden subcollection if it existed previously
      const legacySubRef = doc(db, 'users', cleanUserId, 'psychologyData', 'latestTest');
      await deleteDoc(legacySubRef).catch(() => {});
    }
  } catch (error) {
    console.warn('Error saving latest test result to Firestore:', error);
  }

  return enrichedResult;
};

/**
 * Retrieves the latest test & streak result EXCLUSIVELY from Firestore `streaks/{userId}`.
 * Never reads from local AsyncStorage.
 */
export const getLatestTestResult = async (userId?: string): Promise<TestResult | null> => {
  try {
    const cleanUserId = userId && userId !== 'anonymous' ? userId.trim() : undefined;
    await purgeAllLocalTestKeys(cleanUserId);

    if (!cleanUserId) {
      return null;
    }

    // 1. Primary top-level Firestore collection: `streaks/{userId}`
    const streakRef = doc(db, 'streaks', cleanUserId);
    const snap = await getDoc(streakRef);
    if (snap.exists()) {
      const data = snap.data() as TestResult;
      return normalizeTestResultWithStreak(
        { ...data, userId: cleanUserId },
        cleanUserId
      );
    }

    // 2. One-time migration cleanup: if an older subcollection doc exists at `users/{userId}/psychologyData/latestTest`, delete it so resetting in Firestore is 100% clean
    const legacySubRef = doc(db, 'users', cleanUserId, 'psychologyData', 'latestTest');
    await deleteDoc(legacySubRef).catch(() => {});

    return null;
  } catch (error) {
    console.warn('Error retrieving latest test result from Firestore:', error);
    return null;
  }
};

/**
 * Real-time subscription to Firestore `streaks/{userId}`.
 * If the document is deleted in Firestore Console, `snap.exists()` is false and the app resets to null immediately!
 */
export const subscribeToUserTestAndStreak = (
  userId: string | undefined,
  callback: (result: TestResult | null) => void
): (() => void) => {
  const localHandler: StreakResultListener = (res) => {
    callback(res);
  };
  resultListeners.add(localHandler);

  const cleanUserId = userId && userId !== 'anonymous' ? userId.trim() : undefined;
  purgeAllLocalTestKeys(cleanUserId).catch(() => {});

  if (!cleanUserId) {
    callback(null);
    return () => {
      resultListeners.delete(localHandler);
    };
  }

  // Delete legacy hidden subcollection if present
  const legacySubRef = doc(db, 'users', cleanUserId, 'psychologyData', 'latestTest');
  deleteDoc(legacySubRef).catch(() => {});

  let unsubscribeFirestore: (() => void) | null = null;

  try {
    const streakRef = doc(db, 'streaks', cleanUserId);
    unsubscribeFirestore = onSnapshot(
      streakRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as TestResult;
          const normalized = normalizeTestResultWithStreak(
            { ...data, userId: cleanUserId },
            cleanUserId
          );
          callback(normalized);
        } else {
          // Document was deleted in Firestore or doesn't exist -> reset UI immediately
          callback(null);
        }
      },
      () => {
        callback(null);
      }
    );
  } catch (e) {
    callback(null);
  }

  return () => {
    resultListeners.delete(localHandler);
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
};

/**
 * Starts the Support Activities dynamic for a chosen topic (`depresion`, `ansiedad`, `estres`, `amor_propio`).
 */
export const startSupportTopicActivities = async (
  topicKey: MainSupportTopicKey,
  userId?: string,
  existingResult?: TestResult | null
): Promise<TestResult> => {
  const cleanUserId = userId && userId !== 'anonymous' ? userId.trim() : undefined;
  const topic = getTopicConfig(topicKey);
  const meta = FOCUS_CATEGORY_META[topic.key];

  const prevBadges = existingResult?.unlockedBadges || [];
  const prevCount = existingResult?.totalCompletedStreaks || 0;

  const baseStreak = buildInitialStreakState(topic.key, cleanUserId, prevBadges);
  const streakState: EmotionalStreakState = {
    ...baseStreak,
    isActive: true,
    status: 'active',
    focusCategory: topic.key,
    focusTitle: meta.title,
    focusSubtitle: meta.subtitle,
    focusColor: topic.accentColor,
    focusEmoji: topic.emoji,
    targetBadgeId: topic.badgeId,
    publishedPostIds: existingResult?.streakState?.publishedPostIds || [],
  };

  const challengeResult: TestResult = {
    id: `support_${topic.key}_${Date.now()}`,
    userId: cleanUserId || 'anonymous',
    createdAt: new Date().toISOString(),
    totalScore: 0,
    maxPossibleScore: 0,
    overallPercentage: 100,
    levelTitle: `Actividades de Apoyo • ${topic.name}`,
    levelTag: 'equilibrio',
    badgeColor: topic.accentColor,
    badgeTextColor: '#FFFFFF',
    summary: meta.subtitle,
    detailedAnalysis: '',
    dimensions: [],
    recommendations: [],
    suggestedSpecialty: topic.name,
    focusCategory: topic.key,
    streakState,
    unlockedBadges: prevBadges,
    totalCompletedStreaks: prevCount,
  };

  const saved = await saveLatestTestResult(challengeResult, cleanUserId);

  showAnimaToast({
    title: `Actividades de ${topic.name} listas ${topic.emoji}`,
    message:
      'Ya se habilitó "Actividades de Mejora" en tu barra de navegación. Avanza a tu propio ritmo cuando sientas que lo necesitas.',
    emoji: topic.emoji,
    accentColor: topic.accentColor,
  });

  return saved;
};

export const startSevenDayImprovementChallenge = async (
  userId?: string,
  existingResult?: TestResult | null,
  topicKey: MainSupportTopicKey = 'depresion'
): Promise<TestResult> => {
  return startSupportTopicActivities(topicKey, userId, existingResult);
};

/**
 * Swaps the current activity task for another random interactive task from the 100-task pool of the user's topic
 */
export const swapCurrentActivityTask = async (
  currentResult: TestResult,
  dayNumber: number,
  userId?: string
): Promise<TestResult> => {
  const normalized = normalizeTestResultWithStreak(currentResult, userId);
  const streak = normalized.streakState!;
  const pool = getTasksForTopic(streak.focusCategory);
  const usedTaskIds = new Set(streak.days.map((d) => d.task.id));
  const candidates = pool.filter((t) => !usedTaskIds.has(t.id));
  const sourcePool = candidates.length > 0 ? candidates : pool;
  const nextTask = sourcePool[Math.floor(Math.random() * sourcePool.length)] || pool[0];

  const updatedDays = streak.days.map((d) =>
    d.dayNumber === dayNumber ? { ...d, task: nextTask } : d
  );

  const updatedResult: TestResult = {
    ...normalized,
    streakState: {
      ...streak,
      days: updatedDays,
      lastUpdatedAt: new Date().toISOString(),
    },
  };

  return saveLatestTestResult(updatedResult, userId);
};

/**
 * Loads more activity steps gradually (e.g. +6 at a time) after the initial 12 when the user taps "Ver más"
 */
export const loadMoreActivitySteps = async (
  currentResult: TestResult,
  countToAdd = 6,
  userId?: string
): Promise<TestResult> => {
  const normalized = normalizeTestResultWithStreak(currentResult, userId);
  const streak = normalized.streakState!;
  const pool = getTasksForTopic(streak.focusCategory);
  const updatedDays = [...streak.days];

  for (let i = 0; i < countToAdd; i++) {
    if (updatedDays.length >= 100) break;
    const usedIds = new Set(updatedDays.map((d) => d.task.id));
    const available = pool.filter((t) => !usedIds.has(t.id));
    const nextNum = updatedDays.length + 1;
    const nextTask = available[0] || pool[(nextNum - 1) % pool.length];
    updatedDays.push({
      dayNumber: nextNum,
      dayName: `Actividad ${nextNum}`,
      task: nextTask,
      status: 'locked',
      postponedCount: 0,
    });
  }

  const updatedResult: TestResult = {
    ...normalized,
    streakState: {
      ...streak,
      days: updatedDays,
      lastUpdatedAt: new Date().toISOString(),
    },
  };

  return saveLatestTestResult(updatedResult, userId);
};

/**
 * Called when the user decides they have overcome/concluded their current topic and claims their Medal
 */
export const concludeTopicAndClaimMedal = async (
  currentResult: TestResult,
  userId?: string
): Promise<{ updatedResult: TestResult; unlockedBadgeId: string }> => {
  const normalized = normalizeTestResultWithStreak(currentResult, userId);
  const streak = normalized.streakState!;
  const topic = getTopicConfig(streak.focusCategory);
  const badgeId = topic.badgeId;

  const existingBadges = [...(normalized.unlockedBadges || [])];
  if (!existingBadges.includes(badgeId)) {
    existingBadges.push(badgeId);
  }
  const totalCompletedStreaks = Math.max(
    (normalized.totalCompletedStreaks || 0) + 1,
    existingBadges.length
  );

  const updatedStreak: EmotionalStreakState = {
    ...streak,
    isActive: true,
    status: 'completed',
    completedAt: new Date().toISOString(),
    targetBadgeId: badgeId,
    lastUpdatedAt: new Date().toISOString(),
  };

  const updatedResult: TestResult = {
    ...normalized,
    streakState: updatedStreak,
    unlockedBadges: existingBadges,
    totalCompletedStreaks,
  };

  const saved = await saveLatestTestResult(updatedResult, userId);
  const badgeObj =
    OFFICIAL_STREAK_BADGES.find((b) => b.id === badgeId) || OFFICIAL_STREAK_BADGES[0];

  showAnimaToast({
    title: `¡Ganaste la ${badgeObj.name}! ${badgeObj.emoji}`,
    message: `Felicidades por concluir tu proceso de ${topic.name} a tu propio ritmo. Tu medalla ya está en tu Perfil 💙.`,
    emoji: badgeObj.emoji,
    accentColor: topic.accentColor,
    durationMs: 7000,
  });

  return { updatedResult: saved, unlockedBadgeId: badgeId };
};

/**
 * Deletes the user's streak document from Firestore (`streaks/{userId}`)
 * AND deletes all community posts published during the user's streak challenge.
 */
export const resetUserStreakInDatabase = async (
  userId?: string,
  currentResult?: TestResult | null
): Promise<void> => {
  const cleanUserId = userId && userId !== 'anonymous' ? userId.trim() : undefined;
  await purgeAllLocalTestKeys(cleanUserId);

  const postIdsToDelete = new Set<string>();

  const collectPostIdsFromResult = (res?: TestResult | null) => {
    if (!res?.streakState) return;
    if (Array.isArray(res.streakState.publishedPostIds)) {
      res.streakState.publishedPostIds.forEach((id) => {
        if (id) postIdsToDelete.add(id);
      });
    }
    if (res.streakState.summaryPostId) {
      postIdsToDelete.add(res.streakState.summaryPostId);
    }
    if (Array.isArray(res.streakState.days)) {
      res.streakState.days.forEach((d) => {
        if (d.postId) postIdsToDelete.add(d.postId);
      });
    }
  };

  collectPostIdsFromResult(currentResult);

  if (cleanUserId) {
    try {
      const streakRef = doc(db, 'streaks', cleanUserId);
      const snap = await getDoc(streakRef);
      if (snap.exists()) {
        collectPostIdsFromResult(snap.data() as TestResult);
      }

      // Also find any streak-related posts authored by this user in Firestore `posts`
      const userPostsQuery = query(
        collection(db, 'posts'),
        where('authorId', '==', cleanUserId)
      );
      const postsSnap = await getDocs(userPostsQuery);
      postsSnap.forEach((docSnap) => {
        const pData = docSnap.data();
        const content: string = pData?.content || '';
        const tags: string[] = Array.isArray(pData?.hashtags) ? pData.hashtags : [];
        const isStreakPost =
          postIdsToDelete.has(docSnap.id) ||
          tags.includes('#ActividadesDeMejora') ||
          tags.includes('#MiRachaEntreNosotros') ||
          tags.includes('#Racha7Dias') ||
          tags.includes('#LoLogre') ||
          content.startsWith('🔥 Racha Día') ||
          content.startsWith('🔥 Reto Día') ||
          content.startsWith('🌤️ Actividad de Mejora') ||
          content.startsWith('🌿 Actividad de Mejora') ||
          content.startsWith('🌊 Actividad de Mejora') ||
          content.startsWith('💙 Actividad de Mejora') ||
          content.startsWith('🏆 ¡LO LOGRÉ!') ||
          content.startsWith('🏅 ¡TEMA SUPERADO!');

        if (isStreakPost) {
          postIdsToDelete.add(docSnap.id);
        }
      });

      // Delete all collected streak posts from Firestore
      await Promise.all(
        Array.from(postIdsToDelete).map((pid) => deletePost(pid).catch(() => {}))
      );

      // Delete the user's streak document in Firestore
      await deleteDoc(streakRef).catch(() => {});
      const legacySubRef = doc(db, 'users', cleanUserId, 'psychologyData', 'latestTest');
      await deleteDoc(legacySubRef).catch(() => {});
    } catch (e) {
      console.warn('Error resetting streak and deleting posts:', e);
    }
  }

  notifyResultListeners(null);

  showAnimaToast({
    title: 'Actividades reiniciadas',
    message:
      'Se reinició tu progreso y se eliminaron tus publicaciones de la dinámica. Puedes elegir un tema nuevo cuando quieras.',
    emoji: '🌱',
    accentColor: '#3B82F6',
  });
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
 * Completes an activity step, uploads photo, and either publishes to the community feed ('public')
 * OR keeps it private ('private') in the user's personal activity history.
 * Unlimited activities: automatically appends new activities from the 100-task pool so there is no day limit.
 */
export const completeStreakDayWithEvidence = async (params: {
  currentResult: TestResult;
  dayNumber: number;
  mediaSource: string;
  userNote: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  visibility?: 'public' | 'private';
}): Promise<{ updatedResult: TestResult; newlyUnlockedBadgeId?: string }> => {
  const {
    currentResult,
    dayNumber,
    mediaSource,
    userNote,
    authorId,
    authorUsername,
    authorAvatarUrl,
    visibility = 'public',
  } = params;

  const normalized = normalizeTestResultWithStreak(currentResult, authorId);
  const streak = normalized.streakState!;
  const topic = getTopicConfig(streak.focusCategory);

  // 1. Upload evidence photo so we can store the URL in the user's activity history (and post if public)
  const storagePath = `streaks/${authorId}/act_${dayNumber}_${Date.now()}.jpg`;
  let publicEvidenceUrl = mediaSource;
  try {
    publicEvidenceUrl = await uploadMediaToStorage(mediaSource, storagePath);
  } catch (uploadErr) {
    console.warn('Fallback to direct media source for activity evidence:', uploadErr);
    publicEvidenceUrl = mediaSource;
  }

  // 2. Find the activity object
  const targetDay = streak.days.find((d) => d.dayNumber === dayNumber) || streak.days[0];
  const quoteForDay = getRandomStreakMotivationalQuote();
  const cleanNote = userNote.trim();

  // 3. If visibility is 'public', publish to the community feed; if 'private', keep strictly private
  let createdPostId: string | undefined;
  if (visibility === 'public') {
    const postHeader = `${topic.emoji} Actividad de Mejora • ${topic.name}`;
    const taskLine = `Actividad realizada: "${targetDay.task.title}"`;
    const postBody = cleanNote
      ? `${postHeader}\n${taskLine}\n\n"${cleanNote}"`
      : `${postHeader}\n${taskLine}\n\nHoy dediqué este momento a mi bienestar en Entre Nosotros.`;

    const postCreated = await createPost(
      authorId,
      authorUsername,
      authorAvatarUrl,
      postBody,
      [publicEvidenceUrl],
      ['#ActividadesDeMejora', `#${topic.name.replace(/\s+/g, '')}`, '#PasoAPaso', '#BienestarEmocional']
    );
    createdPostId = postCreated.postId;
  }

  // 4. Update activity progression and unlock the next activity (unlimited pace)
  const updatedDays: StreakDayProgress[] = streak.days.map((d) => {
    if (d.dayNumber === dayNumber) {
      return {
        ...d,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
        evidenceImageUrl: publicEvidenceUrl,
        evidenceNote: cleanNote || `Actividad realizada: ${d.task.title}`,
        visibility,
        motivationalQuoteUsed: quoteForDay,
        ...(createdPostId ? { postId: createdPostId } : {}),
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

  // Ensure the user never runs out of activities (append from the 100-task pool as they advance)
  const uncompletedRemaining = updatedDays.filter((d) => d.status !== 'completed').length;
  if (uncompletedRemaining < 4 && updatedDays.length < 100) {
    const pool = getTasksForTopic(streak.focusCategory);
    const usedIds = new Set(updatedDays.map((d) => d.task.id));
    const available = pool.filter((t) => !usedIds.has(t.id));
    const nextNum = updatedDays.length + 1;
    const nextTask = available[0] || pool[(nextNum - 1) % pool.length];
    updatedDays.push({
      dayNumber: nextNum,
      dayName: `Actividad ${nextNum}`,
      task: nextTask,
      status: uncompletedRemaining === 0 ? 'unlocked' : 'locked',
      postponedCount: 0,
    });
  }

  const completedCount = updatedDays.filter((d) => d.status === 'completed').length;
  const nextUnlockedDay =
    updatedDays.find((d) => d.status !== 'completed') || updatedDays[updatedDays.length - 1];

  const existingPublishedIds = Array.isArray(streak.publishedPostIds)
    ? [...streak.publishedPostIds]
    : [];
  if (createdPostId && !existingPublishedIds.includes(createdPostId)) {
    existingPublishedIds.push(createdPostId);
  }

  const updatedStreak: EmotionalStreakState = {
    ...streak,
    isActive: true,
    status: 'active',
    currentDayNumber: nextUnlockedDay.dayNumber,
    completedDaysCount: completedCount,
    days: updatedDays,
    publishedPostIds: existingPublishedIds,
    lastUpdatedAt: new Date().toISOString(),
  };

  const updatedResult: TestResult = {
    ...normalized,
    streakState: updatedStreak,
  };

  const saved = await saveLatestTestResult(updatedResult, authorId);

  if (visibility === 'public') {
    showAnimaToast({
      title: `¡Actividad compartida en Principal! ${topic.emoji}`,
      message: `Tu actividad se publicó en la comunidad. ${quoteForDay}`,
      emoji: '✨',
      accentColor: topic.accentColor,
      durationMs: 6000,
    });
  } else {
    showAnimaToast({
      title: `Actividad guardada en privado 🔒`,
      message: `Tu foto y reflexión quedaron guardadas solo para ti. ${quoteForDay}`,
      emoji: topic.emoji,
      accentColor: topic.accentColor,
      durationMs: 6000,
    });
  }

  return { updatedResult: saved };
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
 * Publishes the Topic Completion & Medal Summary to the community feed
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
  const topic = getTopicConfig(streak.focusCategory);
  const focusMeta = FOCUS_CATEGORY_META[topic.key];

  const badgeObj =
    OFFICIAL_STREAK_BADGES.find((b) => b.id === topic.badgeId) || OFFICIAL_STREAK_BADGES[0];

  const completedPublicOrAllDays = streak.days.filter((d) => d.status === 'completed');
  const allEvidenceUrls = completedPublicOrAllDays
    .filter((d) => d.visibility !== 'private')
    .map((d) => d.evidenceImageUrl)
    .filter((url): url is string => Boolean(url));

  const userText =
    customCelebrationMessage.trim() ||
    `¡Hoy concluí mi etapa de actividades de ${topic.name} a mi propio ritmo y obtuve mi medalla en Entre Nosotros!`;

  const summaryPostContent = [
    `🏅 ¡TEMA SUPERADO! ${topic.name} • Actividades de Mejora`,
    `${badgeObj.emoji} Medalla Obtenida: ${badgeObj.name}`,
    `🌱 Proceso: ${focusMeta.title}`,
    ``,
    `"${userText}"`,
    ...(completedPublicOrAllDays.length > 0
      ? [
          ``,
          `📋 Actividades que me acompañaron:`,
          ...completedPublicOrAllDays.map((d) => `• ${d.task.title}`),
        ]
      : []),
  ].join('\n');

  const summaryPostRes = await createPost(
    authorId,
    authorUsername,
    authorAvatarUrl,
    summaryPostContent,
    allEvidenceUrls,
    ['#ActividadesDeMejora', '#LoLogre', `#${badgeObj.name.replace(/\s+/g, '')}`, '#EntreNosotros']
  );

  const updatedPublishedIds = Array.isArray(streak.publishedPostIds)
    ? [...streak.publishedPostIds]
    : [];
  if (summaryPostRes.postId && !updatedPublishedIds.includes(summaryPostRes.postId)) {
    updatedPublishedIds.push(summaryPostRes.postId);
  }

  const updatedResult: TestResult = {
    ...normalized,
    streakState: {
      ...streak,
      summaryPublished: true,
      ...(summaryPostRes.postId ? { summaryPostId: summaryPostRes.postId } : {}),
      publishedPostIds: updatedPublishedIds,
      lastUpdatedAt: new Date().toISOString(),
    },
  };

  const saved = await saveLatestTestResult(updatedResult, authorId);

  showAnimaToast({
    title: '¡Tu logro y medalla fueron publicados! 🎉',
    message: `Tu medalla "${badgeObj.name}" ya inspira a toda la comunidad Entre Nosotros 💙.`,
    emoji: badgeObj.emoji,
    accentColor: topic.accentColor,
    durationMs: 6000,
  });

  return saved;
};

/**
 * Starts a new topic session
 */
export const startNextSevenDayStreak = async (
  currentResult: TestResult,
  userId?: string,
  nextTopicKey?: MainSupportTopicKey
): Promise<TestResult> => {
  const normalized = normalizeTestResultWithStreak(currentResult, userId);
  const chosenTopic = nextTopicKey || normalizeTopicCategory(normalized.focusCategory);
  return startSupportTopicActivities(chosenTopic, userId, normalized);
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
