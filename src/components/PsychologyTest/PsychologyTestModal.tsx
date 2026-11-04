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
  completeStreakDayWithEvidence,
  postponeStreakDayWithEncouragement,
  publishFullStreakSummaryToFeed,
  startNextSevenDayStreak,
  normalizeTestResultWithStreak,
} from '../../services/psychologyTestService';
import { useAuth } from '../../context/AuthContext';
import { showAnimaToast } from '../Anima/AnimaToast';
import { ImageViewerModal } from '../UI/ImageViewerModal';
import { colors } from '../../theme/colors';

interface PsychologyTestModalProps {
  visible: boolean;
  userId?: string;
  initialResult?: TestResult | null;
  startMode?: 'questionnaire' | 'result';
  onClose: () => void;
  onNavigateToProfile?: () => void;
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
  onNavigateToProfile,
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

  // Fullscreen image viewer for "Mis Avances (Grid de 7)"
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number>(0);
  const [viewerVisible, setViewerVisible] = useState<boolean>(false);

  // Final 7-day summary celebration state
  const [celebrationQuote, setCelebrationQuote] = useState<string>(() =>
    getRandomStreakMotivationalQuote()
  );
  const [summaryPostText, setSummaryPostText] = useState<string>(
    '¡Lo logré! Completé mi racha de 7 días paso a paso y desbloqueé mi insignia en Entre Nosotros 🔥'
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
    }, 240);
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

      // Single clean ANIMA Toast
      showAnimaToast({
        title: '¡Ruta de 7 Días Activada!',
        message: 'Tu racha e insignias ya están listas en tu Perfil. ¡Comencemos con el Día 1!',
        emoji: '🔥',
        accentColor: '#FF7A00',
      });

      // Navigate directly to Profile where the streak & badges are showcased
      if (onNavigateToProfile) {
        onNavigateToProfile();
      } else {
        onClose();
      }
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

  // Pick evidence image from gallery
  const handlePickEvidencePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso necesario',
          'Necesitamos acceso a tus fotos para subir la evidencia de tu actividad del día.'
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
          'Necesitas iniciar sesión en tu cuenta para publicar tu avance y guardar tu racha.'
        );
      }
      return;
    }

    if (!evidencePhotoUri) {
      showAnimaToast({
        title: 'Agrega tu foto del día 📸',
        message: 'Selecciona una fotografía de tu actividad de hoy para registrar tu avance en la racha.',
        emoji: '📸',
        accentColor: '#FF7A00',
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

  const allCompletedPhotos = (streak?.days || [])
    .map((d) => d.evidenceImageUrl)
    .filter((u): u is string => Boolean(u));

  const handleOpenGalleryPhoto = (url: string) => {
    const list = allCompletedPhotos.length > 0 ? allCompletedPhotos : [url];
    const idx = Math.max(0, list.indexOf(url));
    setViewerImages(list);
    setViewerIndex(idx);
    setViewerVisible(true);
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
        {/* Large Emoji WITHOUT any background circle */}
        <Text style={styles.gridEmojiLarge}>{option.emoji}</Text>

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
      <ImageViewerModal
        visible={viewerVisible}
        images={viewerImages}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />

      {/* Top Clean White Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerMainTitle}>
            {!result
              ? 'Ruta Emocional de 7 Días'
              : streak?.status === 'completed'
              ? '¡Camino de 7 Días Logrado!'
              : 'Mi Racha de 7 Días'}
          </Text>
          <Text style={styles.headerSubTitle}>
            {!result
              ? `Pregunta ${currentIndex + 1} de ${totalQuestions}`
              : `${streak?.completedDaysCount || 0} de 7 días completados`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleRestartQuestionnaire}
          style={styles.headerActionBtn}
          activeOpacity={0.7}
          accessibilityLabel="Nuevo test"
        >
          <Ionicons name="refresh-outline" size={18} color="#475569" />
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
          <ActivityIndicator size="large" color="#FF7A00" style={{ marginVertical: 16 }} />
          <Text style={styles.evaluatingTitle}>Preparando tu Ruta de 7 Días...</Text>
          <Text style={styles.evaluatingDesc}>
            Seleccionando tus desafíos personalizados y activando tu racha en tu Perfil.
          </Text>
        </View>
      ) : !result ? (
        /* =================== VIEW 1: CLEAN QUESTIONNAIRE (BIG EMOJIS + BIG ANIMA PHOTO) =================== */
        <View style={styles.questionContainer}>
          {/* ANIMA Companion Header with Larger Avatar */}
          <View style={styles.questionAnimaBanner}>
            <Image
              source={require('../../../assets/perfilANIMA.png')}
              style={styles.questionAnimaAvatarLarge}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.questionAnimaTitle}>Personaliza tu Ruta con ANIMA</Text>
              <Text style={styles.questionAnimaSub}>
                Tus respuestas diseñarán tu plan interactivo de 7 días y tus insignias en tu perfil.
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
                color={currentIndex === 0 ? '#94A3B8' : '#0F172A'}
              />
              <Text
                style={[
                  styles.navControlText,
                  currentIndex === 0 && { color: '#94A3B8' },
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
      ) : streak && streak.status === 'completed' ? (
        /* =================== VIEW 2: COMPLETED 7-DAY CELEBRATION & FULL SUMMARY POST =================== */
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {/* Clean White Celebration Card */}
          <View style={styles.celebrationHeroCard}>
            <Text style={styles.unlockedEmojiBig}>{targetBadge.emoji}</Text>
            <View style={styles.levelPillBadge}>
              <Text style={styles.levelPillBadgeText}>
                INSIGNIA DESBLOQUEADA • {targetBadge.levelLabel}
              </Text>
            </View>
            <Text style={styles.celebrationTitle}>{targetBadge.name}</Text>
            <Text style={styles.celebrationSubtitle}>{targetBadge.description}</Text>

            {/* Motivational Quote from ANIMA */}
            <View style={styles.celebrationQuoteBox}>
              <View style={styles.celebrationQuoteHeader}>
                <Image
                  source={require('../../../assets/perfilANIMA.png')}
                  style={styles.animaAvatarMedium}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.celebrationQuoteAnimaLabel}>Mensaje de ANIMA</Text>
                  <Text style={styles.celebrationQuoteText}>"{celebrationQuote}"</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setCelebrationQuote(getRandomStreakMotivationalQuote())}
                  style={styles.nextQuoteMiniBtn}
                >
                  <Ionicons name="reload" size={14} color="#FF7A00" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Publish Full 7-Day Album & Badge to Community */}
          <View style={styles.cleanWhiteCard}>
            <View style={styles.publishSummaryHeader}>
              <Ionicons name="sparkles" size={18} color="#FF7A00" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitleText}>
                Publicar mi Resumen de 7 Días e Insignia
              </Text>
            </View>
            <Text style={styles.sectionSubText}>
              Comparte en Principal tus fotografías de la semana, tu mensaje de "¡Lo logré!" y tu insignia {targetBadge.name}:
            </Text>

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
                      <Text style={{ fontSize: 22 }}>{d.task.emoji}</Text>
                    </View>
                  )}
                  <View style={styles.summaryThumbBadge}>
                    <Text style={styles.summaryThumbBadgeText}>Día {d.dayNumber}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TextInput
              style={styles.cleanInputBox}
              multiline
              maxLength={350}
              value={summaryPostText}
              onChangeText={setSummaryPostText}
              placeholder="Escribe tu mensaje de '¡Lo logré!' para la comunidad..."
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity
              style={styles.primaryOrangeBtn}
              onPress={handlePublishSevenDaySummary}
              disabled={isPublishingSummary}
              activeOpacity={0.88}
            >
              {isPublishingSummary ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={streak.summaryPublished ? 'checkmark-done-circle' : 'paper-plane'}
                    size={18}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.primaryOrangeBtnText}>
                    {streak.summaryPublished
                      ? 'Resumen publicado en Principal (Compartir de nuevo)'
                      : 'Publicar mis 7 fotos, "¡Lo logré!" y mi Insignia'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Start Next 7-Day Streak Button */}
          <TouchableOpacity
            style={styles.secondaryOutlineBtn}
            onPress={handleStartNextStreak}
            activeOpacity={0.85}
          >
            <Ionicons name="flame-outline" size={18} color="#FF7A00" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryOutlineBtnText}>
              Iniciar siguiente Ruta de 7 Días (Subir de Nivel)
            </Text>
          </TouchableOpacity>

          <View style={{ height: 36 }} />
        </ScrollView>
      ) : (
        /* =================== VIEW 3: CLEAN WHITE / LIGHT-GRAY / SUBTLE ORANGE STREAK DASHBOARD =================== */
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {/* 1. Clean White Top Streak Summary Card */}
          <View style={styles.cleanStreakHeaderCard}>
            <View style={styles.cleanStreakTopRow}>
              <View style={styles.cleanStreakTitleCol}>
                <View style={styles.streakBadgeRow}>
                  <Text style={styles.flameIconText}>🔥</Text>
                  <Text style={styles.streakMainCountText}>
                    {streak?.completedDaysCount || 0} / 7 Días
                  </Text>
                  <View style={styles.subtleOrangeTag}>
                    <Text style={styles.subtleOrangeTagText}>RACHA ACTIVA</Text>
                  </View>
                </View>
                <Text style={styles.streakFocusName}>{focusMeta.title}</Text>
              </View>

              <View style={styles.metaBadgeRightBox}>
                <Text style={styles.metaBadgeEmoji}>{targetBadge.emoji}</Text>
                <Text style={styles.metaBadgeLabel}>Meta Día 7</Text>
              </View>
            </View>

            {/* Minimalist 7-Day Selector Pills */}
            <View style={styles.cleanSevenDaysBar}>
              {streak?.days.map((d) => {
                const isSelected = d.dayNumber === selectedDayNum;
                const isDone = d.status === 'completed';
                const isCurrent = d.dayNumber === streak.currentDayNumber;

                return (
                  <TouchableOpacity
                    key={d.dayNumber}
                    style={[
                      styles.cleanDayPill,
                      isDone && styles.cleanDayPillDone,
                      isCurrent && !isDone && styles.cleanDayPillCurrent,
                      isSelected && styles.cleanDayPillSelected,
                    ]}
                    onPress={() => {
                      setSelectedDayNum(d.dayNumber);
                      setPostponedEncouragementQuote(d.motivationalQuoteUsed || null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.cleanDayPillText,
                        (isDone || isCurrent) && { color: '#FF7A00', fontWeight: '800' },
                        isSelected && { color: '#FFFFFF', fontWeight: '900' },
                      ]}
                    >
                      D{d.dayNumber}
                    </Text>
                    {isDone ? (
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color={isSelected ? '#FFFFFF' : '#FF7A00'}
                      />
                    ) : (
                      <View
                        style={[
                          styles.miniDotIndicator,
                          isSelected
                            ? { backgroundColor: '#FFFFFF' }
                            : isCurrent
                            ? { backgroundColor: '#FF7A00' }
                            : { backgroundColor: '#CBD5E1' },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 2. Active Day Challenge & Publish Card (Refined White & Light Gray) */}
          {activeDayObj && (
            <View style={styles.cleanWhiteCard}>
              <View style={styles.dayCardTopBar}>
                <View style={styles.dayStepTag}>
                  <Text style={styles.dayStepTagText}>{activeDayObj.dayName}</Text>
                </View>
                {activeDayObj.status === 'completed' ? (
                  <View style={styles.completedGrayTag}>
                    <Ionicons name="checkmark-circle" size={14} color="#FF7A00" />
                    <Text style={styles.completedGrayTagText}>Completado</Text>
                  </View>
                ) : activeDayObj.status === 'postponed' ? (
                  <View style={styles.completedGrayTag}>
                    <Ionicons name="reload-circle" size={14} color="#64748B" />
                    <Text style={styles.completedGrayTagText}>Día recorrido</Text>
                  </View>
                ) : null}
              </View>

              {/* Task Header: Large clean emoji without background + Title */}
              <View style={styles.taskHeroRow}>
                <Text style={styles.taskHeroEmoji}>{activeDayObj.task.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskHeroTitle}>{activeDayObj.task.title}</Text>
                  <Text style={styles.taskHeroSub}>{focusMeta.postTagText}</Text>
                </View>
              </View>

              <View style={styles.taskDescriptionBox}>
                <Text style={styles.taskDescriptionText}>
                  {activeDayObj.task.description}
                </Text>
              </View>

              {/* Encouragement Box if user postponed this day */}
              {postponedEncouragementQuote && activeDayObj.status !== 'completed' && (
                <View style={styles.cleanAnimaNoteBox}>
                  <Image
                    source={require('../../../assets/perfilANIMA.png')}
                    style={styles.animaAvatarMedium}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cleanAnimaNoteTitle}>
                      ANIMA recorrió este día para ti:
                    </Text>
                    <Text style={styles.cleanAnimaNoteText}>
                      "{postponedEncouragementQuote}"
                    </Text>
                  </View>
                </View>
              )}

              {activeDayObj.status === 'completed' ? (
                <View style={styles.completedDayPreviewBox}>
                  {activeDayObj.evidenceImageUrl ? (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => handleOpenGalleryPhoto(activeDayObj.evidenceImageUrl!)}
                    >
                      <Image
                        source={{ uri: activeDayObj.evidenceImageUrl }}
                        style={styles.completedDayPreviewImg}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ) : null}
                  <Text style={styles.completedDayPreviewStatus}>
                    ✓ Actividad del Día {activeDayObj.dayNumber} registrada y compartida
                  </Text>
                  {activeDayObj.evidenceNote ? (
                    <Text style={styles.completedDayPreviewNote}>
                      "{activeDayObj.evidenceNote}"
                    </Text>
                  ) : null}
                </View>
              ) : (
                /* Clean Evidence Upload & Publish Form */
                <View style={styles.publishSectionWrap}>
                  <View style={styles.publishHeaderLine}>
                    <Ionicons name="camera-outline" size={17} color="#0F172A" />
                    <Text style={styles.publishHeaderLabel}>
                      Registrar y publicar mi Día {activeDayObj.dayNumber}
                    </Text>
                  </View>

                  {evidencePhotoUri ? (
                    <View style={styles.evidencePreviewBox}>
                      <Image
                        source={{ uri: evidencePhotoUri }}
                        style={styles.evidencePreviewImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.changePhotoPill}
                        onPress={handlePickEvidencePhoto}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="camera" size={14} color="#FFFFFF" />
                        <Text style={styles.changePhotoPillText}>Cambiar fotografía</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.cleanPhotoDropzone}
                      onPress={handlePickEvidencePhoto}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="image-outline" size={28} color="#FF7A00" />
                      <Text style={styles.cleanPhotoDropzoneTitle}>
                        Seleccionar fotografía de mi actividad
                      </Text>
                      <Text style={styles.cleanPhotoDropzoneSub}>
                        Toca para subir tu foto del Día {activeDayObj.dayNumber} y compartirla en Principal
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TextInput
                    style={styles.cleanInputBox}
                    placeholder="Agrega un comentario sobre tu experiencia de hoy... (opcional)"
                    placeholderTextColor="#94A3B8"
                    value={evidenceNote}
                    onChangeText={setEvidenceNote}
                    multiline
                    maxLength={280}
                  />

                  <TouchableOpacity
                    style={styles.primaryOrangeBtn}
                    onPress={handleCompleteDay}
                    disabled={isSubmittingDay}
                    activeOpacity={0.88}
                  >
                    {isSubmittingDay ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="flame" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryOrangeBtnText}>
                          Publicar Avance y Completar Día {activeDayObj.dayNumber}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.postponeCleanBtn}
                    onPress={handlePostponeDay}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="time-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.postponeCleanBtnText}>
                      Hoy no pude realizarlo • Recorrer día y recibir motivación
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* 3. NEW SECTION: MIS AVANCES (GRID DE 7 FOTOS RESPONSIVO PARA CELULAR Y WEB) */}
          <View style={styles.cleanWhiteCard}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitleText}>Mis Avances • Galería de 7 Días</Text>
                <Text style={styles.sectionSubText}>
                  Tu camino fotográfico día por día ({streak?.completedDaysCount || 0} de 7 registrados)
                </Text>
              </View>
              <View style={styles.countGrayBadge}>
                <Text style={styles.countGrayBadgeText}>
                  {streak?.completedDaysCount || 0}/7
                </Text>
              </View>
            </View>

            <View style={styles.sevenPhotosGrid}>
              {streak?.days.map((d) => {
                const hasPhoto = Boolean(d.evidenceImageUrl);
                const isSelected = d.dayNumber === selectedDayNum;
                return (
                  <TouchableOpacity
                    key={d.dayNumber}
                    style={[
                      styles.advanceGridCell,
                      isSelected && styles.advanceGridCellSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (hasPhoto && d.evidenceImageUrl) {
                        handleOpenGalleryPhoto(d.evidenceImageUrl);
                      } else {
                        setSelectedDayNum(d.dayNumber);
                      }
                    }}
                  >
                    {hasPhoto && d.evidenceImageUrl ? (
                      <>
                        <Image
                          source={{ uri: d.evidenceImageUrl }}
                          style={styles.advanceGridImg}
                          resizeMode="cover"
                        />
                        <View style={styles.advanceDayOverlayPill}>
                          <Text style={styles.advanceDayOverlayText}>Día {d.dayNumber}</Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.advanceEmptySlot}>
                        <Text style={styles.advanceEmptyDayNum}>Día {d.dayNumber}</Text>
                        <Text style={styles.advanceEmptyEmoji}>{d.task.emoji}</Text>
                        <Text style={styles.advanceEmptyLabel} numberOfLines={1}>
                          {d.status === 'unlocked' ? 'En curso' : 'Pendiente'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. INSIGNIAS Y NIVELES (CLEAN, SPACED OUT, MINIMALIST WHITE & LIGHT GRAY) */}
          <View style={styles.cleanWhiteCard}>
            <Text style={styles.sectionTitleText}>Insignias y Niveles</Text>
            <Text style={[styles.sectionSubText, { marginBottom: 14 }]}>
              Completa tus rutas de 7 días para desbloquearlas en tu Perfil:
            </Text>

            <View style={styles.cleanBadgesList}>
              {OFFICIAL_STREAK_BADGES.map((b) => {
                const isUnlocked = Boolean(result.unlockedBadges?.includes(b.id));
                const isTarget = b.id === targetBadge.id;
                return (
                  <View
                    key={b.id}
                    style={[
                      styles.cleanBadgeItemCard,
                      isTarget && styles.cleanBadgeItemActiveBorder,
                    ]}
                  >
                    <Text style={styles.cleanBadgeEmoji}>{b.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={styles.cleanBadgeHeaderRow}>
                        <Text style={styles.cleanBadgeName}>{b.name}</Text>
                        <View
                          style={[
                            styles.cleanBadgeLevelPill,
                            (isUnlocked || isTarget) && { backgroundColor: '#FFF7ED', borderColor: '#FDBA74' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.cleanBadgeLevelText,
                              (isUnlocked || isTarget) && { color: '#FF7A00' },
                            ]}
                          >
                            Nivel {b.level}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.cleanBadgeDesc}>
                        {isUnlocked
                          ? '✓ Desbloqueada en tu perfil'
                          : isTarget
                          ? 'En progreso en esta racha'
                          : b.subtitle}
                      </Text>
                    </View>
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
    backgroundColor: '#F8FAFC',
  },
  desktopSafeArea: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerMainTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  headerActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
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
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: '#FF7A00',
  },
  evaluatingTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  evaluatingDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  /* Questionnaire View */
  questionContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  questionAnimaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  questionAnimaAvatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#FF7A00',
  },
  questionAnimaTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  questionAnimaSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  dimensionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dimensionPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  questionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionTitleText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 23,
    marginBottom: 6,
  },
  questionSubtitleText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18.5,
  },
  optionsGridContainer: {
    gap: 12,
  },
  optionsGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridOptionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 124,
  },
  gridOptionCardSelected: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFFFFF',
  },
  gridEmojiLarge: {
    fontSize: 38,
    marginBottom: 8,
  },
  gridOptionLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  gridOptionLabelSelected: {
    color: '#FF7A00',
  },
  gridOptionSublabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 3,
  },
  gridOptionSublabelSelected: {
    color: '#475569',
    fontWeight: '600',
  },
  gridCheckmark: {
    position: 'absolute',
    top: 10,
    right: 10,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navControlBtnDisabled: {
    opacity: 0.45,
  },
  navControlText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 4,
  },
  stepIndicatorText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  /* Scrollable Dashboards */
  scrollBody: {
    flex: 1,
  },
  resultScrollContent: {
    padding: 16,
  },
  /* Clean White Streak Header Card */
  cleanStreakHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cleanStreakTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cleanStreakTitleCol: {
    flex: 1,
    paddingRight: 10,
  },
  streakBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flameIconText: {
    fontSize: 24,
  },
  streakMainCountText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtleOrangeTag: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  subtleOrangeTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FF7A00',
    letterSpacing: 0.4,
  },
  streakFocusName: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  metaBadgeRightBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaBadgeEmoji: {
    fontSize: 24,
  },
  metaBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  cleanSevenDaysBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  cleanDayPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cleanDayPillDone: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FDBA74',
  },
  cleanDayPillCurrent: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF7A00',
  },
  cleanDayPillSelected: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  cleanDayPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  miniDotIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  /* Clean White Card Container */
  cleanWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayCardTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dayStepTag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayStepTagText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#334155',
  },
  completedGrayTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  completedGrayTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  taskHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  taskHeroEmoji: {
    fontSize: 38,
  },
  taskHeroTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  taskHeroSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  taskDescriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  taskDescriptionText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
  },
  cleanAnimaNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 12,
  },
  animaAvatarMedium: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FF7A00',
  },
  cleanAnimaNoteTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  cleanAnimaNoteText: {
    fontSize: 12.5,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 2,
    lineHeight: 18,
  },
  /* Publish Section */
  publishSectionWrap: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  publishHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  publishHeaderLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  cleanPhotoDropzone: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cleanPhotoDropzoneTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    textAlign: 'center',
  },
  cleanPhotoDropzoneSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },
  evidencePreviewBox: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  evidencePreviewImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoPill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  changePhotoPillText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  cleanInputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  primaryOrangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  primaryOrangeBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  postponeCleanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  postponeCleanBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  completedDayPreviewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  completedDayPreviewImg: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  completedDayPreviewStatus: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  completedDayPreviewNote: {
    fontSize: 12.5,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 4,
  },
  /* Section 3: Mis Avances Grid de 7 Días */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  countGrayBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countGrayBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#334155',
  },
  sevenPhotosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  advanceGridCell: {
    width: '23%',
    minWidth: 74,
    aspectRatio: 0.88,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  advanceGridCellSelected: {
    borderColor: '#FF7A00',
    borderWidth: 1.5,
  },
  advanceGridImg: {
    width: '100%',
    height: '100%',
  },
  advanceDayOverlayPill: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    right: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingVertical: 2.5,
    borderRadius: 6,
    alignItems: 'center',
  },
  advanceDayOverlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  advanceEmptySlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    gap: 4,
  },
  advanceEmptyDayNum: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
  },
  advanceEmptyEmoji: {
    fontSize: 22,
  },
  advanceEmptyLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  /* Section 4: Minimalist Spaced Badges List */
  cleanBadgesList: {
    gap: 12,
  },
  cleanBadgeItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  cleanBadgeItemActiveBorder: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF7A00',
  },
  cleanBadgeEmoji: {
    fontSize: 32,
  },
  cleanBadgeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cleanBadgeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cleanBadgeLevelPill: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  cleanBadgeLevelText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
  },
  cleanBadgeDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  /* Completed Celebration View */
  celebrationHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  unlockedEmojiBig: {
    fontSize: 52,
    marginBottom: 10,
  },
  levelPillBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  levelPillBadgeText: {
    color: '#FF7A00',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 19,
    marginBottom: 16,
  },
  celebrationQuoteBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  celebrationQuoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  celebrationQuoteAnimaLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  celebrationQuoteText: {
    fontSize: 12.5,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  nextQuoteMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryPhotosStrip: {
    gap: 8,
    paddingVertical: 12,
  },
  summaryThumbItem: {
    width: 78,
    height: 78,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  secondaryOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryOutlineBtnText: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
