import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/Header/AppHeader';
import { SUPPORT_MESSAGES, SupportMessage, getRandomSupportMessage } from '../data/supportMessages';
import { PsychologyTestModal } from '../components/PsychologyTest/PsychologyTestModal';
import { getLatestTestResult } from '../services/psychologyTestService';
import { TestResult } from '../types/psychologyTest';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

interface SupportScreenProps {
  onOpenMenu: () => void;
  onJoinPress: () => void;
  onProfilePress: () => void;
  onOpenPsychologists: () => void;
  onOpenCreatePost: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 52;
const CARD_SPACING = 14;

export const SupportScreen: React.FC<SupportScreenProps> = ({
  onOpenMenu,
  onJoinPress,
  onProfilePress,
  onOpenPsychologists,
  onOpenCreatePost,
  contentPaddingTop = 0,
  contentPaddingBottom = 80,
}) => {
  const { user } = useAuth();
  const [currentMessage, setCurrentMessage] = useState<SupportMessage>(getRandomSupportMessage());
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [testModalMode, setTestModalMode] = useState<'questionnaire' | 'result'>('questionnaire');

  useEffect(() => {
    getLatestTestResult(user?.id).then((res) => {
      if (res) setLatestResult(res);
    });
  }, [user]);

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
    const index = Math.round(scrollX / (CARD_WIDTH + CARD_SPACING));
    if (index !== activeCardIndex && index >= 0 && index < 3) {
      setActiveCardIndex(index);
    }
  };

  const carouselCards = [
    {
      id: 'test',
      title: 'REALIZAR TEST',
      description: 'Autodiagnóstico orientativo para evaluar tu estado de ánimo, niveles de ansiedad, estrés y calidad de descanso.',
      image: 'https://i.pinimg.com/1200x/8f/f4/ba/8ff4ba8f214a91d8e34718a2c69b3563.jpg',
      onPress: () => {
        setTestModalMode('questionnaire');
        setIsTestModalOpen(true);
      },
      buttonText: 'Comenzar test',
      icon: 'clipboard-outline' as const,
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

  return (
    <View style={styles.container}>
      {/* Top App Header */}
      <AppHeader
        onOpenMenu={onOpenMenu}
        onJoinPress={onJoinPress}
        onProfilePress={onProfilePress}
      />

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: contentPaddingTop + 8,
            paddingBottom: contentPaddingBottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TOP EMPATHETIC PHRASE CARD (Clean Sparkle + Rotating Phrase) */}
        <TouchableOpacity
          style={styles.quoteCard}
          activeOpacity={0.9}
          onPress={handleNextMessage}
        >
          <View style={styles.quoteTopRow}>
            <View style={styles.quoteIconBadge}>
              <Ionicons name="sparkles" size={16} color={colors.coffeePrimary} />
            </View>
            <TouchableOpacity
              onPress={handleNextMessage}
              style={styles.discreetRefreshBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="refresh-outline" size={15} color={colors.coffeePrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.quoteHighlightText}>{currentMessage.highlight}</Text>
          <Text style={styles.quoteBodyText}>{currentMessage.text}</Text>
        </TouchableOpacity>

        {/* 2. THE 3 MAIN CARDS IN A HORIZONTAL SLIDER (SWIPER) */}
        <View style={styles.carouselSection}>
          <ScrollView
            horizontal
            pagingEnabled={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
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
                style={styles.carouselCard}
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

        {/* 3. LATEST TEST EVALUATION SUMMARY (Clean & Aesthetic) */}
        {latestResult && (
          <View style={styles.latestTestCard}>
            <View style={styles.latestTestHeader}>
              <View style={styles.latestTestTitleRow}>
                <Ionicons name="pulse" size={17} color={latestResult.badgeColor} style={{ marginRight: 6 }} />
                <Text style={styles.latestTestMainTitle}>Tu última autoevaluación</Text>
              </View>
              <Text style={styles.latestTestDate}>{formatDate(latestResult.createdAt)}</Text>
            </View>

            <View style={[styles.resultTagBox, { backgroundColor: latestResult.badgeColor + '15' }]}>
              <Text style={[styles.resultTagText, { color: latestResult.badgeColor }]}>
                {latestResult.levelTitle}
              </Text>
            </View>

            <Text style={styles.latestTestSummary} numberOfLines={3}>
              {latestResult.summary}
            </Text>

            {/* 2 Separated Distinct Buttons */}
            <View style={styles.testCardActionsRow}>
              {/* Button 1: Ver evaluación */}
              <TouchableOpacity
                style={styles.viewResultBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setTestModalMode('result');
                  setIsTestModalOpen(true);
                }}
              >
                <Ionicons name="eye-outline" size={15} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.viewResultBtnText}>Ver evaluación</Text>
              </TouchableOpacity>

              {/* Button 2: Repetir test */}
              <TouchableOpacity
                style={styles.retakeTestBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setTestModalMode('questionnaire');
                  setIsTestModalOpen(true);
                }}
              >
                <Ionicons name="refresh-outline" size={15} color={colors.coffeeDark} style={{ marginRight: 6 }} />
                <Text style={styles.retakeTestBtnText}>Repetir test</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Psychology Test Modal */}
      <PsychologyTestModal
        visible={isTestModalOpen}
        userId={user?.id}
        initialResult={latestResult}
        startMode={testModalMode}
        onClose={() => setIsTestModalOpen(false)}
        onOpenPsychologists={onOpenPsychologists}
        onOpenCreatePost={onOpenCreatePost}
        onTestCompleted={handleTestCompleted}
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
    backgroundColor: '#FAF7F5',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.2,
    borderColor: '#EAE3DF',
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
  quoteIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EAE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discreetRefreshBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAE3DF',
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
  /* 2. Horizontal Swiper / Carousel */
  carouselSection: {
    marginBottom: 16,
  },
  carouselScrollContent: {
    paddingHorizontal: 16,
    gap: CARD_SPACING,
  },
  carouselCard: {
    width: CARD_WIDTH,
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
    backgroundColor: '#FAF7F5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE3DF',
  },
  retakeTestBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
});
