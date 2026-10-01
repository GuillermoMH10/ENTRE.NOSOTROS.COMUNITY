import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MONTHS_DATA, MonthTheme } from '../data/monthsData';
import { MonthDetailModal } from '../components/Blog/MonthDetailModal';
import { Psychologist } from '../types/psychologist';
import { subscribeToPsychologists } from '../services/psychologistsService';
import { PsychologistDetailModal } from '../components/Psychologists/PsychologistDetailModal';
import { AppHeader } from '../components/Header/AppHeader';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface BlogScreenProps {
  onOpenMenu: () => void;
  onJoinPress: () => void;
  onProfilePress: () => void;
  onOpenPsychologists?: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SINGLE_CARD_WIDTH = SCREEN_WIDTH - 32;

export const BlogScreen: React.FC<BlogScreenProps> = ({
  onOpenMenu,
  onJoinPress,
  onProfilePress,
  onOpenPsychologists,
  contentPaddingTop = 0,
  contentPaddingBottom = 80,
}) => {
  // Current month index (0 = Enero, ... 11 = Diciembre)
  const currentMonthIndex = new Date().getMonth();
  const currentMonthData: MonthTheme = MONTHS_DATA[currentMonthIndex] || MONTHS_DATA[0];

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMonthForDetail, setSelectedMonthForDetail] = useState<number>(currentMonthIndex);
  const [carouselActiveIndex, setCarouselActiveIndex] = useState<number>(currentMonthIndex);

  // Psychologists state
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [selectedPsicoForDetail, setSelectedPsicoForDetail] = useState<Psychologist | null>(null);

  const carouselScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPsychologists((data) => {
      setPsychologists(data);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenMonth = (index: number) => {
    setSelectedMonthForDetail(index);
    setIsDetailModalOpen(true);
  };

  const handleCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (SINGLE_CARD_WIDTH + 14));
    if (index >= 0 && index < MONTHS_DATA.length && index !== carouselActiveIndex) {
      setCarouselActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar identical to Principal */}
      <AppHeader
        onOpenMenu={onOpenMenu}
        onJoinPress={onJoinPress}
        onProfilePress={onProfilePress}
      />

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: contentPaddingTop + 12,
            paddingBottom: contentPaddingBottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* CURRENT MONTH HERO SPOTLIGHT CARD */}
        <View style={styles.heroSection}>
          <TouchableOpacity
            style={[
              styles.heroCardOuter,
              {
                borderColor: currentMonthData.primaryColor,
                shadowColor: currentMonthData.primaryColor,
              },
            ]}
            activeOpacity={0.93}
            onPress={() => handleOpenMonth(currentMonthIndex)}
          >
            <ImageBackground
              source={{ uri: currentMonthData.imageUrl }}
              style={styles.heroImageBg}
              imageStyle={styles.heroImageBgStyle}
              resizeMode="cover"
            >
              {/* Dark Ambient Glassmorphic Overlay */}
              <View style={styles.heroDarkOverlay}>
                {/* Header Row: Month Badge (Clean, No Icon) */}
                <View style={styles.heroTopRow}>
                  <View
                    style={[
                      styles.heroMonthBadge,
                      {
                        backgroundColor: currentMonthData.primaryColor + 'D9',
                        borderColor: currentMonthData.accentColor + '80',
                      },
                    ]}
                  >
                    <Text style={styles.heroMonthBadgeText}>
                      {currentMonthData.name.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Main Titles */}
                <Text style={styles.heroThemeTitle}>
                  {currentMonthData.themeTitle}
                </Text>
                <Text style={styles.heroThemeSubtitle}>
                  {currentMonthData.subtitle}
                </Text>

                {/* Discrete Speech Box with Heart at the End */}
                <View
                  style={[
                    styles.heroSpeechCard,
                    { borderLeftColor: currentMonthData.primaryColor },
                  ]}
                >
                  <Text style={styles.heroSpeechText} numberOfLines={4}>
                    "{currentMonthData.speech}"{' '}
                    <Ionicons
                      name="heart"
                      size={14}
                      color={currentMonthData.accentColor}
                    />
                  </Text>
                </View>

                {/* Subtle & Elegant "Conocer más" Button */}
                <View style={styles.heroFooterRow}>
                  <TouchableOpacity
                    style={[
                      styles.sleekHeroButton,
                      {
                        borderColor: currentMonthData.primaryColor + '80',
                        backgroundColor: 'rgba(255, 255, 255, 0.18)',
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleOpenMonth(currentMonthIndex)}
                  >
                    <Text style={styles.sleekHeroButtonText}>Conocer más</Text>
                    <Ionicons
                      name="arrow-forward-outline"
                      size={16}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* 12 MONTHS SINGLE-CARD HORIZONTAL CAROUSEL */}
        <View style={styles.carouselSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Calendario Psicológico Anual
            </Text>
            {/* Page Counter */}
            <View style={styles.pageCounterBadge}>
              <Text style={styles.pageCounterText}>
                {carouselActiveIndex + 1} / {MONTHS_DATA.length}
              </Text>
            </View>
          </View>

          {/* Horizontal Snap Scroll with 1 Single Card Per View */}
          <ScrollView
            ref={carouselScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselScrollContent}
            snapToInterval={SINGLE_CARD_WIDTH + 14}
            snapToAlignment="center"
            decelerationRate="fast"
            onScroll={handleCarouselScroll}
            scrollEventThrottle={16}
          >
            {MONTHS_DATA.map((item, idx) => {
              const isCurrent = idx === currentMonthIndex;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.singleCardWrapper,
                    {
                      borderColor: item.primaryColor + (isCurrent ? 'CC' : '50'),
                      shadowColor: item.primaryColor,
                    },
                    isCurrent && styles.currentSingleCardBorder,
                  ]}
                  activeOpacity={0.92}
                  onPress={() => handleOpenMonth(idx)}
                >
                  <ImageBackground
                    source={{ uri: item.imageUrl }}
                    style={styles.singleCardImageBg}
                    imageStyle={styles.heroImageBgStyle}
                    resizeMode="cover"
                  >
                    {/* Clearer Ambient Backdrop */}
                    <View style={styles.singleCardDarkOverlay}>
                      {/* Top Row: Month Name (Clean, No Icon) & Current Indicator */}
                      <View style={styles.singleCardTopRow}>
                        <View
                          style={[
                            styles.singleCardMonthPill,
                            {
                              backgroundColor: item.primaryColor + 'D9',
                              borderColor: item.accentColor + '80',
                            },
                          ]}
                        >
                          <Text style={styles.singleCardMonthText}>
                            {item.name}
                          </Text>
                        </View>

                        {isCurrent && (
                          <View
                            style={[
                              styles.miniCurrentTag,
                              { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
                            ]}
                          >
                            <Text style={styles.miniCurrentTagText}>
                              Este mes
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Theme Title & Subtitle */}
                      <Text style={styles.singleCardThemeTitle} numberOfLines={2}>
                        {item.themeTitle}
                      </Text>
                      <Text style={styles.singleCardSubtitle} numberOfLines={1}>
                        {item.subtitle}
                      </Text>

                      {/* Speech Preview with Heart at the End */}
                      <View
                        style={[
                          styles.singleCardSpeechBox,
                          { borderLeftColor: item.primaryColor },
                        ]}
                      >
                        <Text
                          style={styles.singleCardSpeechText}
                          numberOfLines={3}
                        >
                          "{item.speech}"{' '}
                          <Ionicons
                            name="heart"
                            size={13}
                            color={item.accentColor}
                          />
                        </Text>
                      </View>

                      {/* Footer: Sleek Action */}
                      <View style={styles.singleCardFooter}>
                        <View style={styles.singleCardActionRow}>
                          <Text style={styles.singleCardActionText}>
                            Conocer más sobre {item.name}
                          </Text>
                          <Ionicons
                            name="chevron-forward-circle"
                            size={18}
                            color={colors.white}
                          />
                        </View>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Carousel Dot Indicators */}
          <View style={styles.dotsRow}>
            {MONTHS_DATA.map((_, dotIdx) => (
              <View
                key={dotIdx}
                style={[
                  styles.dot,
                  dotIdx === carouselActiveIndex && [
                    styles.activeDotExpanded,
                    {
                      backgroundColor:
                        MONTHS_DATA[carouselActiveIndex].primaryColor,
                    },
                  ],
                ]}
              />
            ))}
          </View>
        </View>

        {/* SECTION: ESPECIALISTAS QUE PUEDEN ACOMPAÑARTE */}
        <View style={styles.psychologistsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Especialistas a tu lado
              </Text>
              <Text style={styles.sectionSubText}>
                Profesionales en psicología listos para escucharte
              </Text>
            </View>
            {onOpenPsychologists ? (
              <TouchableOpacity
                style={styles.viewAllPsicoPill}
                activeOpacity={0.7}
                onPress={onOpenPsychologists}
              >
                <Text style={styles.viewAllPsicoPillText}>Ver todos</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.coffeePrimary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Horizontal List of Psychologists */}
          {psychologists.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.psicoScrollContent}
            >
              {psychologists.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.psicoMiniCard}
                  activeOpacity={0.88}
                  onPress={() => setSelectedPsicoForDetail(p)}
                >
                  <Image
                    source={{ uri: p.imagen }}
                    style={styles.psicoMiniAvatar}
                    resizeMode="cover"
                  />
                  <Text style={styles.psicoMiniName} numberOfLines={1}>
                    {p.nombre}
                  </Text>
                  <Text style={styles.psicoMiniSpecialty} numberOfLines={2}>
                    {p.especialidad}
                  </Text>

                  <View style={styles.psicoMiniAction}>
                    <Text style={styles.psicoMiniActionText}>Ver perfil</Text>
                    <Ionicons name="arrow-forward" size={12} color={colors.coffeePrimary} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyPsicoBox}>
              <Ionicons name="people-outline" size={26} color={colors.coffeePrimary} />
              <Text style={styles.emptyPsicoText}>
                Red de profesionales en psicología en constante crecimiento.
              </Text>
            </View>
          )}
        </View>

        {/* FUTURE BLOG ARTICLES PLACEHOLDER */}
        <View style={styles.upcomingSection}>
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingIconCircle}>
              <Ionicons name="sparkles" size={22} color={colors.coffeePrimary} />
            </View>
            <Text style={styles.upcomingTitle}>
              Próximamente más reflexiones y artículos
            </Text>
            <Text style={styles.upcomingDesc}>
              Espacio preparado para guías psicológicas y lecturas de bienestar emocional.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Full 12 Months Detailed Modal */}
      <MonthDetailModal
        visible={isDetailModalOpen}
        initialMonthIndex={selectedMonthForDetail}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* Psychologist Detail Profile Modal */}
      <PsychologistDetailModal
        visible={selectedPsicoForDetail !== null}
        psychologist={selectedPsicoForDetail}
        onClose={() => setSelectedPsicoForDetail(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroCardOuter: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
    backgroundColor: '#1C1917',
  },
  heroImageBg: {
    width: '100%',
    minHeight: 330,
  },
  heroImageBgStyle: {
    borderRadius: 22,
  },
  heroDarkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 10, 8, 0.38)',
    padding: 20,
    justifyContent: 'space-between',
    borderRadius: 22,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroMonthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 14,
    borderWidth: 1,
  },
  heroMonthBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  discreteDotWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  discreteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroThemeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
    lineHeight: 28,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  heroThemeSubtitle: {
    fontSize: 13.5,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroSpeechCard: {
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 3.5,
    backgroundColor: 'rgba(10, 8, 6, 0.45)',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  heroSpeechText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sleekHeroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  sleekHeroButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  carouselSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
  sectionSubText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  pageCounterBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pageCounterText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  carouselScrollContent: {
    gap: 14,
  },
  singleCardWrapper: {
    width: SINGLE_CARD_WIDTH,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: '#1C1917',
  },
  currentSingleCardBorder: {
    borderWidth: 2,
  },
  singleCardImageBg: {
    width: '100%',
    minHeight: 280,
  },
  singleCardDarkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 10, 8, 0.38)',
    padding: 18,
    justifyContent: 'space-between',
    borderRadius: 20,
  },
  singleCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  singleCardMonthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
  },
  singleCardMonthText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  miniCurrentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
    gap: 4,
  },
  activeDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  miniCurrentTagText: {
    color: colors.white,
    fontSize: 10.5,
    fontWeight: '700',
  },
  singleCardThemeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 23,
    marginBottom: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  singleCardSubtitle: {
    fontSize: 12.5,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  singleCardSpeechBox: {
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    backgroundColor: 'rgba(10, 8, 6, 0.45)',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  singleCardSpeechText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  singleCardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 10,
  },
  singleCardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  singleCardActionText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
  },
  activeDotExpanded: {
    width: 18,
    height: 6,
    borderRadius: 3,
  },
  /* Psychologists in Blog */
  psychologistsSection: {
    marginBottom: 24,
  },
  viewAllPsicoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 3,
  },
  viewAllPsicoPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },
  psicoScrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  psicoMiniCard: {
    width: 170,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  psicoMiniAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.coffeePrimary,
    marginBottom: 8,
  },
  psicoMiniName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
    marginBottom: 3,
  },
  psicoMiniSpecialty: {
    fontSize: 11,
    color: colors.coffeePrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 28,
  },
  psicoMiniAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    width: '100%',
    justifyContent: 'center',
  },
  psicoMiniActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },
  emptyPsicoBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    gap: 6,
  },
  emptyPsicoText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  upcomingSection: {
    marginTop: 4,
    marginBottom: 12,
  },
  upcomingCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  upcomingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  upcomingTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  upcomingDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 10,
  },
});
