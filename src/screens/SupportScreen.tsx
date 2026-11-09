import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/Header/AppHeader';
import { SUPPORT_MESSAGES, SupportMessage, getRandomSupportMessage } from '../data/supportMessages';
import { PsychologyTestModal } from '../components/PsychologyTest/PsychologyTestModal';
import { subscribeToUserTestAndStreak } from '../services/psychologyTestService';
import { TestResult } from '../types/psychologyTest';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

interface SupportScreenProps {
  onOpenMenu: () => void;
  onJoinPress: () => void;
  onProfilePress: () => void;
  onOpenPsychologists: () => void;
  onOpenCreatePost: () => void;
  onOpenRacha?: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
  hideAppHeader?: boolean;
}

const CARD_SPACING = 14;

export const SupportScreen: React.FC<SupportScreenProps> = ({
  onOpenMenu,
  onJoinPress,
  onProfilePress,
  onOpenPsychologists,
  onOpenCreatePost,
  onOpenRacha,
  contentPaddingTop = 0,
  contentPaddingBottom = 80,
  hideAppHeader = false,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && windowWidth >= 1024;
  const cardWidth = isDesktop
    ? Math.min(Math.max(windowWidth - 662, 440), 660)
    : (windowWidth - 52);

  const { user } = useAuth();
  const [currentMessage, setCurrentMessage] = useState<SupportMessage>(getRandomSupportMessage());
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [testModalMode, setTestModalMode] = useState<'questionnaire' | 'result'>('questionnaire');

  useEffect(() => {
    const unsub = subscribeToUserTestAndStreak(user?.id, (res) => {
      setLatestResult(res || null);
    });
    return () => unsub();
  }, [user?.id]);

  const hasActiveChallenge = Boolean(latestResult?.streakState?.isActive);
  const completedChallengeDays = latestResult?.streakState?.completedDaysCount || 0;

  const handleNextMessage = () => {
    let nextMsg = getRandomSupportMessage();
    if (nextMsg.id === currentMessage.id) {
      nextMsg = getRandomSupportMessage();
    }
    setCurrentMessage(nextMsg);
  };

  const handleTestCompleted = (newResult: TestResult) => {
    setLatestResult(newResult);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Reciente';
    try {
      const d = new Date(isoString);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return 'Reciente';
    }
  };

  const handleCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = e.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / (cardWidth + CARD_SPACING));
    if (index !== activeCardIndex && index >= 0 && index < 3) {
      setActiveCardIndex(index);
    }
  };

  const handleOpenOrJoinChallenge = () => {
    if (hasActiveChallenge) {
      if (onOpenRacha) {
        onOpenRacha();
        return;
      }
      setTestModalMode('result');
      setIsTestModalOpen(true);
      return;
    }
    setTestModalMode('questionnaire');
    setIsTestModalOpen(true);
  };

  const carouselCards = [
    {
      id: 'reto',
      title: 'ACTIVIDADES DE APOYO',
      description:
        'Un espacio de actividades guiadas por ANIMA para acompañarte y hacerte sentir mejor a tu propio ritmo en el tema que elijas.',
      image: 'https://i.pinimg.com/1200x/8f/f4/ba/8ff4ba8f214a91d8e34718a2c69b3563.jpg',
      onPress: handleOpenOrJoinChallenge,
      buttonText: hasActiveChallenge
        ? 'Ir a mis actividades'
        : 'Comenzar actividades',
      icon: 'sparkles-outline' as const,
    },
    {
      id: 'psicologos',
      title: 'VER ESPECIALISTAS',
      description: 'Encuentra psicólogos verificados y comunícate directamente por WhatsApp o correo para solicitar tu consulta.',
      image: 'https://i.pinimg.com/736x/14/3d/44/143d44f1e3120d56f49453d125a037ee.jpg',
      onPress: onOpenPsychologists,
      buttonText: 'Ver especialistas',
      icon: 'people-outline' as const,
    },
    {
      id: 'desahogo',
      title: 'DESAHOGARME',
      description: 'Expresa libremente lo que estás viviendo en un espacio seguro, empático y libre de juicios de la comunidad.',
      image: 'https://i.pinimg.com/1200x/61/20/0c/61200c66c482f3e3e90015d2859db327.jpg',
      onPress: onOpenCreatePost,
      buttonText: 'Crear publicación',
      icon: 'heart-half-outline' as const,
    },
  ];

  if (isDesktop && isTestModalOpen && hasActiveChallenge) {
    return (
      <View style={styles.container}>
        <PsychologyTestModal
          visible={true}
          userId={user?.id}
          initialResult={latestResult}
          startMode="result"
          onClose={() => setIsTestModalOpen(false)}
          onNavigateToProfile={() => {
            setIsTestModalOpen(false);
            if (onOpenRacha) onOpenRacha();
          }}
          onOpenPsychologists={onOpenPsychologists}
          onOpenCreatePost={onOpenCreatePost}
          onRequireAuth={onJoinPress}
          onTestCompleted={handleTestCompleted}
          embedded={true}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top App Header */}
      {!hideAppHeader && (
        <AppHeader
          onOpenMenu={onOpenMenu}
          onJoinPress={onJoinPress}
          onProfilePress={onProfilePress}
        />
      )}

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && { maxWidth: 740, width: '100%', alignSelf: 'center' },
          {
            paddingTop: contentPaddingTop + 8,
            paddingBottom: contentPaddingBottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
      >
        {/* 1. TOP EMPATHETIC PHRASE CARD (ANIMA - Mensaje de Apoyo) */}
        <TouchableOpacity
          style={[styles.quoteCard, isDesktop && { width: 'auto', marginHorizontal: 16 }]}
          activeOpacity={0.9}
          onPress={handleNextMessage}
        >
          <View style={styles.quoteTopRow}>
            <View style={styles.quoteAnimaBadgeRow}>
              <Image
                source={require('../../assets/perfilANIMA.png')}
                style={styles.quoteAnimaAvatar}
                resizeMode="cover"
              />
              <View>
                <View style={styles.quoteAnimaNameRow}>
                  <Text style={styles.quoteAnimaName}>ANIMA</Text>
                  <Ionicons name="sparkles" size={12} color="#3B82F6" style={{ marginLeft: 3 }} />
                </View>
                <Text style={styles.quoteAnimaSubtitle}>Un recordatorio para ti</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleNextMessage}
              style={styles.discreetRefreshBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Ver otro mensaje"
            >
              <Ionicons name="refresh-outline" size={15} color={colors.coffeePrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.quoteHighlightText}>{currentMessage.highlight}</Text>
          <Text style={styles.quoteBodyText}>{currentMessage.text}</Text>

          <View style={styles.quoteFooterRow}>
            <Text style={styles.quoteFooterSign}>— Con amor, ANIMA 💙</Text>
          </View>
        </TouchableOpacity>

        {/* 2. THE 3 MAIN CARDS (Responsive: 3-column row on Desktop, Carousel on Mobile) */}
        {isDesktop ? (
          <View style={styles.desktopCardsRow}>
            {carouselCards.map((card, idx) => (
              <TouchableOpacity
                key={card.id}
                style={styles.desktopCard}
                activeOpacity={0.92}
                onPress={card.onPress}
              >
                <View style={styles.desktopCardImageWrapper}>
                  <Image source={{ uri: card.image }} style={styles.cardImage} resizeMode="cover" />
                  <View style={styles.cardImageOverlay} />
                  <View style={styles.cardImageBadge}>
                    <Ionicons name={card.icon} size={12} color={colors.white} style={{ marginRight: 4 }} />
                    <Text style={styles.cardImageBadgeText}>Opción {idx + 1} de 3</Text>
                  </View>
                </View>

                <View style={styles.desktopCardBody}>
                  <Text style={styles.desktopCardTitle}>{card.title}</Text>
                  <Text style={styles.desktopCardDesc} numberOfLines={3}>
                    {card.description}
                  </Text>
                  <View style={styles.cardActionBtn}>
                    <Text style={styles.cardActionBtnText}>{card.buttonText}</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.white} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.carouselSection}>
            <ScrollView
              horizontal
              pagingEnabled={false}
              snapToInterval={cardWidth + CARD_SPACING}
              snapToAlignment="start"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselScrollContent}
              onScroll={handleCarouselScroll}
              scrollEventThrottle={16}
            >
              {carouselCards.map((card, idx) => (
                <TouchableOpacity
                  key={card.id}
                  style={[styles.carouselCard, { width: cardWidth }]}
                  activeOpacity={0.92}
                  onPress={card.onPress}
                >
                  {/* Large Image Banner */}
                  <View style={styles.cardImageWrapper}>
                    <Image source={{ uri: card.image }} style={styles.cardImage} resizeMode="cover" />
                    <View style={styles.cardImageOverlay} />
                    <View style={styles.cardImageBadge}>
                      <Ionicons name={card.icon} size={13} color={colors.white} style={{ marginRight: 5 }} />
                      <Text style={styles.cardImageBadgeText}>Opción {idx + 1} de 3</Text>
                    </View>
                  </View>

                  {/* Content */}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardDesc} numberOfLines={3}>
                      {card.description}
                    </Text>

                    {/* Clean Action Button */}
                    <View style={styles.cardActionBtn}>
                      <Text style={styles.cardActionBtnText}>{card.buttonText}</Text>
                      <Ionicons name="arrow-forward" size={14} color={colors.white} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Dots Indicator */}
            <View style={styles.dotsContainer}>
              {carouselCards.map((_, dotIdx) => (
                <View
                  key={dotIdx}
                  style={[
                    styles.dot,
                    dotIdx === activeCardIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* 3. ACTIVE SUPPORT ACTIVITIES STATUS CARD */}
        {hasActiveChallenge && latestResult && (
          <View style={[styles.latestTestCard, isDesktop && { maxWidth: 880, width: '100%', alignSelf: 'center' }]}>
            <View style={styles.latestTestHeader}>
              <View style={styles.latestTestTitleRow}>
                <Ionicons name="sparkles" size={17} color="#3B82F6" style={{ marginRight: 6 }} />
                <Text style={styles.latestTestMainTitle}>Tus Actividades de Mejora en curso</Text>
              </View>
              <Text style={styles.latestTestDate}>{formatDate(latestResult.createdAt)}</Text>
            </View>

            <View style={[styles.resultTagBox, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.resultTagText, { color: '#2563EB' }]}>
                {latestResult.streakState?.focusTitle || 'Actividades de Apoyo'} • A tu propio ritmo
              </Text>
            </View>

            <Text style={styles.latestTestSummary} numberOfLines={3}>
              Avanza en tus actividades cada vez que sientas que lo necesitas, eligiendo si deseas compartirlas o mantenerlas privadas. Cuando decidas concluir tu tema, recibirás tu medalla.
            </Text>

            <View style={styles.testCardActionsRow}>
              <TouchableOpacity
                style={styles.viewResultBtn}
                activeOpacity={0.85}
                onPress={handleOpenOrJoinChallenge}
              >
                <Ionicons name="sparkles-outline" size={15} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.viewResultBtnText}>Ir a mis Actividades de Mejora</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Compact Challenge Invitation / Racha Modal */}
      <PsychologyTestModal
        visible={isTestModalOpen}
        userId={user?.id}
        initialResult={latestResult}
        startMode={testModalMode}
        onClose={() => setIsTestModalOpen(false)}
        onNavigateToProfile={() => {
          if (onOpenRacha) {
            setIsTestModalOpen(false);
            onOpenRacha();
          }
        }}
        onOpenPsychologists={onOpenPsychologists}
        onOpenCreatePost={onOpenCreatePost}
        onRequireAuth={onJoinPress}
        onTestCompleted={(res) => {
          handleTestCompleted(res);
          if (onOpenRacha) {
            setIsTestModalOpen(false);
            onOpenRacha();
          }
        }}
        embedded={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  /* 1. Quote Card (Matches Bottom Comfort Card Style) */
  quoteCard: {
    backgroundColor: colors.surfaceSoft,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    marginBottom: 16,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  quoteTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quoteAnimaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quoteAnimaAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  quoteAnimaNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteAnimaName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  quoteAnimaSubtitle: {
    fontSize: 10.5,
    color: '#3B82F6',
    fontWeight: '600',
  },
  discreetRefreshBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quoteHighlightText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.coffeeDark,
    lineHeight: 22,
    marginBottom: 4,
  },
  quoteBodyText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  quoteFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  quoteFooterSign: {
    fontSize: 11.5,
    color: '#2563EB',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  /* Desktop 3-Card Row */
  desktopCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  desktopCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2.5,
  },
  desktopCardImageWrapper: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#F3EAE3',
  },
  desktopCardBody: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  desktopCardTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: colors.coffeeDark,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  desktopCardDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  /* 2. Horizontal Swiper / Carousel */
  carouselSection: {
    marginBottom: 16,
  },
  carouselScrollContent: {
    paddingHorizontal: 16,
    gap: CARD_SPACING,
  },
  carouselCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImageWrapper: {
    width: '100%',
    height: 235,
    position: 'relative',
    backgroundColor: '#F3EAE3',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' ? ({ objectFit: 'cover' } as any) : {}),
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  cardImageBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 34, 24, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 10,
  },
  cardImageBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.coffeeDark,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coffeePrimary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  cardActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
  },
  /* Carousel Dots */
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5DCD6',
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coffeePrimary,
  },
  /* 3. Latest Test Card */
  latestTestCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  latestTestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  latestTestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  latestTestMainTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  latestTestDate: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  resultTagBox: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultTagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  latestTestSummary: {
    fontSize: 12.5,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 12,
  },
  testCardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewResultBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coffeePrimary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  viewResultBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.white,
  },
  retakeTestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  retakeTestBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
});
