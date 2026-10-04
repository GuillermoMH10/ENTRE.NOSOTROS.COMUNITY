import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MONTHS_DATA, MonthTheme } from '../../data/monthsData';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface MonthDetailModalProps {
  visible: boolean;
  initialMonthIndex?: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const MonthDetailModal: React.FC<MonthDetailModalProps> = ({
  visible,
  initialMonthIndex = 0,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(initialMonthIndex);

  useEffect(() => {
    if (visible) {
      setSelectedIndex(initialMonthIndex);
    }
  }, [visible, initialMonthIndex]);

  if (!visible) return null;

  const currentMonth: MonthTheme = MONTHS_DATA[selectedIndex] || MONTHS_DATA[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Cerrar ventana"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.headerTitle}>Calendario de Conciencia y Cuidado</Text>
            <Text style={styles.headerSubtitle}>12 Meses de Apoyo y Bienestar Emocional</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* 12 Months Horizontal Selector Bar */}
        <View style={styles.selectorContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorScrollContent}
          >
            {MONTHS_DATA.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.monthTab,
                    isSelected && {
                      backgroundColor: item.primaryColor,
                      borderColor: item.primaryColor,
                      shadowColor: item.primaryColor,
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.3,
                      shadowRadius: 5,
                      elevation: 4,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setSelectedIndex(idx)}
                >
                  <Text
                    style={[
                      styles.monthTabText,
                      isSelected ? styles.monthTabTextActive : styles.monthTabTextInactive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {isSelected && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Scrollable Month Detailed Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Hero Card for the Selected Month with Image Background */}
          <View
            style={[
              styles.heroCardOuter,
              {
                borderColor: currentMonth.primaryColor,
                shadowColor: currentMonth.primaryColor,
              },
            ]}
          >
            <ImageBackground
              source={{ uri: currentMonth.imageUrl }}
              style={styles.heroImageBg}
              imageStyle={styles.heroImageBgStyle}
              resizeMode="cover"
            >
              <View style={styles.heroDarkOverlay}>
                {/* Month Badge (Clean, No Icon) */}
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.themeBadge,
                      {
                        backgroundColor: currentMonth.primaryColor + 'D9',
                        borderColor: currentMonth.accentColor + '80',
                      },
                    ]}
                  >
                    <Text style={styles.themeBadgeText}>
                      {currentMonth.name.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Title & Subtitle */}
                <Text style={styles.monthTitle}>
                  {currentMonth.themeTitle}
                </Text>
                <Text style={styles.monthSubtitle}>
                  {currentMonth.subtitle}
                </Text>

                {/* Quote / Speech Card with Heart at End */}
                <View
                  style={[
                    styles.speechCard,
                    { borderLeftColor: currentMonth.primaryColor },
                  ]}
                >
                  <Text style={styles.speechText}>
                    "{currentMonth.speech}"{' '}
                    <Ionicons
                      name="heart"
                      size={14}
                      color={currentMonth.accentColor}
                    />
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Section: Psicología del Color */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View
                style={[
                  styles.sectionIconBg,
                  { backgroundColor: currentMonth.lightBackground },
                ]}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={18}
                  color={currentMonth.primaryColor}
                />
              </View>
              <Text style={styles.sectionTitle}>
                Psicología del Color en este Mes
              </Text>
            </View>

            <View
              style={[
                styles.infoBox,
                {
                  borderColor: currentMonth.primaryColor + '30',
                  backgroundColor: colors.white,
                },
              ]}
            >
              <Text style={styles.infoBoxText}>
                {currentMonth.colorPsychology}
              </Text>
            </View>
          </View>

          {/* Section: Claves de Prevención y Ayuda */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View
                style={[
                  styles.sectionIconBg,
                  { backgroundColor: currentMonth.lightBackground },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={currentMonth.primaryColor}
                />
              </View>
              <Text style={styles.sectionTitle}>
                Claves de Prevención y Cuidado Emocional
              </Text>
            </View>

            {currentMonth.preventionTips.map((tip, index) => (
              <View
                key={index}
                style={[
                  styles.tipCard,
                  {
                    borderColor: colors.borderLight,
                    backgroundColor: colors.white,
                  },
                ]}
              >
                <View
                  style={[
                    styles.tipIconWrapper,
                    { backgroundColor: currentMonth.lightBackground },
                  ]}
                >
                  <Ionicons
                    name={tip.icon as any}
                    size={20}
                    color={currentMonth.primaryColor}
                  />
                </View>
                <View style={styles.tipContent}>
                  <Text
                    style={[
                      styles.tipTitle,
                      { color: currentMonth.darkColor },
                    ]}
                  >
                    {tip.title}
                  </Text>
                  <Text style={styles.tipDesc}>{tip.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Section: Mantra / Afirmación */}
          <View
            style={[
              styles.mantraContainer,
              {
                borderColor: currentMonth.primaryColor,
                shadowColor: currentMonth.primaryColor,
              },
            ]}
          >
            <View
              style={[
                styles.mantraIconCircle,
                { backgroundColor: currentMonth.lightBackground },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={20}
                color={currentMonth.primaryColor}
              />
            </View>
            <Text
              style={[
                styles.mantraLabel,
                { color: currentMonth.primaryColor },
              ]}
            >
              AFIRMACIÓN DEL MES
            </Text>
            <Text style={styles.mantraText}>
              {currentMonth.mantra}
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrapper: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 1,
  },
  headerSpacer: {
    width: 36,
  },
  selectorContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 10,
  },
  selectorScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  monthTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  monthTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  monthTabTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  monthTabTextInactive: {
    color: colors.textSecondary,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
    marginLeft: 6,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: 30,
  },
  heroCardOuter: {
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: '#1C1917',
  },
  heroImageBg: {
    width: '100%',
  },
  heroImageBgStyle: {
    borderRadius: 20,
  },
  heroDarkOverlay: {
    padding: 18,
    backgroundColor: 'rgba(12, 10, 8, 0.38)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeBadgeText: {
    color: colors.white,
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  monthTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.2,
    lineHeight: 27,
    marginBottom: 4,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  monthSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  speechCard: {
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 3.5,
    backgroundColor: 'rgba(10, 8, 6, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  speechIcon: {
    marginBottom: 6,
  },
  speechText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIconBg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
  infoBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  infoBoxText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  tipCard: {
    flexDirection: 'row',
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'flex-start',
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  tipIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  tipDesc: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  mantraContainer: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mantraIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mantraLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  mantraText: {
    color: colors.textPrimary,
    fontSize: 14.5,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    paddingHorizontal: 6,
  },
});
