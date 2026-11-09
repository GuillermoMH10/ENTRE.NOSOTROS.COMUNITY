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
  OFFICIAL_STREAK_BADGES,
  MAIN_SUPPORT_TOPICS,
  MainSupportTopicConfig,
  getTopicConfig,
  getRandomStreakMotivationalQuote,
} from '../../data/streakChallengesData';
import { TestResult, MainSupportTopicKey } from '../../types/psychologyTest';
import {
  startSupportTopicActivities,
  resetUserStreakInDatabase,
  completeStreakDayWithEvidence,
  postponeStreakDayWithEncouragement,
  publishFullStreakSummaryToFeed,
  swapCurrentActivityTask,
  concludeTopicAndClaimMedal,
  normalizeTestResultWithStreak,
} from '../../services/psychologyTestService';
import { useAuth } from '../../context/AuthContext';
import { showAnimaToast } from '../Anima/AnimaToast';
import { ImageViewerModal } from '../UI/ImageViewerModal';

interface PsychologyTestModalProps {
  visible: boolean;
  userId?: string;
  initialResult?: TestResult | null;
  startMode?: 'questionnaire' | 'result';
  onClose: () => void;
  onNavigateToProfile?: () => void;
  onOpenPsychologists?: () => void;
  onOpenCreatePost?: () => void;
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
  onOpenPsychologists,
  onTestCompleted,
  onRequireAuth,
  embedded = false,
}) => {
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && windowWidth >= 1024;
  const isEmbeddedMode = Boolean(embedded);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [selectedTopicForIntro, setSelectedTopicForIntro] =
    useState<MainSupportTopicConfig | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResettingAll, setIsResettingAll] = useState(false);

  // Active Activity selection (1, 2, 3... unlimited)
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [evidencePhotoUri, setEvidencePhotoUri] = useState<string | null>(null);
  const [evidenceNote, setEvidenceNote] = useState<string>('');
  const [evidenceVisibility, setEvidenceVisibility] = useState<'public' | 'private'>('public');
  const [isSubmittingDay, setIsSubmittingDay] = useState<boolean>(false);
  const [isSwappingTask, setIsSwappingTask] = useState<boolean>(false);
  const [isConcludingTopic, setIsConcludingTopic] = useState<boolean>(false);
  const [postponedEncouragementQuote, setPostponedEncouragementQuote] = useState<string | null>(null);

  // Fullscreen image viewer
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number>(0);
  const [viewerVisible, setViewerVisible] = useState<boolean>(false);

  // Supportive phrase from ANIMA
  const [headerQuote, setHeaderQuote] = useState<string>(() =>
    getRandomStreakMotivationalQuote()
  );

  // Final topic celebration state
  const [celebrationQuote, setCelebrationQuote] = useState<string>(() =>
    getRandomStreakMotivationalQuote()
  );
  const [summaryPostText, setSummaryPostText] = useState<string>(
    '¡Hoy concluí esta etapa de actividades a mi propio ritmo y obtuve mi medalla de superación en Entre Nosotros! 💙'
  );
  const [isPublishingSummary, setIsPublishingSummary] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      const activeUid = user?.id || userId;
      const isMatchingUser =
        !initialResult?.userId ||
        initialResult.userId === (activeUid || 'anonymous') ||
        (activeUid && initialResult.userId === activeUid);

      if (initialResult && isMatchingUser && initialResult.streakState?.isActive) {
        const normalized = normalizeTestResultWithStreak(initialResult, activeUid);
        setResult((prev) => {
          const prevCompleted = prev?.streakState?.completedDaysCount || 0;
          const nextCompleted = normalized.streakState?.completedDaysCount || 0;
          if (prev && prevCompleted > nextCompleted) {
            return prev;
          }
          if (!prev) {
            setSelectedDayNum(normalized.streakState?.currentDayNumber || 1);
          }
          return normalized;
        });
      } else {
        setResult(null);
        setSelectedTopicForIntro(null);
        setEvidencePhotoUri(null);
        setEvidenceNote('');
        setPostponedEncouragementQuote(null);
      }
      setIsResetConfirmOpen(false);
    }
  }, [visible, startMode, initialResult, userId, user?.id]);

  if (!visible) return null;

  const handleConfirmTopicAndStart = async (topicKey: MainSupportTopicKey) => {
    if (!user && !userId) {
      if (onRequireAuth) {
        onRequireAuth();
        return;
      }
    }
    setIsEvaluating(true);
    const activeUid = user?.id || userId;
    try {
      const saved = await startSupportTopicActivities(
        topicKey,
        activeUid,
        result || initialResult
      );
      setIsEvaluating(false);
      setSelectedTopicForIntro(null);
      setResult(saved);
      setSelectedDayNum(saved.streakState?.currentDayNumber || 1);
      if (onTestCompleted) {
        onTestCompleted(saved);
      }
      if (onNavigateToProfile) {
        onNavigateToProfile();
      }
    } catch (e) {
      setIsEvaluating(false);
    }
  };

  const handleConfirmResetChallenge = async () => {
    setIsResettingAll(true);
    const activeUid = user?.id || userId;
    try {
      await resetUserStreakInDatabase(activeUid, result || initialResult);
      setResult(null);
      setSelectedTopicForIntro(null);
      setEvidencePhotoUri(null);
      setEvidenceNote('');
      setPostponedEncouragementQuote(null);
      setIsResetConfirmOpen(false);
    } finally {
      setIsResettingAll(false);
    }
  };

  const handlePickEvidencePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted && Platform.OS !== 'web') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a tu galería para adjuntar la fotografía de tu actividad.'
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.78,
        base64: true,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        if (asset.base64) {
          const mime = asset.mimeType || 'image/jpeg';
          setEvidencePhotoUri(`data:${mime};base64,${asset.base64}`);
        } else if (asset.uri) {
          setEvidencePhotoUri(asset.uri);
        }
      }
    } catch (err) {
      console.warn('Error selecting activity photo:', err);
    }
  };

  const handleCompleteSelectedDay = async () => {
    if (!result || !result.streakState) return;
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (!evidencePhotoUri) {
      showAnimaToast({
        title: 'Agrega tu foto de la actividad 📸',
        message: 'Sube una fotografía de tu momento antes de registrarlo.',
        emoji: '📸',
        accentColor: '#3B82F6',
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
        visibility: evidenceVisibility,
      });

      setResult(updatedResult);
      setEvidencePhotoUri(null);
      setEvidenceNote('');
      setPostponedEncouragementQuote(null);
      setSelectedDayNum(updatedResult.streakState?.currentDayNumber || selectedDayNum + 1);
      setCelebrationQuote(getRandomStreakMotivationalQuote());

      if (onTestCompleted) {
        onTestCompleted(updatedResult);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo guardar tu actividad.');
    } finally {
      setIsSubmittingDay(false);
    }
  };

  const handleSwapTask = async () => {
    if (!result || !result.streakState || isSwappingTask) return;
    setIsSwappingTask(true);
    try {
      const activeUid = user?.id || userId;
      const updated = await swapCurrentActivityTask(result, selectedDayNum, activeUid);
      setResult(updated);
      if (onTestCompleted) {
        onTestCompleted(updated);
      }
    } finally {
      setIsSwappingTask(false);
    }
  };

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

  const handleConcludeTopicForMedal = async () => {
    if (!result || !result.streakState || isConcludingTopic) return;
    setIsConcludingTopic(true);
    try {
      const activeUid = user?.id || userId;
      const { updatedResult } = await concludeTopicAndClaimMedal(result, activeUid);
      setResult(updatedResult);
      setCelebrationQuote(getRandomStreakMotivationalQuote());
      if (onTestCompleted) {
        onTestCompleted(updatedResult);
      }
    } finally {
      setIsConcludingTopic(false);
    }
  };

  const handlePublishTopicSummary = async () => {
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
      Alert.alert('Error', err?.message || 'No se pudo publicar tu logro en la comunidad.');
    } finally {
      setIsPublishingSummary(false);
    }
  };

  const streak = result?.streakState;
  const activeTopic = getTopicConfig(streak?.focusCategory || result?.focusCategory);
  const targetBadge =
    OFFICIAL_STREAK_BADGES.find((b) => b.id === activeTopic.badgeId) ||
    OFFICIAL_STREAK_BADGES[0];

  const activeDayObj =
    streak?.days.find((d) => d.dayNumber === selectedDayNum) || streak?.days[0];

  const completedActivitiesList = (streak?.days || []).filter(
    (d) => d.status === 'completed'
  );
  const allCompletedPhotos = completedActivitiesList
    .map((d) => d.evidenceImageUrl)
    .filter((u): u is string => Boolean(u));

  const handleOpenGalleryPhoto = (url: string) => {
    const list = allCompletedPhotos.length > 0 ? allCompletedPhotos : [url];
    const idx = Math.max(0, list.indexOf(url));
    setViewerImages(list);
    setViewerIndex(idx);
    setViewerVisible(true);
  };

  // ============================================================================
  // FULL-SCREEN ONBOARDING: STEP 1 (2x2 GRID OF 4 TOPICS) & STEP 2 (ANIMA EXPLANATION)
  // ============================================================================
  if (!result || !streak?.isActive) {
    const isWideScreen = windowWidth >= 640;

    const fullScreenOnboardingContent = (
      <SafeAreaView
        style={[
          styles.onboardingFullSafeArea,
          isDesktop && styles.onboardingDesktopSafeArea,
        ]}
      >
        {/* Clean Full-Screen Top Navigation Header */}
        <View style={styles.onboardingFullTopHeader}>
          <TouchableOpacity
            onPress={() => {
              if (selectedTopicForIntro) {
                setSelectedTopicForIntro(null);
              } else {
                onClose();
              }
            }}
            style={styles.onboardingBackNavBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={18} color="#0F172A" />
            <Text style={styles.onboardingBackNavBtnText}>
              {selectedTopicForIntro ? 'Temas' : 'Regresar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.calmPillBadge}>
            <Ionicons name="sparkles" size={13} color="#3B82F6" />
            <Text style={styles.calmPillBadgeText}>
              {selectedTopicForIntro
                ? `TEMA • ${selectedTopicForIntro.name.toUpperCase()}`
                : 'ESPACIO DE APOYO Y BIENESTAR'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.onboardingCloseBtn}
            activeOpacity={0.7}
            accessibilityLabel="Cerrar"
          >
            <Ionicons name="close" size={19} color="#475569" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.onboardingFullScrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
          bounces={false}
        >
          {!selectedTopicForIntro ? (
            /* ----------------- STEP 1: CENTERED ANIMA INTRO + 2x2 GRID OF 4 TOPICS ----------------- */
            <View style={styles.onboardingCenterContainer}>
              {/* Centered ANIMA Header */}
              <View style={styles.animaHeroCenteredSection}>
                <View style={styles.animaAvatarRing}>
                  <Image
                    source={require('../../../assets/perfilANIMA.png')}
                    style={styles.animaAvatarOnboarding}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.animaTagMiniPill}>
                  <Ionicons name="sparkles" size={11} color="#2563EB" />
                  <Text style={styles.animaTagMiniPillText}>
                    Acompañamiento con ANIMA
                  </Text>
                </View>

                <Text style={styles.onboardingTitle}>
                  Hola, estoy aquí para acompañarte a sentirte mejor 💙
                </Text>

                <Text style={styles.onboardingDescription}>
                  Esta dinámica consiste en actividades agradables, interactivas y en movimiento que podrás realizar a tu propio ritmo cada vez que sientas que lo necesitas, sin límite de días y eligiendo si deseas publicarlas o mantenerlas privadas.
                </Text>
              </View>

              <Text style={styles.selectPromptText}>
                Selecciona uno de los 4 temas principales para comenzar:
              </Text>

              {/* Centered Grid of 4 Topics with Square Images & Topic Name */}
              <View
                style={[
                  styles.topicsTwoByTwoGrid,
                  isWideScreen && styles.topicsFourInRowGrid,
                ]}
              >
                {MAIN_SUPPORT_TOPICS.map((topic) => (
                  <TouchableOpacity
                    key={topic.key}
                    style={[
                      styles.topicGridCard,
                      isWideScreen && styles.topicGridCardFourInRow,
                      { borderColor: topic.borderColor },
                    ]}
                    activeOpacity={0.88}
                    onPress={() => setSelectedTopicForIntro(topic)}
                  >
                    <View style={styles.topicSquareImageWrap}>
                      <Image
                        source={{ uri: topic.squareImageUrl }}
                        style={styles.topicSquareImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.topicCardFooter}>
                      <Text style={styles.topicCardName}>{topic.name}</Text>
                      <Text
                        style={[
                          styles.topicCardSubLabel,
                          { color: topic.accentColor },
                        ]}
                      >
                        Elegir tema →
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Small-print Psychologist Recommendation */}
              <View style={styles.psychologistSmallPrintBox}>
                <Ionicons
                  name="medical-outline"
                  size={13}
                  color="#64748B"
                  style={{ marginTop: 1 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.psychologistSmallPrintText}>
                    Nota: Estas actividades son un apoyo de bienestar diario. Para una mejor ayuda y atención personalizada, te recomendamos visitar a un psicólogo profesional.
                  </Text>
                  {onOpenPsychologists && (
                    <TouchableOpacity
                      onPress={onOpenPsychologists}
                      activeOpacity={0.75}
                      style={styles.psychologistSmallPrintLinkBtn}
                    >
                      <Text style={styles.psychologistSmallPrintLinkText}>
                        Ver directorio de psicólogos especialistas →
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ) : (
            /* ----------------- STEP 2: CENTERED ANIMA EXPLANATION FOR THE CHOSEN TOPIC ----------------- */
            <View style={styles.onboardingStep2CenterContainer}>
              <View style={styles.step2AnimaHeader}>
                <Image
                  source={require('../../../assets/perfilANIMA.png')}
                  style={[
                    styles.animaAvatarStep2,
                    { borderColor: selectedTopicForIntro.accentColor },
                  ]}
                  resizeMode="cover"
                />
                <View
                  style={[
                    styles.step2TopicTag,
                    {
                      backgroundColor: selectedTopicForIntro.softBg,
                      borderColor: selectedTopicForIntro.borderColor,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 13 }}>
                    {selectedTopicForIntro.emoji}
                  </Text>
                  <Text
                    style={[
                      styles.step2TopicTagText,
                      { color: selectedTopicForIntro.accentColor },
                    ]}
                  >
                    {selectedTopicForIntro.name} • 100 actividades disponibles
                  </Text>
                </View>

                <Text style={styles.step2MainTitle}>
                  {selectedTopicForIntro.animaStep2Title}
                </Text>
                <Text style={styles.step2Subtitle}>
                  {selectedTopicForIntro.animaStep2Intro}
                </Text>
              </View>

              <View style={styles.step2ExplanationBox}>
                {selectedTopicForIntro.animaStep2Bullets.map((bullet, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.step2BulletRow,
                      idx ===
                        selectedTopicForIntro.animaStep2Bullets.length - 1 && {
                        marginBottom: 0,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.step2BulletIconCircle,
                        {
                          backgroundColor: selectedTopicForIntro.softBg,
                          borderColor: selectedTopicForIntro.borderColor,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          idx === 0
                            ? 'walk-outline'
                            : idx === 1
                            ? 'lock-open-outline'
                            : 'medal-outline'
                        }
                        size={16}
                        color={selectedTopicForIntro.accentColor}
                      />
                    </View>
                    <Text style={styles.step2BulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>

              <View
                style={
                  isWideScreen
                    ? styles.step2ActionsRowDesktop
                    : styles.step2ActionsColMobile
                }
              >
                <TouchableOpacity
                  style={[
                    styles.secondaryBackTopicBtn,
                    isWideScreen && { flex: 1 },
                  ]}
                  onPress={() => setSelectedTopicForIntro(null)}
                  disabled={isEvaluating}
                  activeOpacity={0.75}
                >
                  <Text style={styles.secondaryBackTopicBtnText}>
                    ← Elegir otro tema
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.primaryAcceptTopicBtn,
                    { backgroundColor: selectedTopicForIntro.accentColor },
                    isWideScreen && { flex: 1.6 },
                  ]}
                  onPress={() =>
                    handleConfirmTopicAndStart(selectedTopicForIntro.key)
                  }
                  disabled={isEvaluating}
                  activeOpacity={0.88}
                >
                  {isEvaluating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons
                        name="sparkles"
                        size={16}
                        color="#FFFFFF"
                        style={{ marginRight: 7 }}
                      />
                      <Text style={styles.primaryAcceptTopicBtnText}>
                        Aceptar y comenzar actividades
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Small-print Psychologist Recommendation */}
              <View style={styles.psychologistSmallPrintBox}>
                <Ionicons
                  name="medical-outline"
                  size={13}
                  color="#64748B"
                  style={{ marginTop: 1 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.psychologistSmallPrintText}>
                    Nota: Estas actividades son un apoyo de bienestar diario. Para una mejor ayuda y atención personalizada, te recomendamos visitar a un psicólogo profesional.
                  </Text>
                  {onOpenPsychologists && (
                    <TouchableOpacity
                      onPress={onOpenPsychologists}
                      activeOpacity={0.75}
                      style={styles.psychologistSmallPrintLinkBtn}
                    >
                      <Text style={styles.psychologistSmallPrintLinkText}>
                        Ver directorio de psicólogos especialistas →
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );

    if (isEmbeddedMode) {
      return fullScreenOnboardingContent;
    }

    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
        {fullScreenOnboardingContent}
      </Modal>
    );
  }

  // ============================================================================
  // MAIN ACTIVITIES DASHBOARD ("ACTIVIDADES DE MEJORA")
  // ============================================================================
  const modalContent = (
    <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopSafeArea]}>
      <ImageViewerModal
        visible={viewerVisible}
        images={viewerImages}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
        inlineOverlay={!isEmbeddedMode}
      />

      {/* Reset / Change Topic Confirmation Modal */}
      {isResetConfirmOpen && (
        <Modal
          visible={isResetConfirmOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsResetConfirmOpen(false)}
          statusBarTranslucent
        >
          <View style={styles.onboardingOverlay}>
            <View style={[styles.onboardingCard, { maxWidth: 440 }]}>
              <View style={styles.step2AnimaHeader}>
                <Image
                  source={require('../../../assets/perfilANIMA.png')}
                  style={[
                    styles.animaAvatarStep2,
                    { borderColor: activeTopic.accentColor },
                  ]}
                  resizeMode="cover"
                />
                <Text style={styles.step2MainTitle}>
                  ¿Cambiar de tema o reiniciar tus actividades?
                </Text>
                <Text style={styles.step2Subtitle}>
                  Si reinicias tu proceso actual de {activeTopic.name}, podrás elegir cualquiera de los 4 temas principales para empezar desde cero.
                </Text>
              </View>

              <View
                style={[
                  styles.step2ExplanationBox,
                  {
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E2E8F0',
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: '#475569',
                    lineHeight: 18,
                    textAlign: 'center',
                  }}
                >
                  Al reiniciar, se borrará tu progreso actual y se eliminarán las publicaciones públicas que hayas subido durante este tema.
                </Text>
              </View>

              <View style={{ gap: 10 }}>
                <TouchableOpacity
                  style={[
                    styles.primaryAcceptTopicBtn,
                    { backgroundColor: activeTopic.accentColor },
                  ]}
                  onPress={handleConfirmResetChallenge}
                  disabled={isResettingAll}
                  activeOpacity={0.88}
                >
                  {isResettingAll ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons
                        name="refresh-outline"
                        size={16}
                        color="#FFFFFF"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.primaryAcceptTopicBtnText}>
                        Sí, reiniciar y elegir nuevo tema
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBackTopicBtn}
                  onPress={() => setIsResetConfirmOpen(false)}
                  disabled={isResettingAll}
                  activeOpacity={0.75}
                >
                  <Text style={styles.secondaryBackTopicBtnText}>
                    Cancelar y continuar en mi tema
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Top Clean White Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerMainTitle}>
            {streak?.status === 'completed'
              ? `¡Tema Superado: ${activeTopic.name}!`
              : 'Actividades de Mejora'}
          </Text>
          <Text style={styles.headerSubTitle}>
            Tema actual: {activeTopic.name} • A tu propio ritmo
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsResetConfirmOpen(true)}
          style={[
            styles.resetTopicHeaderBtn,
            { borderColor: activeTopic.accentColor },
          ]}
          activeOpacity={0.7}
          accessibilityLabel="Cambiar tema"
        >
          <Ionicons name="swap-horizontal-outline" size={13} color={activeTopic.accentColor} />
          <Text
            style={[
              styles.resetTopicHeaderBtnText,
              { color: activeTopic.accentColor },
            ]}
          >
            Cambiar tema
          </Text>
        </TouchableOpacity>
      </View>

      {streak && streak.status === 'completed' ? (
        /* =================== COMPLETED MEDAL CELEBRATION VIEW =================== */
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          <View style={styles.celebrationHeroCard}>
            <Text style={styles.unlockedEmojiBig}>{targetBadge.emoji}</Text>
            <View
              style={[
                styles.levelPillBadge,
                {
                  backgroundColor: activeTopic.softBg,
                  borderColor: activeTopic.borderColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.levelPillBadgeText,
                  { color: activeTopic.accentColor },
                ]}
              >
                MEDALLA DE SUPERACIÓN • {targetBadge.levelLabel}
              </Text>
            </View>
            <Text style={styles.celebrationTitle}>{targetBadge.name}</Text>
            <Text style={styles.celebrationSubtitle}>{targetBadge.description}</Text>

            {/* Supportive Quote from ANIMA */}
            <View style={styles.celebrationQuoteBox}>
              <View style={styles.celebrationQuoteHeader}>
                <Image
                  source={require('../../../assets/perfilANIMA.png')}
                  style={[
                    styles.animaAvatarMedium,
                    { borderColor: activeTopic.accentColor },
                  ]}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.celebrationQuoteAnimaLabel}>Mensaje de ANIMA</Text>
                  <Text style={styles.celebrationQuoteText}>"{celebrationQuote}"</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    setCelebrationQuote(getRandomStreakMotivationalQuote())
                  }
                  style={styles.nextQuoteMiniBtn}
                >
                  <Ionicons name="reload" size={14} color={activeTopic.accentColor} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Optional Share Medal to Community */}
          <View style={styles.cleanWhiteCard}>
            <View style={styles.publishSummaryHeader}>
              <Ionicons
                name="medal-outline"
                size={18}
                color={activeTopic.accentColor}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionTitleText}>
                Compartir mi Medalla en la Comunidad (Opcional)
              </Text>
            </View>
            <Text style={styles.sectionSubText}>
              Si lo deseas, comparte con la comunidad que concluiste tu etapa de {activeTopic.name} y ganaste la {targetBadge.name}:
            </Text>

            <TextInput
              style={styles.cleanInputBox}
              placeholder="Escribe cómo te sientes al concluir este tema..."
              placeholderTextColor="#94A3B8"
              value={summaryPostText}
              onChangeText={setSummaryPostText}
              multiline
              maxLength={350}
            />

            <TouchableOpacity
              style={[
                styles.primaryActionBtn,
                { backgroundColor: activeTopic.accentColor },
                streak.summaryPublished && { backgroundColor: '#10B981' },
              ]}
              onPress={handlePublishTopicSummary}
              disabled={isPublishingSummary || Boolean(streak.summaryPublished)}
              activeOpacity={0.85}
            >
              {isPublishingSummary ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={
                      streak.summaryPublished
                        ? 'checkmark-circle'
                        : 'share-social-outline'
                    }
                    size={18}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.primaryActionBtnText}>
                    {streak.summaryPublished
                      ? 'Logro publicado en Principal ✓'
                      : 'Publicar mi Medalla en Principal'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryOutlineBtn}
              onPress={() => setIsResetConfirmOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="sparkles-outline"
                size={16}
                color="#0F172A"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.secondaryOutlineBtnText}>
                Elegir otro tema para seguir trabajando
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* =================== ACTIVE TOPIC ACTIVITIES DASHBOARD =================== */
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {/* 1. TOPIC & ANIMA SUPPORT HEADER CARD (NO ORANGE, NO FIRE, NO 1/7 COUNTER) */}
          <View style={styles.cleanHeaderCard}>
            <View style={styles.topicBannerRow}>
              <View
                style={[
                  styles.topicPillHeader,
                  {
                    backgroundColor: activeTopic.softBg,
                    borderColor: activeTopic.borderColor,
                  },
                ]}
              >
                <Text style={{ fontSize: 14 }}>{activeTopic.emoji}</Text>
                <Text
                  style={[
                    styles.topicPillHeaderText,
                    { color: activeTopic.accentColor },
                  ]}
                >
                  Trabajando en: {activeTopic.name}
                </Text>
              </View>

              <View style={styles.completedCountSoftPill}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={13}
                  color="#475569"
                />
                <Text style={styles.completedCountSoftPillText}>
                  {completedActivitiesList.length}{' '}
                  {completedActivitiesList.length === 1
                    ? 'actividad realizada'
                    : 'actividades realizadas'}
                </Text>
              </View>
            </View>

            {/* ANIMA Quote Box */}
            <View style={styles.animaSupportQuoteBox}>
              <Image
                source={require('../../../assets/perfilANIMA.png')}
                style={[
                  styles.animaSupportAvatar,
                  { borderColor: activeTopic.accentColor },
                ]}
                resizeMode="cover"
              />
              <Text style={styles.animaSupportQuoteText} numberOfLines={2}>
                "{headerQuote}"
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setHeaderQuote(getRandomStreakMotivationalQuote())
                }
                style={styles.refreshQuoteBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="refresh"
                  size={13}
                  color={activeTopic.accentColor}
                />
              </TouchableOpacity>
            </View>

            {/* Horizontal Strip of Unlimited Activity Steps */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activitiesStepsStrip}
            >
              {streak?.days.map((d) => {
                const isSelected = d.dayNumber === selectedDayNum;
                const isDone = d.status === 'completed';
                const isCurrent = d.dayNumber === streak.currentDayNumber;
                return (
                  <TouchableOpacity
                    key={d.dayNumber}
                    style={[
                      styles.stepChip,
                      isDone && {
                        borderColor: activeTopic.borderColor,
                        backgroundColor: activeTopic.softBg,
                      },
                      isCurrent && {
                        borderColor: activeTopic.accentColor,
                      },
                      isSelected && {
                        backgroundColor: activeTopic.accentColor,
                        borderColor: activeTopic.accentColor,
                      },
                    ]}
                    onPress={() => {
                      setSelectedDayNum(d.dayNumber);
                      setPostponedEncouragementQuote(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.stepChipText,
                        isDone && { color: activeTopic.accentColor },
                        isSelected && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      Act. {d.dayNumber}
                    </Text>
                    {isDone && (
                      <Ionicons
                        name={
                          d.visibility === 'private'
                            ? 'lock-closed'
                            : 'checkmark-circle'
                        }
                        size={11}
                        color={isSelected ? '#FFFFFF' : activeTopic.accentColor}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 2. CURRENT INTERACTIVE ACTIVITY CARD */}
          {activeDayObj && (
            <View style={[styles.cleanWhiteCard, { padding: 16 }]}>
              <View style={styles.activityCardTopRow}>
                <View
                  style={[
                    styles.activityLabelBadge,
                    {
                      backgroundColor: activeTopic.softBg,
                      borderColor: activeTopic.borderColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.activityLabelBadgeText,
                      { color: activeTopic.accentColor },
                    ]}
                  >
                    {activeDayObj.dayName} • {activeTopic.name}
                  </Text>
                </View>

                {activeDayObj.status !== 'completed' ? (
                  <TouchableOpacity
                    style={styles.swapActivityBtn}
                    onPress={handleSwapTask}
                    disabled={isSwappingTask}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="shuffle-outline"
                      size={14}
                      color={activeTopic.accentColor}
                    />
                    <Text
                      style={[
                        styles.swapActivityBtnText,
                        { color: activeTopic.accentColor },
                      ]}
                    >
                      Otra actividad (100 disponibles)
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completedGrayTag}>
                    <Ionicons
                      name={
                        activeDayObj.visibility === 'private'
                          ? 'lock-closed'
                          : 'earth'
                      }
                      size={12}
                      color="#475569"
                    />
                    <Text style={styles.completedGrayTagText}>
                      {activeDayObj.visibility === 'private'
                        ? 'Guardada en privado'
                        : 'Publicada en comunidad'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Activity Title & Description */}
              <View style={styles.activityTitleRow}>
                <Text style={styles.activityEmojiLarge}>
                  {activeDayObj.task.emoji}
                </Text>
                <Text style={styles.activityMainTitle}>
                  {activeDayObj.task.title}
                </Text>
              </View>

              <View style={styles.taskDescriptionBox}>
                <Text style={styles.taskDescriptionText}>
                  {activeDayObj.task.description}
                </Text>
              </View>

              {postponedEncouragementQuote && (
                <View style={styles.cleanAnimaNoteBox}>
                  <Image
                    source={require('../../../assets/perfilANIMA.png')}
                    style={[
                      styles.animaAvatarMedium,
                      { borderColor: activeTopic.accentColor },
                    ]}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cleanAnimaNoteTitle}>
                      ANIMA está contigo:
                    </Text>
                    <Text style={styles.cleanAnimaNoteText}>
                      "{postponedEncouragementQuote}"
                    </Text>
                  </View>
                </View>
              )}

              {activeDayObj.status === 'completed' &&
              activeDayObj.evidenceImageUrl ? (
                <View style={styles.completedDayPreviewBox}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                      handleOpenGalleryPhoto(activeDayObj.evidenceImageUrl!)
                    }
                  >
                    <Image
                      source={{ uri: activeDayObj.evidenceImageUrl }}
                      style={styles.completedDayPreviewImg}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <Text style={styles.completedDayPreviewStatus}>
                    {activeDayObj.visibility === 'private'
                      ? 'Actividad guardada en privado (solo visible para ti)'
                      : 'Actividad compartida con la comunidad'}
                  </Text>
                  {activeDayObj.evidenceNote ? (
                    <Text style={styles.completedDayPreviewNote}>
                      "{activeDayObj.evidenceNote}"
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View style={styles.publishSectionWrap}>
                  <Text style={styles.registerSectionTitle}>
                    Registrar mi actividad
                  </Text>

                  {/* Photo + Comment Row */}
                  <View style={styles.photoAndCommentRow}>
                    <TouchableOpacity
                      style={styles.photoPickerCompactBox}
                      onPress={handlePickEvidencePhoto}
                      activeOpacity={0.85}
                    >
                      {evidencePhotoUri ? (
                        <Image
                          source={{ uri: evidencePhotoUri }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <>
                          <Ionicons
                            name="camera-outline"
                            size={22}
                            color={activeTopic.accentColor}
                          />
                          <Text style={styles.photoPickerCompactText}>
                            Subir foto
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TextInput
                      style={styles.commentCompactInput}
                      placeholder="Escribe cómo te sentiste al realizar esta actividad... (opcional)"
                      placeholderTextColor="#94A3B8"
                      value={evidenceNote}
                      onChangeText={setEvidenceNote}
                      multiline
                      maxLength={280}
                    />
                  </View>

                  {/* PUBLIC VS PRIVATE SELECTOR */}
                  <Text style={styles.visibilitySectionLabel}>
                    ¿Cómo deseas guardar tu actividad?
                  </Text>
                  <View style={styles.visibilityToggleRow}>
                    <TouchableOpacity
                      style={[
                        styles.visibilityOptionBtn,
                        evidenceVisibility === 'public' && {
                          backgroundColor: activeTopic.softBg,
                          borderColor: activeTopic.accentColor,
                        },
                      ]}
                      onPress={() => setEvidenceVisibility('public')}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="earth-outline"
                        size={15}
                        color={
                          evidenceVisibility === 'public'
                            ? activeTopic.accentColor
                            : '#64748B'
                        }
                      />
                      <Text
                        style={[
                          styles.visibilityOptionText,
                          evidenceVisibility === 'public' && {
                            color: activeTopic.accentColor,
                            fontWeight: '800',
                          },
                        ]}
                      >
                        Publicar en comunidad
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.visibilityOptionBtn,
                        evidenceVisibility === 'private' && {
                          backgroundColor: activeTopic.softBg,
                          borderColor: activeTopic.accentColor,
                        },
                      ]}
                      onPress={() => setEvidenceVisibility('private')}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={15}
                        color={
                          evidenceVisibility === 'private'
                            ? activeTopic.accentColor
                            : '#64748B'
                        }
                      />
                      <Text
                        style={[
                          styles.visibilityOptionText,
                          evidenceVisibility === 'private' && {
                            color: activeTopic.accentColor,
                            fontWeight: '800',
                          },
                        ]}
                      >
                        Mantener privada
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Save / Publish Activity Button */}
                  <TouchableOpacity
                    style={[
                      styles.primaryActionBtn,
                      { backgroundColor: activeTopic.accentColor },
                    ]}
                    onPress={handleCompleteSelectedDay}
                    disabled={isSubmittingDay}
                    activeOpacity={0.85}
                  >
                    {isSubmittingDay ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons
                          name={
                            evidenceVisibility === 'private'
                              ? 'lock-closed'
                              : 'checkmark-circle'
                          }
                          size={17}
                          color="#FFFFFF"
                          style={{ marginRight: 7 }}
                        />
                        <Text style={styles.primaryActionBtnText}>
                          {evidenceVisibility === 'private'
                            ? 'Guardar actividad en privado'
                            : 'Publicar actividad en comunidad'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Gentle Pause / Postpone Button */}
                  <TouchableOpacity
                    style={styles.postponeCleanBtn}
                    onPress={handlePostponeDay}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="heart-outline"
                      size={14}
                      color={activeTopic.accentColor}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.postponeCleanBtnText}>
                      Hoy prefiero descansar • Hacerlo en otro momento y recibir ánimo
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* 3. USER DECIDES WHEN TO STOP & CLAIM MEDAL */}
          <View
            style={[
              styles.cleanWhiteCard,
              {
                borderColor: activeTopic.borderColor,
                backgroundColor: '#FFFFFF',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <View
                style={[
                  styles.medalPreviewCircle,
                  {
                    backgroundColor: activeTopic.softBg,
                    borderColor: activeTopic.borderColor,
                  },
                ]}
              >
                <Text style={{ fontSize: 24 }}>{targetBadge.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.concludeCardTitle}>
                  Tú decides hasta dónde parar
                </Text>
                <Text style={styles.concludeCardSub}>
                  Cuando sientas que estas actividades ya te ayudaron a superar o sentirte mejor respecto a {activeTopic.name}, concluye el tema para recibir tu{' '}
                  <Text style={{ fontWeight: '800', color: activeTopic.accentColor }}>
                    {targetBadge.name}
                  </Text>
                  .
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.concludeMedalBtn,
                {
                  borderColor: activeTopic.accentColor,
                  backgroundColor: activeTopic.softBg,
                },
              ]}
              onPress={handleConcludeTopicForMedal}
              disabled={isConcludingTopic}
              activeOpacity={0.85}
            >
              {isConcludingTopic ? (
                <ActivityIndicator size="small" color={activeTopic.accentColor} />
              ) : (
                <>
                  <Ionicons
                    name="medal-outline"
                    size={17}
                    color={activeTopic.accentColor}
                    style={{ marginRight: 7 }}
                  />
                  <Text
                    style={[
                      styles.concludeMedalBtnText,
                      { color: activeTopic.accentColor },
                    ]}
                  >
                    Concluir tema y recibir mi {targetBadge.name}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 4. GALLERY OF COMPLETED ACTIVITIES */}
          {completedActivitiesList.length > 0 && (
            <View style={[styles.cleanWhiteCard, { padding: 14 }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#0F172A' }}>
                  Mis Actividades Realizadas
                </Text>
                <View style={styles.countGrayBadge}>
                  <Text style={styles.countGrayBadgeText}>
                    {completedActivitiesList.length} registradas
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {completedActivitiesList.map((d) => (
                  <TouchableOpacity
                    key={d.dayNumber}
                    style={[
                      styles.completedThumbCard,
                      d.dayNumber === selectedDayNum && {
                        borderColor: activeTopic.accentColor,
                        borderWidth: 2,
                      },
                    ]}
                    activeOpacity={0.88}
                    onPress={() => {
                      setSelectedDayNum(d.dayNumber);
                      if (d.evidenceImageUrl) {
                        handleOpenGalleryPhoto(d.evidenceImageUrl);
                      }
                    }}
                  >
                    {d.evidenceImageUrl ? (
                      <Image
                        source={{ uri: d.evidenceImageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : null}
                    <View style={styles.completedThumbBadge}>
                      <Text style={styles.completedThumbBadgeText}>
                        Act. {d.dayNumber}{' '}
                        {d.visibility === 'private' ? '🔒' : '🌍'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 5. MEDALS FOR THE 4 TOPICS */}
          <View style={[styles.cleanWhiteCard, { paddingVertical: 12, paddingHorizontal: 14 }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#475569' }}>
                Medallas de Superación
              </Text>
              <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#94A3B8' }}>
                {result.unlockedBadges?.length || 0} / 4 obtenidas
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {OFFICIAL_STREAK_BADGES.map((b) => {
                const isUnlocked = Boolean(result.unlockedBadges?.includes(b.id));
                return (
                  <View
                    key={b.id}
                    style={{
                      flex: 1,
                      backgroundColor: isUnlocked ? b.softBg : '#F8FAFC',
                      borderRadius: 12,
                      paddingVertical: isUnlocked ? 10 : 8,
                      paddingHorizontal: 4,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: isUnlocked ? 1.5 : 1,
                      borderColor: isUnlocked ? b.color : '#E2E8F0',
                      opacity: isUnlocked ? 1 : 0.55,
                    }}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 3 }}>{b.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 9.2,
                        fontWeight: '800',
                        color: isUnlocked ? b.color : '#64748B',
                        textAlign: 'center',
                      }}
                      numberOfLines={1}
                    >
                      {b.name.replace('Medalla de ', '')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Small-print Psychologist Recommendation */}
          <View style={styles.psychologistSmallPrintBox}>
            <Ionicons
              name="medical-outline"
              size={13}
              color="#64748B"
              style={{ marginTop: 1 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.psychologistSmallPrintText}>
                Nota: Estas actividades son un apoyo de bienestar diario. Para una mejor ayuda y atención personalizada, te recomendamos visitar a un psicólogo profesional.
              </Text>
              {onOpenPsychologists && (
                <TouchableOpacity
                  onPress={onOpenPsychologists}
                  activeOpacity={0.75}
                  style={styles.psychologistSmallPrintLinkBtn}
                >
                  <Text style={styles.psychologistSmallPrintLinkText}>
                    Ver directorio de psicólogos especialistas →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ height: 24 }} />
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
  resetTopicHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  resetTopicHeaderBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  /* Full-Screen Onboarding Step 1 (2x2 Grid) & Step 2 (ANIMA Explanation) */
  onboardingFullSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  onboardingDesktopSafeArea: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },
  onboardingFullTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  onboardingBackNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  onboardingBackNavBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  onboardingFullScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  onboardingCenterContainer: {
    width: '100%',
    maxWidth: 780,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  onboardingStep2CenterContainer: {
    width: '100%',
    maxWidth: 560,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 26,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  onboardingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  onboardingCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 10,
  },
  calmPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  calmPillBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  onboardingCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animaHeroCenteredSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  animaAvatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  animaAvatarOnboarding: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2.5,
    borderColor: '#3B82F6',
  },
  animaTagMiniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 10,
    marginBottom: 8,
  },
  animaTagMiniPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  onboardingTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 27,
  },
  onboardingDescription: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 530,
  },
  selectPromptText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 14,
  },
  topicsTwoByTwoGrid: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    alignSelf: 'center',
  },
  topicsFourInRowGrid: {
    maxWidth: 760,
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  topicGridCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  topicGridCardFourInRow: {
    flex: 1,
    width: '23%',
  },
  topicSquareImageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F1F5F9',
  },
  topicSquareImage: {
    width: '100%',
    height: '100%',
  },
  topicCardFooter: {
    paddingVertical: 11,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  topicCardName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  topicCardSubLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  psychologistSmallPrintBox: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 7,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'center',
  },
  psychologistSmallPrintText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    textAlign: 'left',
  },
  psychologistSmallPrintLinkBtn: {
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  psychologistSmallPrintLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  /* Step 2 Styles */
  step2AnimaHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  animaAvatarStep2: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2.5,
    marginBottom: 12,
  },
  step2TopicTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  step2TopicTagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  step2MainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  step2Subtitle: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    paddingHorizontal: 6,
  },
  step2ExplanationBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  step2BulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    marginBottom: 12,
  },
  step2BulletIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  step2BulletText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  step2ActionsRowDesktop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  step2ActionsColMobile: {
    width: '100%',
    flexDirection: 'column-reverse',
    gap: 9,
  },
  primaryAcceptTopicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  primaryAcceptTopicBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryBackTopicBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBackTopicBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  /* Dashboard Body */
  scrollBody: {
    flex: 1,
  },
  resultScrollContent: {
    padding: 12,
  },
  cleanHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topicBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  topicPillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  topicPillHeaderText: {
    fontSize: 12,
    fontWeight: '800',
  },
  completedCountSoftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 10,
  },
  completedCountSoftPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  animaSupportQuoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 10,
  },
  animaSupportAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  animaSupportQuoteText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 16.5,
  },
  refreshQuoteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activitiesStepsStrip: {
    gap: 6,
    paddingVertical: 2,
  },
  stepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  cleanWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  activityLabelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  activityLabelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  swapActivityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  swapActivityBtnText: {
    fontSize: 11,
    fontWeight: '700',
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
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  activityEmojiLarge: {
    fontSize: 28,
  },
  activityMainTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 22,
  },
  taskDescriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  taskDescriptionText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  cleanAnimaNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 12,
  },
  animaAvatarMedium: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
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
  publishSectionWrap: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  registerSectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  photoAndCommentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  photoPickerCompactBox: {
    width: 92,
    height: 76,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPickerCompactText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
  },
  commentCompactInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#0F172A',
    minHeight: 76,
    textAlignVertical: 'top',
  },
  visibilitySectionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  visibilityToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  visibilityOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  visibilityOptionText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  postponeCleanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  postponeCleanBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
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
    height: 190,
    borderRadius: 12,
    marginBottom: 10,
  },
  completedDayPreviewStatus: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  completedDayPreviewNote: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 4,
  },
  /* Conclude Topic & Claim Medal Card */
  medalPreviewCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  concludeCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  concludeCardSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17.5,
    marginTop: 2,
  },
  concludeMedalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  concludeMedalBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  /* Completed Activities Strip */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  countGrayBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 9,
  },
  countGrayBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  completedThumbCard: {
    width: 82,
    height: 82,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  completedThumbBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingVertical: 2,
    borderRadius: 5,
    alignItems: 'center',
  },
  completedThumbBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  /* Celebration View */
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
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  levelPillBadgeText: {
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
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
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
  secondaryOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryOutlineBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
});
