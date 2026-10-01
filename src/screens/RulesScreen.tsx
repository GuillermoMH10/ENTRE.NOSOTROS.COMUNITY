import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/Header/AppHeader';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface RulesScreenProps {
  onOpenMenu: () => void;
  onJoinPress: () => void;
  onProfilePress: () => void;
  onOpenPsychologists?: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RuleItem {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tag: string;
  description: string;
  quote?: string;
  accentColor: string;
  lightBg: string;
}

const COMMUNITY_RULES: RuleItem[] = [
  {
    id: 1,
    icon: 'leaf-outline',
    title: '1. Respeto y Cero Juicios',
    tag: 'Validación Emocional',
    description:
      'Cada historia, emoción y proceso es único y sagrado. Nunca minimices ni juzgues el dolor ajeno. En este espacio quedan prohibidas las descalificaciones y frases que resten valor al sentir del otro.',
    quote: '«Ningún dolor es pequeño cuando duele en el corazón.»',
    accentColor: colors.coffeePrimary,
    lightBg: '#FDFBF9',
  },
  {
    id: 2,
    icon: 'heart-outline',
    title: '2. Empatía y Escucha Activa',
    tag: 'Acompañamiento Sincero',
    description:
      'Cuando decidas comentar o reaccionar, hazlo desde la calidez, la comprensión y el consuelo. Acompañar no significa solucionar ni dar diagnósticos clínicos; a veces basta con decir: «Te escucho y no estás solo».',
    quote: '«Tus palabras pueden ser el refugio que alguien necesita hoy.»',
    accentColor: '#059669',
    lightBg: '#F0FDF4',
  },
  {
    id: 3,
    icon: 'lock-closed-outline',
    title: '3. Privacidad y Confidencialidad',
    tag: 'Espacio Seguro',
    description:
      'Lo que se comparte en Entre Nosotros permanece aquí. Queda estrictamente prohibido tomar capturas de pantalla con fines de burla, difundir identidades o exponer información personal fuera de la app.',
    quote: '«Cuidar la privacidad de los demás es proteger su confianza.»',
    accentColor: '#2563EB',
    lightBg: '#EFF6FF',
  },
  {
    id: 4,
    icon: 'shield-checkmark-outline',
    title: '4. Cero Tolerancia al Odio y Acoso',
    tag: 'Seguridad Absoluta',
    description:
      'No se permitirá ninguna forma de acoso, hostigamiento, discriminación por género, orientación, religión, apariencia ni conductas intimidatorias. Quien vulnere esta regla será suspendido de forma inmediata.',
    quote: '«La seguridad y la paz de la comunidad son innegociables.»',
    accentColor: '#DC2626',
    lightBg: '#FEF2F2',
  },
  {
    id: 5,
    icon: 'flower-outline',
    title: '5. Cuidado en Temas Sensibles',
    tag: 'Responsabilidad Colectiva',
    description:
      'Expresa tu sentir con honestidad, pero evita detallar métodos explícitos de autolesión o conductas destructivas que puedan detonar crisis o vulnerabilidad en otras personas en recuperación.',
    quote: '«Hablemos del dolor con el propósito de sanar y prevenir.»',
    accentColor: '#7C3AED',
    lightBg: '#F5F3FF',
  },
  {
    id: 6,
    icon: 'medical-outline',
    title: '6. Prioridad a la Vida y Ayuda Profesional',
    tag: 'Orientación y Salud',
    description:
      'Entre Nosotros es una red de apoyo mutuo y desahogo, pero no sustituye la terapia clínica ni los servicios médicos de urgencia. Si atraviesas una crisis aguda, recurre a nuestros psicólogos o líneas de emergencia.',
    quote: '«Pedir ayuda profesional es el mayor acto de valentía y amor propio.»',
    accentColor: '#D97706',
    lightBg: '#FFFBEB',
  },
];

