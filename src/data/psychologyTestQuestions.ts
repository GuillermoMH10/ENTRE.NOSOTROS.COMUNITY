import {
  TestQuestion,
  TestOption,
  TestResult,
  DimensionScore,
  TestDimensionKey,
  EmotionalFocusCategory,
  EmotionalStreakState,
} from '../types/psychologyTest';
import {
  FOCUS_CATEGORY_META,
  OFFICIAL_STREAK_BADGES,
  generateSevenDayTasksForUser,
  getTopicConfig,
  normalizeTopicCategory,
} from './streakChallengesData';

export const TEST_OPTIONS: TestOption[] = [
  {
    value: 0,
    emoji: '😊',
    label: 'Casi nunca',
    sublabel: 'Me siento tranquilo/a en esto',
  },
  {
    value: 1,
    emoji: '🙂',
    label: 'A veces',
    sublabel: 'Me pasa en algunos momentos',
  },
  {
    value: 2,
    emoji: '😐',
    label: 'Seguido',
    sublabel: 'Lo he sentido varios días',
  },
  {
    value: 3,
    emoji: '😔',
    label: 'Mucho hoy',
    sublabel: 'Es lo que más siento ahora',
  },
];

export const TEST_QUESTIONS: TestQuestion[] = [
  // --- 1. Tristeza y Estado de Ánimo ---
  {
    id: 1,
    dimension: 'animo_depresion',
    focusCategory: 'tristeza',
    dimensionLabel: 'Ánimo y Alegría',
    dimensionIcon: 'heart-outline',
    question: '¿Últimamente has sentido tristeza, ganas de llorar o un bajón de ánimo?',
    subtitle: 'Queremos saber si tu corazón necesita hoy un abrazo extra de calidez.',
  },
  {
    id: 2,
    dimension: 'animo_depresion',
    focusCategory: 'tristeza',
    dimensionLabel: 'Ánimo y Alegría',
    dimensionIcon: 'heart-outline',
    question: '¿Sientes que te cuesta disfrutar las cosas que antes te hacían ilusión?',
    subtitle: 'Como si los días se sintieran un poquito más grises o lentos de lo normal.',
  },
  {
    id: 3,
    dimension: 'animo_depresion',
    focusCategory: 'tristeza',
    dimensionLabel: 'Ánimo y Alegría',
    dimensionIcon: 'heart-outline',
    question: '¿Te has sentido solo/a aunque estés rodeado/a de más personas?',
    subtitle: 'Sensación de necesitar que alguien te escuche y acompañe de verdad.',
  },

  // --- 2. Ansiedad y Sobrepensamiento ---
  {
    id: 4,
    dimension: 'ansiedad_sobrepensamiento',
    focusCategory: 'ansiedad',
    dimensionLabel: 'Calma Mental',
    dimensionIcon: 'pulse-outline',
    question: '¿Tu mente da muchas vueltas pensando en el futuro o en cosas que te preocupan?',
    subtitle: 'Cuando los pensamientos no paran y te cuesta apagar la cabeza un ratito.',
  },
  {
    id: 5,
    dimension: 'ansiedad_sobrepensamiento',
    focusCategory: 'ansiedad',
    dimensionLabel: 'Calma Mental',
    dimensionIcon: 'pulse-outline',
    question: '¿Sientes inquietud, nervios o dificultad para quedarte tranquilo/a en el presente?',
    subtitle: 'Sensación de alerta o aceleración dentro del pecho.',
  },

  // --- 3. Enojo, Frustración e Irritabilidad ---
  {
    id: 6,
    dimension: 'estres_agotamiento',
    focusCategory: 'enojo',
    dimensionLabel: 'Liberación Emocional',
    dimensionIcon: 'flame-outline',
    question: '¿Te has sentido con enojo guardado, frustración o ganas de explotar por pequeñas cosas?',
    subtitle: 'Cuando sientes tensión acumulada y necesitas soltar presión.',
  },
  {
    id: 7,
    dimension: 'estres_agotamiento',
    focusCategory: 'enojo',
    dimensionLabel: 'Liberación Emocional',
    dimensionIcon: 'flame-outline',
    question: '¿Sientes impaciencia o molestia cuando las cosas no salen como esperabas?',
    subtitle: 'Esa incomodidad interna que te quita la paz durante el día.',
  },

  // --- 4. Estrés, Cansancio y Sueño ---
  {
    id: 8,
    dimension: 'energia_sueno',
    focusCategory: 'estres',
    dimensionLabel: 'Energía y Descanso',
    dimensionIcon: 'moon-outline',
    question: '¿Sientes que los pendientes del día te agotan y no te queda tiempo para ti?',
    subtitle: 'Sensación de llevar demasiadas cosas sobre tus hombros.',
  },
  {
    id: 9,
    dimension: 'energia_sueno',
    focusCategory: 'estres',
    dimensionLabel: 'Energía y Descanso',
    dimensionIcon: 'moon-outline',
    question: '¿Despiertas con cansancio o te cuesta desconectarte para dormir en paz?',
    subtitle: 'Cuando tu cuerpo y tu mente piden a gritos una pausa reparadora.',
  },

  // --- 5. Inseguridad y Autoestima ---
  {
    id: 10,
    dimension: 'autoestima_social',
    focusCategory: 'inseguridad',
    dimensionLabel: 'Amor Propio y Confianza',
    dimensionIcon: 'sparkles-outline',
    question: '¿Has dudado de ti mismo/a, te comparas con otros o te juzgas con dureza?',
    subtitle: 'Pensamientos de inseguridad que no te dejan ver todo lo valioso/a que eres.',
  },
  {
    id: 11,
    dimension: 'autoestima_social',
    focusCategory: 'inseguridad',
    dimensionLabel: 'Amor Propio y Confianza',
    dimensionIcon: 'sparkles-outline',
    question: '¿Te cuesta reconocer tus logros o sentir orgullo por lo que haces cada día?',
    subtitle: 'Olvidar aplaudirte por todo lo que ya has superado.',
  },
  {
    id: 12,
    dimension: 'autoestima_social',
    focusCategory: 'inseguridad',
    dimensionLabel: 'Amor Propio y Confianza',
    dimensionIcon: 'sparkles-outline',
    question: '¿Te gustaría fortalecer tu seguridad personal y hablarte con más cariño esta semana?',
    subtitle: 'Dar pasos diarios para confiar más en ti y en tu camino.',
  },
];

