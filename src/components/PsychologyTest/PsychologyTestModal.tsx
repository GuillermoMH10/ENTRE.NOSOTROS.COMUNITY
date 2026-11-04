import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  TEST_QUESTIONS,
  TEST_OPTIONS,
  calculateTestResult,
} from '../../data/psychologyTestQuestions';
import {
  OFFICIAL_STREAK_BADGES,
  FOCUS_CATEGORY_META,
  getRandomStreakMotivationalQuote,
} from '../../data/streakChallengesData';
import { TestResult } from '../../types/psychologyTest';
import {
  saveLatestTestResult,
  acceptEmotionalStreak,
  completeStreakDayWithEvidence,
  postponeStreakDayWithEncouragement,
  publishFullStreakSummaryToFeed,
  startNextSevenDayStreak,
  normalizeTestResultWithStreak,
} from '../../services/psychologyTestService';
import { useAuth } from '../../context/AuthContext';
import { AnimaToastHost, showAnimaToast } from '../Anima/AnimaToast';
import { colors } from '../../theme/colors';

interface PsychologyTestModalProps {
  visible: boolean;
  userId?: string;
  initialResult?: TestResult | null;
  startMode?: 'questionnaire' | 'result';
  onClose: () => void;
  onOpenPsychologists: () => void;
  onOpenCreatePost: () => void;
  onTestCompleted?: (result: TestResult) => void;
  onRequireAuth?: () => void;
  embedded?: boolean;
}