export const RulesScreen: React.FC<RulesScreenProps> = ({
  onOpenMenu,
  onJoinPress,
  onProfilePress,
  onOpenPsychologists,
  contentPaddingTop = 0,
  contentPaddingBottom = 80,
}) => {
  const handleCallEmergency = () => {
    // Standard crisis line
    Linking.openURL('tel:911').catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* Consistent App Header */}
      <AppHeader
        onOpenMenu={onOpenMenu}
        onJoinPress={onJoinPress}
        onProfilePress={onProfilePress}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: contentPaddingTop + 14,
            paddingBottom: contentPaddingBottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO BANNER */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconBadge}>
              <Ionicons name="shield-checkmark" size={24} color={colors.coffeePrimary} />
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>Espacio Seguro</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Reglas "Entre Nosotros"</Text>
          <Text style={styles.heroSubtitle}>
            Nuestros principios de convivencia para construir una comunidad cálida, empática y libre de juicios.
          </Text>

          {/* Quick Commitment Box */}
          <View style={styles.heroCommitmentBox}>
            <Ionicons name="sparkles" size={16} color={colors.coffeePrimary} style={{ marginRight: 8 }} />
            <Text style={styles.heroCommitmentText}>
              Al formar parte de Entre Nosotros, te comprometes a cuidar este refugio emocional con respeto y amor.
            </Text>
          </View>
        </View>

        {/* SECTION HEADER */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pilares de la Comunidad</Text>
          <Text style={styles.sectionSubtitle}>
            Conoce cada una de las normas fundamentales:
          </Text>
        </View>

        {/* RULES LIST */}
        <View style={styles.rulesList}>
          {COMMUNITY_RULES.map((rule) => (
            <View
              key={rule.id}
              style={[
                styles.ruleCard,
                {
                  borderLeftColor: rule.accentColor,
                  shadowColor: rule.accentColor,
                },
              ]}
            >
              {/* Header: Icon + Title + Tag */}
              <View style={styles.ruleCardHeader}>
                <View
                  style={[
                    styles.ruleIconCircle,
                    { backgroundColor: rule.lightBg, borderColor: rule.accentColor + '40' },
                  ]}
                >
                  <Ionicons name={rule.icon} size={22} color={rule.accentColor} />
                </View>

                <View style={styles.ruleHeaderTexts}>
                  <Text style={styles.ruleTitleText}>{rule.title}</Text>
                  <View style={[styles.ruleTagBadge, { backgroundColor: rule.lightBg }]}>
                    <Text style={[styles.ruleTagText, { color: rule.accentColor }]}>
                      {rule.tag}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.ruleDescriptionText}>
                {rule.description}
              </Text>

              {/* Quote pill */}
              {rule.quote ? (
                <View style={[styles.ruleQuoteBox, { backgroundColor: rule.lightBg }]}>
                  <Text style={[styles.ruleQuoteText, { color: rule.accentColor }]}>
                    {rule.quote}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {/* COMPACT PROFESSIONAL SUPPORT ACTIONS */}
        <View style={styles.compactSupportCard}>
          {/* Row 1: Directorio de Psicólogos */}
          {onOpenPsychologists ? (
            <TouchableOpacity
              style={styles.compactRowItem}
              activeOpacity={0.7}
              onPress={onOpenPsychologists}
            >
              <View style={styles.compactIconCircle}>
                <Ionicons name="heart" size={17} color={colors.coffeePrimary} />
              </View>
              <View style={styles.compactRowTexts}>
                <Text style={styles.compactRowTitle}>Directorio de Psicólogos</Text>
                <Text style={styles.compactRowSubtitle}>Especialistas certificados</Text>
              </View>
              <View style={styles.compactActionPill}>
                <Text style={styles.compactActionPillText}>Ver</Text>
                <Ionicons name="chevron-forward" size={12} color={colors.coffeePrimary} />
              </View>
            </TouchableOpacity>
          ) : null}

          {onOpenPsychologists ? <View style={styles.compactRowDivider} /> : null}

          {/* Row 2: Línea de Crisis 24/7 */}
          <TouchableOpacity
            style={styles.compactRowItem}
            activeOpacity={0.7}
            onPress={handleCallEmergency}
          >
            <View style={[styles.compactIconCircle, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="call" size={16} color="#DC2626" />
            </View>
            <View style={styles.compactRowTexts}>
              <Text style={[styles.compactRowTitle, { color: '#991B1B' }]}>
                Línea de Crisis 24/7
              </Text>
              <Text style={styles.compactRowSubtitle}>Atención inmediata y confidencial</Text>
            </View>
            <View style={styles.compactEmergencyPill}>
              <Text style={styles.compactEmergencyPillText}>Llamar</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* BOTTOM BRANDING */}
        <View style={styles.bottomBrandWrapper}>
          <Text style={styles.bottomBrandText}>
            Entre Nosotros · Espacio de Escucha y Bienestar Emocional
          </Text>
        </View>
      </ScrollView>
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
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: colors.coffeePrimary + '30',
  },
  heroPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.coffeePrimary + '40',
  },
  heroPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  heroCommitmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderLeftWidth: 3.5,
    borderLeftColor: colors.coffeePrimary,
  },
  heroCommitmentText: {
    flex: 1,
    fontSize: 12,
    color: colors.coffeeDark,
    lineHeight: 18,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rulesList: {
    gap: 14,
    marginBottom: 20,
  },
  ruleCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  ruleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ruleIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  ruleHeaderTexts: {
    flex: 1,
  },
  ruleTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.coffeeDark,
    marginBottom: 3,
  },
  ruleTagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ruleTagText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  ruleDescriptionText: {
    fontSize: 13.5,
    color: colors.textPrimary,
    lineHeight: 20.5,
    letterSpacing: 0.1,
    marginBottom: 10,
  },
  ruleQuoteBox: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 2,
  },
  ruleQuoteText: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  footerCardsSection: {
    gap: 12,
    marginBottom: 20,
  },
  compactSupportCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  compactRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  compactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  compactRowTexts: {
    flex: 1,
  },
  compactRowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.coffeeDark,
    marginBottom: 1,
  },
  compactRowSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  compactActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    gap: 3,
  },
  compactActionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },
  compactRowDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 4,
  },
  compactEmergencyPill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  compactEmergencyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  bottomBrandWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  bottomBrandText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