export const buildInitialStreakState = (
  focusCategory: EmotionalFocusCategory,
  userId?: string,
  _existingUnlockedBadges: string[] = []
): EmotionalStreakState => {
  const normalizedCategory = normalizeTopicCategory(focusCategory);
  const topic = getTopicConfig(normalizedCategory);
  const meta = FOCUS_CATEGORY_META[normalizedCategory];

  return {
    id: `streak_${Date.now()}`,
    userId: userId || 'anonymous',
    isActive: true,
    status: 'active',
    focusCategory: normalizedCategory,
    focusTitle: meta.title,
    focusSubtitle: meta.subtitle,
    focusColor: topic.accentColor,
    focusEmoji: topic.emoji,
    startedAt: new Date().toISOString(),
    currentDayNumber: 1,
    completedDaysCount: 0,
    postponedDaysCount: 0,
    days: generateSevenDayTasksForUser(normalizedCategory, userId, 12),
    targetBadgeId: topic.badgeId,
    summaryPublished: false,
    lastUpdatedAt: new Date().toISOString(),
  };
};

export const calculateTestResult = (
  answers: Record<number, number>,
  userId?: string,
  existingUnlockedBadges: string[] = [],
  totalCompletedStreaks: number = 0
): TestResult => {
  let totalScore = 0;
  const maxPossibleScore = TEST_QUESTIONS.length * 3; // 12 * 3 = 36

  const dimensionTotals: Record<
    TestDimensionKey,
    { score: number; count: number; label: string; icon: string }
  > = {
    animo_depresion: { score: 0, count: 0, label: 'Ánimo y Calidez Interior', icon: 'heart' },
    ansiedad_sobrepensamiento: { score: 0, count: 0, label: 'Calma y Paz Mental', icon: 'pulse' },
    estres_agotamiento: { score: 0, count: 0, label: 'Liberación de Tensión y Enojo', icon: 'flame' },
    energia_sueno: { score: 0, count: 0, label: 'Descanso y Energía Vital', icon: 'moon' },
    autoestima_social: { score: 0, count: 0, label: 'Confianza y Amor Propio', icon: 'sparkles' },
  };

  const categoryTotals: Record<EmotionalFocusCategory, { score: number; count: number }> = {
    depresion: { score: 0, count: 0 },
    ansiedad: { score: 0, count: 0 },
    estres: { score: 0, count: 0 },
    amor_propio: { score: 0, count: 0 },
    tristeza: { score: 0, count: 0 },
    enojo: { score: 0, count: 0 },
    inseguridad: { score: 0, count: 0 },
    felicidad: { score: 0, count: 0 },
  };

  TEST_QUESTIONS.forEach((q) => {
    const val = answers[q.id] !== undefined ? answers[q.id] : 0;
    totalScore += val;
    dimensionTotals[q.dimension].score += val;
    dimensionTotals[q.dimension].count += 1;

    categoryTotals[q.focusCategory].score += val;
    categoryTotals[q.focusCategory].count += 1;
  });

  const overallPercentage = Math.round((totalScore / maxPossibleScore) * 100);

  // Determine the dominant emotional category to personalize the 7-day streak
  let dominantCategory: EmotionalFocusCategory = 'felicidad';
  if (totalScore <= 6) {
    dominantCategory = 'felicidad';
  } else {
    let highestAvg = -1;
    (['tristeza', 'ansiedad', 'enojo', 'inseguridad', 'estres'] as EmotionalFocusCategory[]).forEach(
      (cat) => {
        const cData = categoryTotals[cat];
        const avg = cData.count > 0 ? cData.score / cData.count : 0;
        if (avg > highestAvg) {
          highestAvg = avg;
          dominantCategory = cat;
        }
      }
    );
  }

  const focusMeta = FOCUS_CATEGORY_META[dominantCategory];

  // Compute Dimension Scores
  const dimensions: DimensionScore[] = Object.keys(dimensionTotals).map((key) => {
    const dKey = key as TestDimensionKey;
    const dData = dimensionTotals[dKey];
    const maxDimScore = Math.max(1, dData.count * 3);
    const pct = Math.round((dData.score / maxDimScore) * 100);

    let level: 'bajo' | 'moderado' | 'elevado' = 'bajo';
    let insight = '';

    if (pct < 35) {
      level = 'bajo';
      insight = 'Área en buen equilibrio hoy. Sigue cuidando tus hábitos.';
    } else if (pct < 68) {
      level = 'moderado';
      insight = 'Oportunidad para fortalecer esta área con pequeños retos diarios.';
    } else {
      level = 'elevado';
      insight = 'Prioridad en tu racha de 7 días: vamos a trabajar juntos aquí.';
    }

    return {
      key: dKey,
      label: dData.label,
      icon: dData.icon,
      score: dData.score,
      maxScore: maxDimScore,
      percentage: pct,
      level,
      insight,
    };
  });

  let levelTag: TestResult['levelTag'] = 'equilibrio';
  if (totalScore <= 7) levelTag = 'equilibrio';
  else if (totalScore <= 15) levelTag = 'estres_leve';
  else if (totalScore <= 23) levelTag = 'ansiedad_moderada';
  else if (totalScore <= 30) levelTag = 'depresion_significativa';
  else levelTag = 'alerta_alta';

  const streakState = buildInitialStreakState(
    dominantCategory,
    userId,
    existingUnlockedBadges
  );

  return {
    id: `test_${Date.now()}`,
    userId: userId || 'anonymous',
    createdAt: new Date().toISOString(),
    totalScore,
    maxPossibleScore,
    overallPercentage,
    levelTitle: focusMeta.title,
    levelTag,
    badgeColor: focusMeta.color,
    badgeTextColor: '#FFFFFF',
    summary: focusMeta.animaPrompt,
    detailedAnalysis: focusMeta.subtitle,
    dimensions,
    recommendations: streakState.days.slice(0, 3).map((d) => `${d.task.emoji} ${d.task.title}: ${d.task.description}`),
    suggestedSpecialty: 'Acompañamiento Emocional y Bienestar',
    focusCategory: dominantCategory,
    animaInvitationMessage: focusMeta.animaPrompt,
    streakState,
    unlockedBadges: existingUnlockedBadges,
    totalCompletedStreaks,
  };
};
