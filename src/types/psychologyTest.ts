export type TestDimensionKey =
  | 'animo_depresion'
  | 'ansiedad_sobrepensamiento'
  | 'estres_agotamiento'
  | 'energia_sueno'
  | 'autoestima_social';

export type EmotionalFocusCategory =
  | 'tristeza'
  | 'ansiedad'
  | 'enojo'
  | 'inseguridad'
  | 'estres'
  | 'felicidad';

export interface TestOption {
  value: number; // 0, 1, 2, 3
  emoji: string;
  label: string;
  sublabel: string;
}

export interface TestQuestion {
  id: number;
  dimension: TestDimensionKey;
  focusCategory: EmotionalFocusCategory;
  dimensionLabel: string;
  dimensionIcon: string;
  question: string;
  subtitle: string;
}

export interface DimensionScore {
  key: TestDimensionKey;
  label: string;
  icon: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: 'bajo' | 'moderado' | 'elevado';
  insight: string;
}

export interface StreakTaskItem {
  id: string;
  category: EmotionalFocusCategory;
  title: string;
  description: string;
  emoji: string;
}

export interface StreakDayProgress {
  dayNumber: number; // 1..7
  dayName: string; // e.g., "Día 1 • Lunes"
  task: StreakTaskItem;
  status: 'locked' | 'unlocked' | 'completed' | 'postponed';
  completedAt?: string;
  evidenceImageUrl?: string;
  evidenceNote?: string;
  postId?: string;
  postponedCount?: number;
  motivationalQuoteUsed?: string;
}

export interface StreakBadge {
  id: string;
  level: number; // 1, 2, 3, 4
  name: string;
  levelLabel: string;
  subtitle: string;
  description: string;
  emoji: string;
  icon: string;
  color: string;
  softBg: string;
  borderColor: string;
  unlockedAt?: string;
}

export interface EmotionalStreakState {
  id: string;
  userId: string;
  isActive: boolean;
  status: 'invited' | 'active' | 'completed';
  focusCategory: EmotionalFocusCategory;
  focusTitle: string;
  focusSubtitle: string;
  focusColor: string;
  focusEmoji: string;
  startedAt: string;
  completedAt?: string;
  currentDayNumber: number; // 1..7
  completedDaysCount: number; // 0..7
  postponedDaysCount: number;
  days: StreakDayProgress[];
  targetBadgeId: string;
  summaryPublished?: boolean;
  lastUpdatedAt: string;
}

export interface TestResult {
  id: string;
  userId?: string;
  createdAt: string; // ISO String
  totalScore: number;
  maxPossibleScore: number;
  overallPercentage: number;
  levelTitle: string;
  levelTag: 'equilibrio' | 'estres_leve' | 'ansiedad_moderada' | 'depresion_significativa' | 'alerta_alta';
  badgeColor: string;
  badgeTextColor: string;
  summary: string;
  detailedAnalysis: string;
  dimensions: DimensionScore[];
  recommendations: string[];
  suggestedSpecialty: string;
  // New Emotional Streak & Badges system fields
  focusCategory?: EmotionalFocusCategory;
  animaInvitationMessage?: string;
  streakState?: EmotionalStreakState;
  unlockedBadges?: string[];
  totalCompletedStreaks?: number;
}
