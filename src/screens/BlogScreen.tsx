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
import { MONTHS_DATA } from '../data/monthsData';
import { MonthDetailModal } from '../components/Blog/MonthDetailModal';
import { Psychologist } from '../types/psychologist';
import { subscribeToPsychologists } from '../services/psychologistsService';
import { PsychologistDetailModal } from '../components/Psychologists/PsychologistDetailModal';
import { AppHeader } from '../components/Header/AppHeader';
import { colors } from '../theme/colors';

interface BlogScreenProps {
  onOpenMenu: () => void;
  onJoinPress: () => void;
  onProfilePress: () => void;
  onOpenPsychologists?: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

interface TopicItem {
  id: string;
  titulo: string;
  imagen: string;
}

const INTEREST_TOPICS: TopicItem[] = [
  {
    id: 'depresion',
    titulo: 'Depresión',
    imagen: 'https://i.pinimg.com/1200x/b8/7c/8f/b87c8fe21146f1c89d576d97c2471458.jpg',
  },
  {
    id: 'ansiedad',
    titulo: 'Ansiedad',
    imagen: 'https://i.pinimg.com/1200x/3e/f6/f4/3ef6f4d666bf0ae7febb0e6750966fc8.jpg',
  },
];

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

  // Center/scroll to current month on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (carouselScrollRef.current) {
        carouselScrollRef.current.scrollTo({
          x: currentMonthIndex * (SINGLE_CARD_WIDTH + 14),
          animated: false,
        });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [currentMonthIndex]);

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
            paddingTop: contentPaddingTop + 14,
            paddingBottom: contentPaddingBottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 12 MONTHS SINGLE-CARD HORIZONTAL CAROUSEL */}
        <View style={styles.carouselSection}>
          {/* Centered Clean Header (No subtitle) */}
          <View style={styles.centeredHeader}>
            <View style={styles.calendarIconBubble}>
              <Ionicons
                name="calendar"
                size={16}
                color={colors.coffeePrimary}
              />
            </View>
            <Text style={styles.centeredSectionTitle}>
              Calendario de Conciencia y Cuidado
            </Text>
          </View>

          {/* Horizontal Snap Scroll with 1 Single Card Per View starting at current month */}
          <ScrollView
            ref={carouselScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: currentMonthIndex * (SINGLE_CARD_WIDTH + 14), y: 0 }}
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
                      borderColor: item.primaryColor + (isCurrent ? 'DD' : '50'),
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
                    imageStyle={styles.singleCardImageBgStyle}
                    resizeMode="cover"
                  >
                    {/* Clearer Ambient Backdrop */}
                    <View style={styles.singleCardDarkOverlay}>
                      {/* Top Row: Month Name & Current Indicator */}
                      <View style={styles.singleCardTopRow}>
                        <View
                          style={[
                            styles.singleCardMonthPill,
                            {
                              backgroundColor: item.primaryColor + 'E6',
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
                              { backgroundColor: 'rgba(255, 255, 255, 0.28)' },
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

        {/* SECTION: TEMAS QUE TE PUEDEN INTERESAR */}
        <View style={styles.topicsSection}>
          <View style={styles.topicsHeaderRow}>
            <Text style={styles.topicsSectionTitle}>
              Temas que te pueden interesar
            </Text>
          </View>

          <View style={styles.topicsGrid}>
            {INTEREST_TOPICS.map((topic) => (
              <View key={topic.id} style={styles.topicCard}>
                <View style={styles.topicImageContainer}>
                  <Image
                    source={{ uri: topic.imagen }}
                    style={styles.topicImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.topicTitle}>{topic.titulo}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SECTION: ESPECIALISTAS A TU LADO (Cleaned up) */}
        <View style={styles.psychologistsSection}>
          <View style={styles.psicoHeaderRow}>
            <Text style={styles.psicoSectionTitle}>
              Especialistas a tu lado
            </Text>
            {onOpenPsychologists ? (
              <TouchableOpacity
                style={styles.viewAllDiscreetBtn}
                activeOpacity={0.7}
                onPress={onOpenPsychologists}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.viewAllDiscreetText}>Ver todos</Text>
                <Ionicons name="chevron-forward" size={12} color={colors.coffeePrimary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Horizontal List of Psychologists (Avatar + Name + Specialty only) */}
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
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyPsicoBox}>
              <Ionicons name="people-outline" size={24} color={colors.coffeePrimary} />
              <Text style={styles.emptyPsicoText}>
                Red de profesionales en psicología disponible para ti.
              </Text>
            </View>
          )}
        </View>

        {/* FUTURE BLOG ARTICLES PLACEHOLDER */}
        <View style={styles.upcomingSection}>
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingIconCircle}>
              <Ionicons name="sparkles" size={20} color={colors.coffeePrimary} />
            </View>
            <Text style={styles.upcomingTitle}>
              Próximamente más lecturas y guías
            </Text>
            <Text style={styles.upcomingDesc}>
              Espacio preparado para artículos especializados y reflexiones de bienestar.
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
    backgroundColor: colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  carouselSection: {
    marginBottom: 24,
  },
  /* Centered Header for Calendar */
  centeredHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  calendarIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  centeredSectionTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
    letterSpacing: -0.2,
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
    shadowOpacity: 0.12,
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
  singleCardImageBgStyle: {
    borderRadius: 20,
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
  /* Topics of Interest Section */
  topicsSection: {
    marginBottom: 24,
  },
  topicsHeaderRow: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  topicsSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: -0.2,
  },
  topicsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  topicCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  topicImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSoft,
    marginBottom: 8,
  },
  topicImage: {
    width: '100%',
    height: '100%',
  },
  topicTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
    paddingVertical: 2,
    letterSpacing: -0.2,
  },
  /* Psychologists in Blog */
  psychologistsSection: {
    marginBottom: 24,
  },
  psicoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  psicoSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: -0.2,
  },
  viewAllDiscreetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 2,
  },
  viewAllDiscreetText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },
  psicoScrollContent: {
    gap: 12,
    paddingRight: 16,
    paddingVertical: 2,
  },
  psicoMiniCard: {
    width: 150,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
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
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1.5,
    borderColor: colors.coffeePrimary,
    marginBottom: 8,
  },
  psicoMiniName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
    marginBottom: 3,
  },
  psicoMiniSpecialty: {
    fontSize: 10.5,
    color: colors.coffeePrimary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  emptyPsicoBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    gap: 6,
  },
  emptyPsicoText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  upcomingSection: {
    marginTop: 2,
    marginBottom: 10,
  },
  upcomingCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  upcomingIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  upcomingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.coffeeDark,
    marginBottom: 3,
    textAlign: 'center',
  },
  upcomingDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});