export const PsychologyTestModal: React.FC<PsychologyTestModalProps> = ({
  visible,
  userId,
  initialResult = null,
  startMode = 'questionnaire',
  onClose,
  onOpenPsychologists,
  onTestCompleted,
  onRequireAuth,
  embedded = false,
}) => {
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && windowWidth >= 1024;
  const isEmbeddedMode = embedded || isDesktop;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  // Active Day selection in 7-Day Streak view (1..7)
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [evidencePhotoUri, setEvidencePhotoUri] = useState<string | null>(null);
  const [evidenceNote, setEvidenceNote] = useState<string>('');
  const [isSubmittingDay, setIsSubmittingDay] = useState<boolean>(false);
  const [postponedEncouragementQuote, setPostponedEncouragementQuote] = useState<string | null>(null);

  // Final 7-day summary celebration state
  const [celebrationQuote, setCelebrationQuote] = useState<string>(() =>
    getRandomStreakMotivationalQuote()
  );
  const [summaryPostText, setSummaryPostText] = useState<string>(
    '¡Lo logré! Completé mi racha de 7 días paso a paso sin rendirme y desbloqueé mi nueva insignia en Entre Nosotros 🔥💙'
  );
  const [isPublishingSummary, setIsPublishingSummary] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      const activeUid = user?.id || userId;
      const isMatchingUser =
        !initialResult?.userId ||
        initialResult.userId === (activeUid || 'anonymous') ||
        (activeUid && initialResult.userId === activeUid);

      if (startMode === 'result' && initialResult && isMatchingUser) {
        const normalized = normalizeTestResultWithStreak(initialResult, activeUid);
        setResult(normalized);
        setSelectedDayNum(normalized.streakState?.currentDayNumber || 1);
      } else {
        setResult(null);
        setCurrentIndex(0);
        setAnswers({});
      }
      setEvidencePhotoUri(null);
      setEvidenceNote('');
      setPostponedEncouragementQuote(null);
    }
  }, [visible, startMode, initialResult, userId, user?.id]);

  if (!visible) return null;

  const currentQuestion = TEST_QUESTIONS[currentIndex];
  const totalQuestions = TEST_QUESTIONS.length;
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;
  const currentAnswer = answers[currentQuestion?.id];

  const handleSelectOption = (value: number) => {
    const updated = { ...answers, [currentQuestion.id]: value };
    setAnswers(updated);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        handleFinishTest(updated);
      }
    }, 250);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinishTest = async (finalAnswers: Record<number, number>) => {
    setIsEvaluating(true);
    const activeUid = user?.id || userId;
    const prevBadges = initialResult?.unlockedBadges || result?.unlockedBadges || [];
    const prevCount = initialResult?.totalCompletedStreaks || result?.totalCompletedStreaks || 0;

    const computedResult = calculateTestResult(
      finalAnswers,
      activeUid,
      prevBadges,
      prevCount
    );

    const saved = await saveLatestTestResult(computedResult, activeUid);

    setTimeout(() => {
      setIsEvaluating(false);
      setResult(saved);
      setSelectedDayNum(1);
      if (onTestCompleted) {
        onTestCompleted(saved);
      }
      showAnimaToast({
        title: 'He preparado un camino para ti 🌱',
        message: 'Mira tu propuesta personalizada de 7 días para avanzar juntos paso a paso.',
        emoji: '💙',
        accentColor: saved.badgeColor || '#FF7A00',
      });
    }, 450);
  };

  const handleRestartQuestionnaire = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setEvidencePhotoUri(null);
    setEvidenceNote('');
    setPostponedEncouragementQuote(null);
  };

  // Accept the 7-day streak
  const handleAcceptStreak = async () => {
    if (!result) return;
    const activeUid = user?.id || userId;
    const updated = await acceptEmotionalStreak(result, activeUid);
    setResult(updated);
    setSelectedDayNum(updated.streakState?.currentDayNumber || 1);
    if (onTestCompleted) {
      onTestCompleted(updated);
    }
  };

  // Pick evidence image from gallery
  const handlePickEvidencePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso necesario',
          'Necesitamos acceso a tus fotos para subir la evidencia de tu reto del día.'
        );
        return;
      }

      const pickerRes = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.45,
        base64: true,
      });

      if (!pickerRes.canceled && pickerRes.assets && pickerRes.assets[0]) {
        const asset = pickerRes.assets[0];
        const source = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setEvidencePhotoUri(source);
      }
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen de evidencia.');
    }
  };

  // Submit daily evidence & publish to community feed
  const handleCompleteDay = async () => {
    if (!result || !result.streakState) return;
    if (!user) {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        Alert.alert(
          'Inicia sesión',
          'Necesitas iniciar sesión en tu cuenta para publicar tu evidencia diaria en la comunidad y guardar tu racha.'
        );
      }
      return;
    }

    if (!evidencePhotoUri) {
      showAnimaToast({
        title: 'Falta tu foto de evidencia 📸',
        message: 'Agrega una foto sencilla de tu reto de hoy para compartir tu avance y encender tu día en la racha.',
        emoji: '📸',
        accentColor: '#F59E0B',
      });
      return;
    }

    try {
      setIsSubmittingDay(true);
      const { updatedResult } = await completeStreakDayWithEvidence({
        currentResult: result,
        dayNumber: selectedDayNum,
        mediaSource: evidencePhotoUri,
        userNote: evidenceNote,
        authorId: user.id,
        authorUsername: user.username,
        authorAvatarUrl: user.avatarUrl,
      });

      setResult(updatedResult);
      setEvidencePhotoUri(null);
      setEvidenceNote('');
      setPostponedEncouragementQuote(null);
      setSelectedDayNum(updatedResult.streakState?.currentDayNumber || 7);
      setCelebrationQuote(getRandomStreakMotivationalQuote());

      if (onTestCompleted) {
        onTestCompleted(updatedResult);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo subir la evidencia de hoy.');
    } finally {
      setIsSubmittingDay(false);
    }
  };

  // Postpone / Shift day when user couldn't complete it today
  const handlePostponeDay = async () => {
    if (!result || !result.streakState) return;
    const activeUid = user?.id || userId;
    const { updatedResult, quote } = await postponeStreakDayWithEncouragement(
      result,
      selectedDayNum,
      activeUid
    );
    setResult(updatedResult);
    setPostponedEncouragementQuote(quote);
    if (onTestCompleted) {
      onTestCompleted(updatedResult);
    }
  };

  // Publish full 7-day summary album + badge to the community feed
  const handlePublishSevenDaySummary = async () => {
    if (!result || !result.streakState) return;
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    try {
      setIsPublishingSummary(true);
      const updated = await publishFullStreakSummaryToFeed({
        currentResult: result,
        customCelebrationMessage: summaryPostText,
        authorId: user.id,
        authorUsername: user.username,
        authorAvatarUrl: user.avatarUrl,
      });
      setResult(updated);
      if (onTestCompleted) {
        onTestCompleted(updated);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo publicar tu resumen en la comunidad.');
    } finally {
      setIsPublishingSummary(false);
    }
  };

  // Start next 7-day streak for the next badge level
  const handleStartNextStreak = async () => {
    if (!result) return;
    const activeUid = user?.id || userId;
    const updated = await startNextSevenDayStreak(result, activeUid);
    setResult(updated);
    setSelectedDayNum(1);
    setEvidencePhotoUri(null);
    setEvidenceNote('');
    if (onTestCompleted) {
      onTestCompleted(updated);
    }
  };

  const streak = result?.streakState;
  const focusMeta = result?.focusCategory
    ? FOCUS_CATEGORY_META[result.focusCategory]
    : FOCUS_CATEGORY_META.tristeza;

  const targetBadge =
    OFFICIAL_STREAK_BADGES.find((b) => b.id === streak?.targetBadgeId) ||
    OFFICIAL_STREAK_BADGES[0];

  const activeDayObj =
    streak?.days.find((d) => d.dayNumber === selectedDayNum) || streak?.days[0];

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
        <View style={[styles.gridEmojiCircle, isSelected && styles.gridEmojiCircleSelected]}>
          <Text style={styles.gridEmoji}>{option.emoji}</Text>
        </View>
        <Text style={[styles.gridOptionLabel, isSelected && styles.gridOptionLabelSelected]}>
          {option.label}
        </Text>
        <Text style={[styles.gridOptionSublabel, isSelected && styles.gridOptionSublabelSelected]}>
          {option.sublabel}
        </Text>
        {isSelected && (
          <View style={styles.gridCheckmark}>
            <Ionicons name="checkmark-circle" size={18} color="#FF7A00" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const modalContent = (
    <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopSafeArea]}>
      <AnimaToastHost topOffset={12} />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={20} color={colors.coffeeDark} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerMainTitle}>
            {!result
              ? 'Mi Impulso Emocional'
              : streak?.status === 'completed'
              ? '¡Camino de 7 Días Logrado! 🏆'
              : streak?.isActive
              ? 'Mi Racha de 7 Días 🔥'
              : 'Tu Ruta con ANIMA 💙'}
          </Text>
          <Text style={styles.headerSubTitle}>
            {!result
              ? `Paso ${currentIndex + 1} de ${totalQuestions}`
              : `${ streak?.completedDaysCount || 0 } de 7 días completados`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleRestartQuestionnaire}
          style={styles.headerActionBtn}
          activeOpacity={0.7}
          accessibilityLabel="Nuevo test"
        >
          <Ionicons name="refresh-outline" size={18} color={colors.coffeePrimary} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar during questionnaire */}
      {!result && (
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
      )}

      {isEvaluating ? (
        <View style={styles.evaluatingContainer}>
          <Image
            source={require('../../../assets/perfilANIMA.png')}
            style={styles.evaluatingAnimaImg}
            resizeMode="cover"
          />
          <ActivityIndicator size="large" color="#FF7A00" style={{ marginVertical: 14 }} />
          <Text style={styles.evaluatingTitle}>ANIMA está armando tu ruta de 7 días...</Text>
          <Text style={styles.evaluatingDesc}>
            Seleccionando 7 pequeños retos diarios e insignias personalizadas para ti.
          </Text>
        </View>
      ) : !result ? (
        /* =================== VIEW 1: EMPATHETIC QUESTIONNAIRE =================== */
        <View style={styles.questionContainer}>
          {/* ANIMA Companion Strip */}
          <View style={styles.questionAnimaBanner}>
            <Image
              source={require('../../../assets/perfilANIMA.png')}
              style={styles.questionAnimaAvatar}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.questionAnimaTitle}>Cuéntame cómo te has sentido 💙</Text>
              <Text style={styles.questionAnimaSub}>
                No es un examen: tus respuestas me ayudarán a darte retos sencillos para sentirte mejor.
              </Text>
            </View>
          </View>

          <View style={styles.dimensionPill}>
            <Ionicons
              name={currentQuestion.dimensionIcon as any}
              size={14}
              color="#FF7A00"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.dimensionPillText}>{currentQuestion.dimensionLabel}</Text>
          </View>

          <View style={styles.questionBox}>
            <Text style={styles.questionTitleText}>{currentQuestion.question}</Text>
            <Text style={styles.questionSubtitleText}>{currentQuestion.subtitle}</Text>
          </View>

          <View style={styles.optionsGridContainer}>
            <View style={styles.optionsGridRow}>
              {renderOptionCard(TEST_OPTIONS[0])}
              {renderOptionCard(TEST_OPTIONS[1])}
            </View>
            <View style={styles.optionsGridRow}>
              {renderOptionCard(TEST_OPTIONS[2])}
              {renderOptionCard(TEST_OPTIONS[3])}
            </View>
          </View>

          <View style={styles.bottomNavRow}>
            <TouchableOpacity
              style={[styles.navControlBtn, currentIndex === 0 && styles.navControlBtnDisabled]}
              onPress={handlePrevious}
              disabled={currentIndex === 0}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={currentIndex === 0 ? colors.textMuted : colors.coffeeDark}
              />
              <Text
                style={[
                  styles.navControlText,
                  currentIndex === 0 && { color: colors.textMuted },
                ]}
              >
                Anterior
              </Text>
            </TouchableOpacity>

            <Text style={styles.stepIndicatorText}>
              {currentIndex + 1} / {totalQuestions}
            </Text>

            <View style={{ width: 82 }} />
          </View>
        </View>
      ) : streak && !streak.isActive && streak.status === 'invited' ? (
        /* =================== VIEW 2: ANIMA INVITATION TO ACCEPT THE 7-DAY STREAK =================== */
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {/* ANIMA Invitation Hero Card */}
          <View style={[styles.invitationHeroCard, { borderColor: focusMeta.color + '55' }]}>
            <View style={styles.invitationAnimaRow}>
              <Image
                source={require('../../../assets/perfilANIMA.png')}
                style={[styles.invitationAnimaAvatar, { borderColor: focusMeta.color }]}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <View style={[styles.focusPillTag, { backgroundColor: focusMeta.softBg }]}>
                  <Text style={styles.focusPillEmoji}>{focusMeta.emoji}</Text>
                  <Text style={[styles.focusPillText, { color: focusMeta.color }]}>
                    {focusMeta.title}
                  </Text>
                </View>
                <Text style={styles.invitationAnimaName}>Mensaje de ANIMA para ti</Text>
              </View>
            </View>

            <View style={styles.animaSpeechBox}>
              <Text style={styles.animaSpeechText}>{focusMeta.animaPrompt}</Text>
            </View>

            {/* Target Badge Preview inside Invitation */}
            <View style={[styles.targetBadgePreviewBox, { backgroundColor: targetBadge.softBg, borderColor: targetBadge.borderColor }]}>
              <View style={styles.targetBadgeIconBubble}>
                <Text style={{ fontSize: 26 }}>{targetBadge.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.targetBadgeLevelText, { color: targetBadge.color }]}>
                  RECOMPENSA AL DÍA 7 • {targetBadge.levelLabel}
                </Text>
                <Text style={styles.targetBadgeNameText}>
                  Insignia: {targetBadge.name}
                </Text>
                <Text style={styles.targetBadgeDescText}>
                  Se desbloqueará en tu Perfil al completar tus 7 retos sencillos.
                </Text>
              </View>
            </View>

            {/* Primary Accept Streak CTA Button */}
            <TouchableOpacity
              style={styles.acceptStreakPrimaryBtn}
              onPress={handleAcceptStreak}
              activeOpacity={0.88}
            >
              <Ionicons name="flame" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.acceptStreakPrimaryBtnText}>
                ¡Sí, acepto iniciar mi Racha de 7 Días!
              </Text>
            </TouchableOpacity>
          </View>

          {/* Preview of the 7 Personalized Daily Challenges */}
          <View style={styles.cardSection}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconCircle, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="calendar" size={17} color="#FF7A00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>
                  Tu Plan de 7 Días (Retos Sencillos)
                </Text>
                <Text style={styles.cardHeaderSub}>
                  Sorteados especialmente para ti entre más de 100 actividades:
                </Text>
              </View>
            </View>

            {streak.days.map((d) => (
              <View key={d.dayNumber} style={styles.previewDayRow}>
                <View style={styles.previewDayCircle}>
                  <Text style={styles.previewDayNumText}>D{d.dayNumber}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewDayTaskTitle}>
                    {d.task.emoji} {d.task.title}
                  </Text>
                  <Text style={styles.previewDayTaskDesc} numberOfLines={2}>
                    {d.task.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Optional Support Link */}
          <TouchableOpacity
            style={styles.secondaryPsicoBtn}
            onPress={() => {
              onClose();
              onOpenPsychologists();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="medkit-outline" size={16} color={colors.coffeePrimary} style={{ marginRight: 6 }} />
            <Text style={styles.secondaryPsicoBtnText}>
              También quiero ver psicólogos especialistas
            </Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      ) : streak && streak.status === 'completed' ? (
        /* =================== VIEW 4: CELEBRATION "EL CAMINO RECORRIDO" + FULL SUMMARY POST =================== */
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {/* Celebration Banner & Unlocked Badge */}
          <View style={[styles.celebrationHeroCard, { borderColor: targetBadge.color }]}>
            <View style={[styles.unlockedBadgeCircle, { backgroundColor: targetBadge.softBg, borderColor: targetBadge.borderColor }]}>
              <Text style={{ fontSize: 42 }}>{targetBadge.emoji}</Text>
            </View>
            <View style={[styles.levelPillBadge, { backgroundColor: targetBadge.color }]}>
              <Text style={styles.levelPillBadgeText}>
                ¡INSIGNIA DESBLOQUEADA! • {targetBadge.levelLabel}
              </Text>
            </View>
            <Text style={styles.celebrationTitle}>{targetBadge.name}</Text>
            <Text style={styles.celebrationSubtitle}>{targetBadge.description}</Text>

            {/* Motivational Quote from the 50 Phrases Bank */}
            <View style={styles.celebrationQuoteBox}>
              <View style={styles.celebrationQuoteHeader}>
                <Image
                  source={require('../../../assets/perfilANIMA.png')}
                  style={styles.miniAnimaAvatar}
                  resizeMode="cover"
                />
                <Text style={styles.celebrationQuoteAnimaLabel}>
                  Palabras de ANIMA para celebrar tu logro:
                </Text>
                <TouchableOpacity
                  onPress={() => setCelebrationQuote(getRandomStreakMotivationalQuote())}
                  style={styles.nextQuoteMiniBtn}
                >
                  <Ionicons name="reload" size={13} color="#FF7A00" />
                  <Text style={styles.nextQuoteMiniBtnText}>Otra frase</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.celebrationQuoteText}>"{celebrationQuote}"</Text>
            </View>
          </View>

          {/* Publish Full 7-Day Album & Badge to Community */}
          <View style={styles.publishSummaryCard}>
            <View style={styles.publishSummaryHeader}>
              <Ionicons name="sparkles" size={18} color="#FF7A00" style={{ marginRight: 8 }} />
              <Text style={styles.publishSummaryTitle}>
                Presume tu Camino Recorrido y tu Insignia
              </Text>
            </View>
            <Text style={styles.publishSummarySub}>
              Publica en la comunidad el resumen con todas tus fotos de estos 7 días y tu insignia "{targetBadge.name}" para inspirar a los demás:
            </Text>

            {/* Horizontal strip of the 7 evidence photos */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.summaryPhotosStrip}
            >
              {streak.days.map((d) => (
                <View key={d.dayNumber} style={styles.summaryThumbItem}>
                  {d.evidenceImageUrl ? (
                    <Image
                      source={{ uri: d.evidenceImageUrl }}
                      style={styles.summaryThumbImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.summaryThumbPlaceholder}>
                      <Text style={{ fontSize: 18 }}>{d.task.emoji}</Text>
                    </View>
                  )}
                  <View style={styles.summaryThumbBadge}>
                    <Text style={styles.summaryThumbBadgeText}>Día {d.dayNumber}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TextInput
              style={styles.summaryMessageInput}
              multiline
              maxLength={350}
              value={summaryPostText}
              onChangeText={setSummaryPostText}
              placeholder="Escribe tu mensaje de '¡Lo logré!' para la comunidad..."
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              style={[
                styles.publishSummaryBtn,
                streak.summaryPublished && { backgroundColor: '#10B981' },
              ]}
              onPress={handlePublishSevenDaySummary}
              disabled={isPublishingSummary}
              activeOpacity={0.88}
            >
              {isPublishingSummary ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={streak.summaryPublished ? 'checkmark-done-circle' : 'megaphone'}
                    size={19}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.publishSummaryBtnText}>
                    {streak.summaryPublished
                      ? '¡Resumen publicado! (Toca si deseas compartir de nuevo)'
                      : `¡Publicar mis 7 fotos, "¡Lo logré!" y mi Insignia!`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Timeline of the 7 Days Completed */}
          <View style={styles.cardSection}>
            <Text style={styles.cardHeaderTitle}>Resumen de tu Camino Recorrido (7/7)</Text>
            <View style={{ marginTop: 10 }}>
              {streak.days.map((d) => (
                <View key={d.dayNumber} style={styles.completedTimelineItem}>
                  <View style={styles.completedTimelineCheck}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.completedTimelineTitle}>
                      Día {d.dayNumber}: {d.task.emoji} {d.task.title}
                    </Text>
                    {d.evidenceNote ? (
                      <Text style={styles.completedTimelineNote}>"{d.evidenceNote}"</Text>
                    ) : null}
                  </View>
                  {d.evidenceImageUrl ? (
                    <Image
                      source={{ uri: d.evidenceImageUrl }}
                      style={styles.completedTimelineThumb}
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
              ))}
            </View>
          </View>

          {/* Start Next 7-Day Streak Button */}
          <TouchableOpacity
            style={styles.startNextStreakBtn}
            onPress={handleStartNextStreak}
            activeOpacity={0.88}
          >
            <Ionicons name="flame" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.startNextStreakBtnText}>
              Iniciar nueva Racha de 7 Días (Siguiente Nivel)
            </Text>
          </TouchableOpacity>

          <View style={{ height: 36 }} />
        </ScrollView>
      ) : (
        /* =================== VIEW 3: ACTIVE 7-DAY TIKTOK-STYLE STREAK DASHBOARD =================== */
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {/* TikTok-Style Orange Flame Header Card */}
          <View style={styles.tiktokStreakCard}>
            <View style={styles.tiktokStreakTopRow}>
              <View style={styles.flameCircleLarge}>
                <Text style={{ fontSize: 28 }}>🔥</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.streakCountRow}>
                  <Text style={styles.streakCountBig}>
                    {streak?.completedDaysCount || 0} / 7 Días
                  </Text>
                  <View style={styles.activeOrangePill}>
                    <Text style={styles.activeOrangePillText}>RACHA ACTIVA</Text>
                  </View>
                </View>
                <Text style={styles.streakFocusTitleText}>{focusMeta.title}</Text>
              </View>
              <View style={styles.nextBadgeMiniBox}>
                <Text style={{ fontSize: 20 }}>{targetBadge.emoji}</Text>
                <Text style={styles.nextBadgeMiniLabel}>Meta Día 7</Text>
              </View>
            </View>

            {/* 7-Day Interactive Selector Bar */}
            <View style={styles.sevenDaysRow}>
              {streak?.days.map((d) => {
                const isSelected = d.dayNumber === selectedDayNum;
                const isDone = d.status === 'completed';
                const isPostponed = d.status === 'postponed';
                const isCurrent = d.dayNumber === streak.currentDayNumber;

                return (
                  <TouchableOpacity
                    key={d.dayNumber}
                    style={[
                      styles.dayBubbleItem,
                      isDone && styles.dayBubbleCompleted,
                      isCurrent && !isDone && styles.dayBubbleCurrent,
                      isSelected && styles.dayBubbleSelectedBorder,
                    ]}
                    onPress={() => {
                      setSelectedDayNum(d.dayNumber);
                      setPostponedEncouragementQuote(d.motivationalQuoteUsed || null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dayBubbleLabel,
                        (isDone || isCurrent) && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      D{d.dayNumber}
                    </Text>
                    {isDone ? (
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    ) : isPostponed ? (
                      <Ionicons name="reload-circle" size={16} color={isCurrent ? '#FFFFFF' : '#3B82F6'} />
                    ) : isCurrent ? (
                      <Text style={{ fontSize: 12 }}>🔥</Text>
                    ) : (
                      <Ionicons name="lock-closed" size={12} color="#94A3B8" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected Day Challenge Card */}
          {activeDayObj && (
            <View style={styles.activeChallengeCard}>
              <View style={styles.challengeHeaderRow}>
                <View style={styles.challengeDayBadge}>
                  <Text style={styles.challengeDayBadgeText}>{activeDayObj.dayName}</Text>
                </View>
                {activeDayObj.status === 'completed' ? (
                  <View style={styles.statusCompletedPill}>
                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                    <Text style={styles.statusCompletedPillText}>Completado</Text>
                  </View>
                ) : activeDayObj.status === 'postponed' ? (
                  <View style={styles.statusPostponedPill}>
                    <Ionicons name="heart" size={13} color="#3B82F6" />
                    <Text style={styles.statusPostponedPillText}>
                      Día recorrido para reponer hoy
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.challengeTitleRow}>
                <View style={styles.challengeEmojiCircle}>
                  <Text style={{ fontSize: 28 }}>{activeDayObj.task.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.challengeMainTitle}>{activeDayObj.task.title}</Text>
                  <Text style={styles.challengeCategorySub}>
                    {focusMeta.postTagText}
                  </Text>
                </View>
              </View>

              <Text style={styles.challengeDescriptionText}>
                {activeDayObj.task.description}
              </Text>

              {/* Encouragement Box if user postponed this day */}
              {postponedEncouragementQuote && activeDayObj.status !== 'completed' && (
                <View style={styles.encouragementBox}>
                  <Image
                    source={require('../../../assets/perfilANIMA.png')}
                    style={styles.miniAnimaAvatar}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.encouragementTitle}>
                      ANIMA recorrió este día para ti sin castigos 💙:
                    </Text>
                    <Text style={styles.encouragementQuoteText}>
                      "{postponedEncouragementQuote}"
                    </Text>
                  </View>
                </View>
              )}

              {activeDayObj.status === 'completed' ? (
                /* Completed Day Evidence Preview */
                <View style={styles.completedEvidenceBox}>
                  {activeDayObj.evidenceImageUrl ? (
                    <Image
                      source={{ uri: activeDayObj.evidenceImageUrl }}
                      style={styles.completedEvidenceImg}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View style={styles.completedEvidenceTextCol}>
                    <Text style={styles.completedEvidenceTitle}>
                      ¡Reto del Día {activeDayObj.dayNumber} publicado en la comunidad! 🎉
                    </Text>
                    {activeDayObj.evidenceNote ? (
                      <Text style={styles.completedEvidenceNote}>
                        "{activeDayObj.evidenceNote}"
                      </Text>
                    ) : null}
                    {activeDayObj.motivationalQuoteUsed ? (
                      <Text style={styles.completedEvidenceQuote}>
                        💬 ANIMA: {activeDayObj.motivationalQuoteUsed}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : (
                /* Evidence Upload & Actions for Active Day */
                <View style={styles.evidenceActionSection}>
                  <Text style={styles.evidenceSectionLabel}>
                    📸 Evidencia de tu Día {activeDayObj.dayNumber} (se publicará en Principal como inspiración):
                  </Text>

                  {evidencePhotoUri ? (
                    <View style={styles.selectedEvidencePreviewWrap}>
                      <Image
                        source={{ uri: evidencePhotoUri }}
                        style={styles.selectedEvidenceImg}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.changePhotoFloatingBtn}
                        onPress={handlePickEvidencePhoto}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="camera" size={14} color="#FFFFFF" />
                        <Text style={styles.changePhotoFloatingText}>Cambiar foto</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.pickEvidencePhotoBtn}
                      onPress={handlePickEvidencePhoto}
                      activeOpacity={0.82}
                    >
                      <View style={styles.pickEvidenceIconCircle}>
                        <Ionicons name="camera" size={24} color="#FF7A00" />
                      </View>
                      <Text style={styles.pickEvidenceTitle}>
                        Subir foto de evidencia del Día {activeDayObj.dayNumber}
                      </Text>
                      <Text style={styles.pickEvidenceSub}>
                        Toca aquí para elegir una foto de tu galería que muestre tu reto de hoy
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TextInput
                    style={styles.evidenceNoteInput}
                    placeholder="Escribe cómo te sentiste hoy al realizar este pequeño paso... (opcional)"
                    placeholderTextColor={colors.textMuted}
                    value={evidenceNote}
                    onChangeText={setEvidenceNote}
                    multiline
                    maxLength={280}
                  />

                  {/* Primary Complete & Publish Button */}
                  <TouchableOpacity
                    style={styles.completeDayOrangeBtn}
                    onPress={handleCompleteDay}
                    disabled={isSubmittingDay}
                    activeOpacity={0.88}
                  >
                    {isSubmittingDay ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="flame" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.completeDayOrangeBtnText}>
                          Completar Día {activeDayObj.dayNumber} y Publicar Avance
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Empathetic "I couldn't do it today" Button (Shifts Day + Motivational Quote) */}
                  <TouchableOpacity
                    style={styles.postponeDayBtn}
                    onPress={handlePostponeDay}
                    activeOpacity={0.78}
                  >
                    <Ionicons name="heart-outline" size={16} color="#3B82F6" style={{ marginRight: 6 }} />
                    <Text style={styles.postponeDayBtnText}>
                      Hoy me costó lograrlo • Recorrer día y recibir ánimo de ANIMA
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Showcase of the 4 Official Badges & Levels */}
          <View style={styles.cardSection}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="ribbon" size={17} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Insignias y Niveles por Desbloquear</Text>
                <Text style={styles.cardHeaderSub}>
                  Completa tus rachas de 7 días para coleccionarlas en tu Perfil:
                </Text>
              </View>
            </View>

            <View style={styles.badgesGrid}>
              {OFFICIAL_STREAK_BADGES.map((b) => {
                const isUnlocked = result.unlockedBadges?.includes(b.id);
                const isTarget = b.id === targetBadge.id;
                return (
                  <View
                    key={b.id}
                    style={[
                      styles.badgeGridCard,
                      isUnlocked && { backgroundColor: b.softBg, borderColor: b.borderColor },
                      isTarget && !isUnlocked && { borderColor: '#FF7A00', borderWidth: 1.5 },
                    ]}
                  >
                    <View style={styles.badgeGridTopRow}>
                      <Text style={{ fontSize: 24, opacity: isUnlocked || isTarget ? 1 : 0.45 }}>
                        {b.emoji}
                      </Text>
                      <View
                        style={[
                          styles.badgeLevelMiniPill,
                          { backgroundColor: isUnlocked ? b.color : '#E2E8F0' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeLevelMiniText,
                            { color: isUnlocked ? '#FFFFFF' : '#475569' },
                          ]}
                        >
                          Nivel {b.level}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.badgeGridName}>{b.name}</Text>
                    <Text style={styles.badgeGridSub} numberOfLines={2}>
                      {isUnlocked
                        ? '¡Desbloqueada en tu perfil!'
                        : isTarget
                        ? '🔥 En progreso en esta racha'
                        : b.subtitle}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );

  if (isEmbeddedMode) {
    return modalContent;
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {modalContent}
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  desktopSafeArea: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FAF7F5',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  headerSubTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF7A00',
    marginTop: 1,
  },
  headerActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
  },
  evaluatingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  evaluatingAnimaImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: '#FF7A00',
  },
  evaluatingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
  },
  evaluatingDesc: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  /* Questionnaire View */
  questionContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  questionAnimaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 10,
  },
  questionAnimaAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#FF7A00',
  },
  questionAnimaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  questionAnimaSub: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
    lineHeight: 16,
  },
  dimensionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  dimensionPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  questionBox: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  questionTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coffeeDark,
    lineHeight: 22,
    marginBottom: 6,
  },
  questionSubtitleText: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  optionsGridContainer: {
    gap: 10,
  },
  optionsGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridOptionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 112,
  },
  gridOptionCardSelected: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF7ED',
  },
  gridEmojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridEmojiCircleSelected: {
    backgroundColor: '#FFEDD5',
  },
  gridEmoji: {
    fontSize: 21,
  },
  gridOptionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
  },
  gridOptionLabelSelected: {
    color: '#EA580C',
  },
  gridOptionSublabel: {
    fontSize: 10.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  gridOptionSublabelSelected: {
    color: '#C2410C',
    fontWeight: '600',
  },
  gridCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  bottomNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  navControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  navControlBtnDisabled: {
    opacity: 0.45,
  },
  navControlText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.coffeeDark,
    marginLeft: 4,
  },
  stepIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  /* Scrollable Dashboards */
  scrollBody: {
    flex: 1,
  },
  resultScrollContent: {
    padding: 16,
  },
  /* View 2: Invitation Card */
  invitationHeroCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  invitationAnimaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  invitationAnimaAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  focusPillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    gap: 5,
  },
  focusPillEmoji: {
    fontSize: 13,
  },
  focusPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  invitationAnimaName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  animaSpeechBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A00',
    marginBottom: 14,
  },
  animaSpeechText: {
    fontSize: 13.5,
    color: colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },
  targetBadgePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.2,
    marginBottom: 16,
    gap: 12,
  },
  targetBadgeIconBubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetBadgeLevelText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  targetBadgeNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.coffeeDark,
    marginTop: 1,
  },
  targetBadgeDescText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  acceptStreakPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptStreakPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
  },
  cardSection: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  cardIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  cardHeaderSub: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  previewDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  previewDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewDayNumText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  previewDayTaskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  previewDayTaskDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  secondaryPsicoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  secondaryPsicoBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },
  /* View 3: TikTok-style Active Streak Dashboard */
  tiktokStreakCard: {
    backgroundColor: '#1E293B',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FF7A00',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  tiktokStreakTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  flameCircleLarge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 122, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakCountBig: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  activeOrangePill: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeOrangePillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  streakFocusTitleText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
    marginTop: 2,
  },
  nextBadgeMiniBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  nextBadgeMiniLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FDBA74',
    marginTop: 2,
  },
  sevenDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayBubbleItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dayBubbleCompleted: {
    backgroundColor: '#10B981',
  },
  dayBubbleCurrent: {
    backgroundColor: '#FF7A00',
  },
  dayBubbleSelectedBorder: {
    borderColor: '#FFFFFF',
  },
  dayBubbleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  /* Active Day Challenge Card */
  activeChallengeCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    marginBottom: 16,
  },
  challengeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  challengeDayBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  challengeDayBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  statusCompletedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusCompletedPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  statusPostponedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusPostponedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  challengeEmojiCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  challengeMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  challengeCategorySub: {
    fontSize: 11.5,
    color: '#EA580C',
    fontWeight: '600',
    marginTop: 2,
  },
  challengeDescriptionText: {
    fontSize: 13.5,
    color: colors.textPrimary,
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  encouragementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 14,
    gap: 10,
  },
  miniAnimaAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  encouragementTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  encouragementQuoteText: {
    fontSize: 12,
    color: '#1E3A8A',
    fontStyle: 'italic',
    marginTop: 2,
    lineHeight: 17,
  },
  evidenceActionSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  evidenceSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffeeDark,
    marginBottom: 10,
  },
  pickEvidencePhotoBtn: {
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderStyle: 'dashed',
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pickEvidenceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pickEvidenceTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#EA580C',
    textAlign: 'center',
  },
  pickEvidenceSub: {
    fontSize: 11.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 3,
  },
  selectedEvidencePreviewWrap: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  selectedEvidenceImg: {
    width: '100%',
    height: '100%',
  },
  changePhotoFloatingBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  changePhotoFloatingText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  evidenceNoteInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    minHeight: 68,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  completeDayOrangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  completeDayOrangeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  postponeDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  postponeDayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  completedEvidenceBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  completedEvidenceImg: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  completedEvidenceTextCol: {
    gap: 4,
  },
  completedEvidenceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  completedEvidenceNote: {
    fontSize: 12.5,
    color: '#047857',
    fontStyle: 'italic',
  },
  completedEvidenceQuote: {
    fontSize: 11.5,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  /* Badges Grid */
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeGridCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  badgeGridTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeLevelMiniPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  badgeLevelMiniText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeGridName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  badgeGridSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  /* View 4: Completed 7-Day Celebration & Summary Post */
  celebrationHeroCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  unlockedBadgeCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  levelPillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  levelPillBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.coffeeDark,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 14,
  },
  celebrationQuoteBox: {
    width: '100%',
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  celebrationQuoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  celebrationQuoteAnimaLabel: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  nextQuoteMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  nextQuoteMiniBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FF7A00',
  },
  celebrationQuoteText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.coffeeDark,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  publishSummaryCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    marginBottom: 16,
  },
  publishSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  publishSummaryTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.coffeeDark,
  },
  publishSummarySub: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  summaryPhotosStrip: {
    gap: 8,
    paddingBottom: 12,
  },
  summaryThumbItem: {
    width: 78,
    height: 78,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceSoft,
  },
  summaryThumbImg: {
    width: '100%',
    height: '100%',
  },
  summaryThumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryThumbBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  summaryThumbBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  summaryMessageInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    fontSize: 13,
    color: colors.textPrimary,
    minHeight: 74,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  publishSummaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  publishSummaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  completedTimelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  completedTimelineCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedTimelineTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  completedTimelineNote: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 1,
  },
  completedTimelineThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  startNextStreakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coffeePrimary,
    paddingVertical: 14,
    borderRadius: 16,
  },
  startNextStreakBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
