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
import { TestResult, EmotionalStreakState } from '../types/psychologyTest';
import {
  FOCUS_CATEGORY_META,
  OFFICIAL_STREAK_BADGES,
  getRandomStreakMotivationalQuote,
  resolveFreshTaskItem,
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
 * Starts the 7-Day Personal Improvement Challenge directly (without any questionnaire or emotional diagnostic).
 * If the user ALREADY has an active 7-day week in progress, it returns that active challenge without overwriting it.
 */
export const startSevenDayImprovementChallenge = async (
  userId?: string,
  existingResult?: TestResult | null
): Promise<TestResult> => {
  const cleanUserId = userId && userId !== 'anonymous' ? userId.trim() : undefined;

  if (
    existingResult?.streakState?.isActive &&
    existingResult.streakState.status === 'active'
  ) {
    return normalizeTestResultWithStreak(existingResult, cleanUserId);
  }

  const prevBadges = existingResult?.unlockedBadges || [];
  const prevCount = existingResult?.totalCompletedStreaks || 0;

  const baseStreak = buildInitialStreakState('felicidad', cleanUserId, prevBadges);
  const streakState: EmotionalStreakState = {
    ...baseStreak,
    isActive: true,
    status: 'active',
    focusTitle: 'Reto de Mejora Personal • 7 Días',
    focusSubtitle: 'Actividades diarias para reconectar contigo y desbloquear insignias',
    focusColor: '#FF7A00',
    focusEmoji: '🔥',
    publishedPostIds: [],
  };

  const challengeResult: TestResult = {
    id: `challenge_${Date.now()}`,
    userId: cleanUserId || 'anonymous',
    createdAt: new Date().toISOString(),
    totalScore: 0,
    maxPossibleScore: 0,
    overallPercentage: 100,
    levelTitle: 'Reto de Mejora Personal • 7 Días',
    levelTag: 'equilibrio',
    badgeColor: '#FF7A00',
    badgeTextColor: '#FFFFFF',
    summary:
      'Reto semanal activo de 7 días con actividades prácticas para tu bienestar e insignias en tu perfil.',
    detailedAnalysis: '',
    dimensions: [],
    recommendations: [],
    suggestedSpecialty: 'Bienestar Integral',
    focusCategory: 'felicidad',
    streakState,
    unlockedBadges: prevBadges,
    totalCompletedStreaks: prevCount,
  };

  const saved = await saveLatestTestResult(challengeResult, cleanUserId);

  showAnimaToast({
    title: '¡Reto de 7 Días Activado! 🔥',
    message:
      'Tu racha ya está disponible en tu barra de navegación y en tu Perfil. ¡Comencemos con la actividad del Día 1!',
    emoji: '🔥',
    accentColor: '#FF7A00',
  });

  return saved;
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
          tags.includes('#MiRachaEntreNosotros') ||
          tags.includes('#Racha7Dias') ||
          tags.includes('#LoLogre') ||
          content.startsWith('🔥 Racha Día') ||
          content.startsWith('🔥 Reto Día') ||
          content.startsWith('🏆 ¡LO LOGRÉ!');

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
    title: 'Reto reiniciado por completo',
    message:
      'Se reinició tu progreso y se eliminaron tus publicaciones del reto. Puedes comenzar de nuevo cuando tú quieras.',
    emoji: '🌱',
    accentColor: '#FF7A00',
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
  let publicEvidenceUrl = mediaSource;
  try {
    publicEvidenceUrl = await uploadMediaToStorage(mediaSource, storagePath);
  } catch (uploadErr) {
    console.warn('Fallback to direct media source for streak evidence:', uploadErr);
    publicEvidenceUrl = mediaSource;
  }

  // 2. Find the day object
  const targetDay = streak.days.find((d) => d.dayNumber === dayNumber) || streak.days[0];
  const quoteForDay = getRandomStreakMotivationalQuote();

  // 3. Build inspiring community post content (without any ANIMA quote line)
  const cleanNote = userNote.trim();
  const postHeader = `🔥 Reto Día ${dayNumber}/7 • Superando mi Reto de 7 Días`;
  const taskLine = `Actividad de hoy: "${targetDay.task.title}"`;
  const postBody = cleanNote
    ? `${postHeader}\n${taskLine}\n\n"${cleanNote}"`
    : `${postHeader}\n${taskLine}\n\nHoy completé mi actividad del Día ${dayNumber} en el Reto de 7 Días de Entre Nosotros.`;

  const postCreated = await createPost(
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
        ...(postCreated.postId ? { postId: postCreated.postId } : {}),
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

  const existingPublishedIds = Array.isArray(streak.publishedPostIds)
    ? [...streak.publishedPostIds]
    : [];
  if (postCreated.postId && !existingPublishedIds.includes(postCreated.postId)) {
    existingPublishedIds.push(postCreated.postId);
  }

  const updatedStreak: EmotionalStreakState = {
    ...streak,
    isActive: true,
    status: isAllSevenCompleted ? 'completed' : 'active',
    ...(isAllSevenCompleted
      ? { completedAt: new Date().toISOString() }
      : streak.completedAt
      ? { completedAt: streak.completedAt }
      : {}),
    currentDayNumber: nextUnlockedDay ? nextUnlockedDay.dayNumber : 7,
    completedDaysCount: completedCount,
    days: updatedDays,
    publishedPostIds: existingPublishedIds,
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
      message: `Tu Día 7 se publicó en Principal y desbloqueaste la insignia "${unlockedBadgeObj?.name || 'Semilla de Valentía'}". ¡Ahora puedes publicar tu resumen completo!`,
      emoji: '👑',
      accentColor: '#FF7A00',
      durationMs: 7000,
    });
  } else {
    showAnimaToast({
      title: `¡Día ${dayNumber} de 7 publicado en Principal! 🔥`,
      message: `Tu evidencia ya fue publicada en la comunidad. ${quoteForDay}`,
      emoji: '✨',
      accentColor: '#FF7A00',
      durationMs: 6000,
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
    ...streak.days.map((d) => `• Día ${d.dayNumber}: ${d.task.title}`),
  ].join('\n');

  const summaryPostRes = await createPost(
    authorId,
    authorUsername,
    authorAvatarUrl,
    summaryPostContent,
    allEvidenceUrls,
    ['#LoLogre', '#Racha7Dias', `#${badgeObj.name.replace(/\s+/g, '')}`, '#EntreNosotros']
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
