import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEST_QUESTIONS, TEST_OPTIONS, calculateTestResult } from '../../data/psychologyTestQuestions';
import { TestResult } from '../../types/psychologyTest';
import { saveLatestTestResult } from '../../services/psychologyTestService';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PsychologyTestModalProps {
  visible: boolean;
  userId?: string;
  initialResult?: TestResult | null;
  startMode?: 'questionnaire' | 'result';
  onClose: () => void;
  onOpenPsychologists: () => void;
  onOpenCreatePost: () => void;
  onTestCompleted?: (result: TestResult) => void;
}

export const PsychologyTestModal: React.FC<PsychologyTestModalProps> = ({
  visible,
  userId,
  initialResult = null,
  startMode = 'questionnaire',
  onClose,
  onOpenPsychologists,
  onOpenCreatePost,
  onTestCompleted,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  React.useEffect(() => {
    if (visible) {
      if (startMode === 'result' && initialResult) {
        setResult(initialResult);
      } else {
        setResult(null);
        setCurrentIndex(0);
        setAnswers({});
      }
    }
  }, [visible, startMode, initialResult]);

  if (!visible) return null;

  const currentQuestion = TEST_QUESTIONS[currentIndex];
  const totalQuestions = TEST_QUESTIONS.length;
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;
  const currentAnswer = answers[currentQuestion?.id];

  const handleSelectOption = (value: number) => {
    const updated = { ...answers, [currentQuestion.id]: value };
    setAnswers(updated);

    // Auto-advance with smooth brief delay
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        handleFinishTest(updated);
      }
    }, 280);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinishTest(answers);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinishTest = async (finalAnswers: Record<number, number>) => {
    setIsEvaluating(true);
    const computedResult = calculateTestResult(finalAnswers, userId);

    await saveLatestTestResult(computedResult, userId);

    setTimeout(() => {
      setIsEvaluating(false);
      setResult(computedResult);
      if (onTestCompleted) {
        onTestCompleted(computedResult);
      }
    }, 550);
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
  };

  const handleShareResult = () => {
    if (!result) return;
    Share.share({
      message: `Realicé mi autoevaluación emocional en "Entre Nosotros". Resultado: ${result.levelTitle}. Cuidar nuestra salud mental es importante.`,
    });
  };

  const renderOptionCard = (option: typeof TEST_OPTIONS[0]) => {
    const isSelected = currentAnswer === option.value;
    return (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.gridOptionCard,
          isSelected && styles.gridOptionCardSelected,
        ]}
        onPress={() => handleSelectOption(option.value)}
        activeOpacity={0.82}
      >
        {/* Top Number indicator */}
        <View style={[styles.gridNumberBadge, isSelected && styles.gridNumberBadgeSelected]}>
          <Text style={[styles.gridNumberText, isSelected && styles.gridNumberTextSelected]}>
            {option.value}
          </Text>
        </View>

        {/* Emoji Circle */}
        <View style={[styles.gridEmojiCircle, isSelected && styles.gridEmojiCircleSelected]}>
          <Text style={styles.gridEmoji}>{option.emoji}</Text>
        </View>

        {/* Label & Sublabel */}
        <Text style={[styles.gridOptionLabel, isSelected && styles.gridOptionLabelSelected]}>
          {option.label}
        </Text>
        <Text style={[styles.gridOptionSublabel, isSelected && styles.gridOptionSublabelSelected]}>
          {option.sublabel}
        </Text>

        {/* Checkmark when selected */}
        {isSelected && (
          <View style={styles.gridCheckmark}>
            <Ionicons name="checkmark-circle" size={17} color={colors.coffeePrimary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={colors.coffeeDark} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerMainTitle}>
              {result ? 'Resultados del Test' : 'Evaluación Emocional'}
            </Text>
            <Text style={styles.headerSubTitle}>
              {result ? 'Autodiagnóstico orientativo' : `Pregunta ${currentIndex + 1} de ${totalQuestions}`}
            </Text>
          </View>

          {result ? (
            <TouchableOpacity onPress={handleShareResult} style={styles.headerActionBtn} activeOpacity={0.7}>
              <Ionicons name="share-social-outline" size={18} color={colors.coffeePrimary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleRestart} style={styles.headerActionBtn} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={18} color={colors.coffeePrimary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar (during questions) */}
        {!result && (
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>
        )}

        {isEvaluating ? (
          <View style={styles.evaluatingContainer}>
            <ActivityIndicator size="large" color={colors.coffeePrimary} />
            <Text style={styles.evaluatingTitle}>Procesando tu autoevaluación...</Text>
            <Text style={styles.evaluatingDesc}>
              Analizando dimensiones de estado de ánimo, ansiedad, estrés y descanso.
            </Text>
          </View>
        ) : result ? (
          /* =================== CLEAN RESULTS DASHBOARD =================== */
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.resultScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Level Summary Card */}
            <View style={styles.resultHeroCard}>
              <View style={[styles.badgeTag, { backgroundColor: result.badgeColor + '18' }]}>
                <Ionicons name="shield-checkmark" size={14} color={result.badgeColor} style={{ marginRight: 6 }} />
                <Text style={[styles.badgeTagText, { color: result.badgeColor }]}>{result.levelTitle}</Text>
              </View>

              <Text style={styles.heroSummaryText}>{result.summary}</Text>

              {/* Score Meter */}
              <View style={styles.scoreMeterContainer}>
                <View style={styles.scoreMeterRow}>
                  <Text style={styles.scoreMeterLabel}>Índice de Malestar Emocional:</Text>
                  <Text style={[styles.scoreMeterValue, { color: result.badgeColor }]}>
                    {result.totalScore} / {result.maxPossibleScore} pts
                  </Text>
                </View>
                <View style={styles.meterTrack}>
                  <View
                    style={[
                      styles.meterFill,
                      { width: `${result.overallPercentage}%`, backgroundColor: result.badgeColor },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Detailed Psychological Analysis */}
            <View style={styles.cardSection}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconCircle}>
                  <Ionicons name="analytics-outline" size={17} color={colors.coffeePrimary} />
                </View>
                <Text style={styles.cardHeaderTitle}>Análisis Orientativo</Text>
              </View>
              <Text style={styles.detailedAnalysisText}>{result.detailedAnalysis}</Text>
            </View>

            {/* Dimension Breakdown Cards */}
            <View style={styles.cardSection}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconCircle}>
                  <Ionicons name="pie-chart-outline" size={17} color={colors.coffeePrimary} />
                </View>
                <Text style={styles.cardHeaderTitle}>Desglose por Áreas</Text>
              </View>

              <View style={styles.dimensionsList}>
                {result.dimensions.map((dim) => {
                  const levelColor =
                    dim.level === 'bajo'
                      ? '#10B981'
                      : dim.level === 'moderado'
                      ? '#F59E0B'
                      : '#EF4444';

                  return (
                    <View key={dim.key} style={styles.dimensionCard}>
                      <View style={styles.dimCardHeader}>
                        <View style={styles.dimTitleRow}>
                          <Ionicons
                            name={(dim.icon + '-outline') as any}
                            size={15}
                            color={colors.coffeePrimary}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.dimLabel}>{dim.label}</Text>
                        </View>
                        <View style={[styles.dimLevelTag, { backgroundColor: levelColor + '18' }]}>
                          <Text style={[styles.dimLevelText, { color: levelColor }]}>
                            {dim.level.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {/* Bar */}
                      <View style={styles.dimBarTrack}>
                        <View
                          style={[
                            styles.dimBarFill,
                            { width: `${dim.percentage}%`, backgroundColor: levelColor },
                          ]}
                        />
                      </View>

                      <Text style={styles.dimInsightText}>{dim.insight}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Recommendations Section */}
            <View style={styles.cardSection}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconCircle}>
                  <Ionicons name="bulb-outline" size={17} color={colors.coffeePrimary} />
                </View>
                <Text style={styles.cardHeaderTitle}>Consejos de Acompañamiento</Text>
              </View>

              <View style={styles.recommendationsList}>
                {result.recommendations.map((rec, rIdx) => (
                  <View key={rIdx} style={styles.recommendationItem}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.coffeePrimary} style={styles.recCheck} />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Ethical Disclaimer */}
            <View style={styles.disclaimerBox}>
              <Ionicons name="information-circle-outline" size={18} color={colors.coffeePrimary} style={{ marginRight: 8 }} />
              <Text style={styles.disclaimerText}>
                Este test es una herramienta de orientación y autoconocimiento. No sustituye un diagnóstico clínico formal. Si sientes que tus emociones te abruman, hablar con un especialista te brindará el apoyo adecuado.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.resultActionsContainer}>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                activeOpacity={0.88}
                onPress={() => {
                  onClose();
                  onOpenPsychologists();
                }}
              >
                <Ionicons name="people" size={17} color={colors.white} />
                <Text style={styles.primaryActionBtnText}>Ver Especialistas</Text>
                <Ionicons name="arrow-forward" size={15} color={colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                activeOpacity={0.88}
                onPress={() => {
                  onClose();
                  onOpenCreatePost();
                }}
              >
                <Ionicons name="heart-half-outline" size={17} color={colors.coffeeDark} />
                <Text style={styles.secondaryActionBtnText}>Desahogarme en la comunidad</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tertiaryActionBtn} activeOpacity={0.7} onPress={handleRestart}>
                <Ionicons name="refresh-outline" size={15} color={colors.textSecondary} />
                <Text style={styles.tertiaryActionBtnText}>Repetir autoevaluación</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          /* =================== 2X2 GRID QUESTIONNAIRE =================== */
          <View style={styles.questionnaireBody}>
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={styles.questionScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Centered Category Pill */}
              <View style={styles.categoryPillCenter}>
                <Ionicons
                  name={currentQuestion.dimensionIcon as any}
                  size={14}
                  color={colors.coffeePrimary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.categoryPillText}>{currentQuestion.dimensionLabel}</Text>
              </View>

              {/* Centered Question Text */}
              <Text style={styles.questionMainText}>{currentQuestion.question}</Text>
              <Text style={styles.questionSubText}>{currentQuestion.subtitle}</Text>

              {/* 2X2 GRID OF OPTIONS */}
              <View style={styles.grid2x2Container}>
                {/* Row 1: 0 & 1 */}
                <View style={styles.gridRow}>
                  {renderOptionCard(TEST_OPTIONS[0])}
                  {renderOptionCard(TEST_OPTIONS[1])}
                </View>

                {/* Row 2: 2 & 3 */}
                <View style={styles.gridRow}>
                  {renderOptionCard(TEST_OPTIONS[2])}
                  {renderOptionCard(TEST_OPTIONS[3])}
                </View>
              </View>
            </ScrollView>

            {/* Discrete / Small Bottom Navigation Row */}
            <View style={styles.bottomNavigationRow}>
              <TouchableOpacity
                style={[styles.navBtnDiscrete, currentIndex === 0 && styles.navBtnDisabled]}
                disabled={currentIndex === 0}
                onPress={handlePrevious}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color={currentIndex === 0 ? '#C4B7AE' : colors.coffeeDark}
                />
                <Text
                  style={[
                    styles.navBtnDiscreteText,
                    currentIndex === 0 && styles.navBtnDiscreteTextDisabled,
                  ]}
                >
                  Anterior
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navBtnSmallPrimary,
                  currentAnswer === undefined && styles.navBtnSmallPrimaryDisabled,
                ]}
                disabled={currentAnswer === undefined}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.navBtnSmallPrimaryText}>
                  {currentIndex === totalQuestions - 1 ? 'Finalizar' : 'Siguiente'}
                </Text>
                <Ionicons name="chevron-forward" size={15} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  headerSubTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  headerActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: '#EAE3DF',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.coffeePrimary,
  },
  questionnaireBody: {
    flex: 1,
  },
  scrollBody: {
    flex: 1,
  },
  questionScrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  /* Centered Category Pill */
  categoryPillCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#F3EAE3',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5D5C8',
    marginBottom: 14,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  questionMainText: {
    fontSize: 18.5,
    fontWeight: '800',
    color: colors.coffeeDark,
    lineHeight: 25,
    textAlign: 'center',
    marginBottom: 6,
  },
  questionSubText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  /* 2X2 GRID */
  grid2x2Container: {
    gap: 12,
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  gridOptionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  gridOptionCardSelected: {
    backgroundColor: '#FAF5F1',
    borderColor: colors.coffeePrimary,
    borderWidth: 2,
  },
  gridNumberBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridNumberBadgeSelected: {
    backgroundColor: '#F3EAE3',
  },
  gridNumberText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  gridNumberTextSelected: {
    color: colors.coffeePrimary,
  },
  gridEmojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  gridEmojiCircleSelected: {
    backgroundColor: '#F3EAE3',
    borderColor: colors.coffeePrimary,
  },
  gridEmoji: {
    fontSize: 26,
  },
  gridOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.coffeeDark,
    textAlign: 'center',
    marginBottom: 2,
  },
  gridOptionLabelSelected: {
    color: colors.coffeePrimary,
    fontWeight: '800',
  },
  gridOptionSublabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  gridOptionSublabelSelected: {
    color: colors.coffeeDark,
  },
  gridCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  /* Discreet Bottom Navigation */
  bottomNavigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  navBtnDiscrete: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    gap: 4,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnDiscreteText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  navBtnDiscreteTextDisabled: {
    color: '#C4B7AE',
  },
  navBtnSmallPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.coffeePrimary,
    gap: 4,
  },
  navBtnSmallPrimaryDisabled: {
    opacity: 0.45,
  },
  navBtnSmallPrimaryText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.white,
  },
  /* Evaluating Spinner */
  evaluatingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 10,
  },
  evaluatingTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
  },
  evaluatingDesc: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  /* Results Styles */
  resultScrollContent: {
    padding: 16,
    paddingBottom: 36,
    gap: 12,
  },
  resultHeroCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 10,
  },
  badgeTagText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  heroSummaryText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.coffeeDark,
    fontWeight: '600',
    marginBottom: 14,
  },
  scoreMeterContainer: {
    backgroundColor: '#FAF7F5',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EAE3DF',
  },
  scoreMeterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreMeterLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scoreMeterValue: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  meterTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAE3DF',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardSection: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  cardIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  detailedAnalysisText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textPrimary,
  },
  dimensionsList: {
    gap: 10,
  },
  dimensionCard: {
    backgroundColor: '#FAF7F5',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EAE3DF',
  },
  dimCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dimTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dimLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  dimLevelTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dimLevelText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  dimBarTrack: {
    height: 5,
    backgroundColor: '#E5DCD6',
    borderRadius: 2.5,
    marginBottom: 6,
    overflow: 'hidden',
  },
  dimBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  dimInsightText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  recommendationsList: {
    gap: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  recCheck: {
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAF7F5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAE3DF',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: colors.coffeeDark,
    lineHeight: 15.5,
  },
  resultActionsContainer: {
    gap: 8,
    marginTop: 4,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coffeePrimary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 6,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryActionBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.white,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    gap: 6,
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  tertiaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  tertiaryActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
