export type TestDimensionKey =
  | 'animo_depresion'
  | 'ansiedad_sobrepensamiento'
  | 'estres_agotamiento'
  | 'energia_sueno'
  | 'autoestima_social';

export interface TestOption {
  value: number; // 0, 1, 2, 3
  emoji: string;
  label: string;
  sublabel: string;
}

export interface TestQuestion {
  id: number;
  dimension: TestDimensionKey;
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
}
