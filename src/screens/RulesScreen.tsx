import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/Header/AppHeader';
import { colors } from '../theme/colors';

interface RulesScreenProps {
  onOpenMenu: () => void;
  onJoinPress: () => void;
  onProfilePress: () => void;
  onOpenPsychologists?: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

interface RuleData {
  id: number;
  title: string;
  tag: string;
  description: string;
  quote: string;
}

const RULES: RuleData[] = [
  {
    id: 1,
    title: 'Respeto y Cero Juicios',
    tag: 'Validación Emocional',
    description:
      'Cada historia, emoción y proceso es único y sagrado. Nunca minimices ni juzgues el dolor ajeno. En este espacio quedan prohibidas las descalificaciones y frases que resten valor al sentir del otro.',
    quote: '«Ningún dolor es pequeño cuando duele en el corazón.»',
  },
  {
    id: 2,
    title: 'Empatía y Escucha Activa',
    tag: 'Acompañamiento Sincero',
    description:
      'Cuando decidas comentar o reaccionar, hazlo desde la calidez, la comprensión y el consuelo. Acompañar no significa solucionar ni dar diagnósticos clínicos; a veces basta con decir: «Te escucho y no estás solo».',
    quote: '«Tus palabras pueden ser el refugio que alguien necesita hoy.»',
  },
  {
    id: 3,
    title: 'Privacidad y Confidencialidad',
    tag: 'Confianza y Cuidado',
    description:
      'Lo que se comparte en Entre Nosotros permanece aquí. Queda estrictamente prohibido tomar capturas de pantalla con fines de burla, difundir identidades o exponer información personal fuera de la app.',
    quote: '«Cuidar la privacidad de los demás es proteger su confianza.»',
  },
  {
    id: 4,
    title: 'Cero Tolerancia al Odio y Acoso',
    tag: 'Seguridad Absoluta',
    description:
      'No se permitirá ninguna forma de acoso, hostigamiento, discriminación por género, orientación, religión, apariencia ni conductas intimidatorias. Quien vulnere esta regla será suspendido de forma inmediata.',
    quote: '«La seguridad y la paz de la comunidad son innegociables.»',
  },
  {
    id: 5,
    title: 'Cuidado en Temas Sensibles',
    tag: 'Responsabilidad Colectiva',
    description:
      'Expresa tu sentir con honestidad, pero evita detallar métodos explícitos de autolesión o conductas destructivas que puedan detonar crisis o vulnerabilidad en otras personas en recuperación.',
    quote: '«Hablemos del dolor con el propósito de sanar y prevenir.»',
  },
  {
    id: 6,
    title: 'Prioridad a la Vida y Ayuda Profesional',
    tag: 'Orientación y Salud',
    description:
      'Entre Nosotros es una red de apoyo mutuo y desahogo, pero no sustituye la terapia clínica ni los servicios médicos de urgencia. Si atraviesas una crisis aguda, recurre a nuestros psicólogos o líneas de emergencia.',
    quote: '«Pedir ayuda profesional es el mayor acto de valentía y amor propio.»',
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
            paddingTop: contentPaddingTop + 8,
            paddingBottom: contentPaddingBottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Compact Clean Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="shield-checkmark" size={17} color={colors.coffeePrimary} style={{ marginRight: 6 }} />
            <Text style={styles.headerTitle}>Reglas "Entre Nosotros"</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Nuestros principios de convivencia para construir una comunidad cálida, empática y libre de juicios.
          </Text>
        </View>

        {/* Compact Rules List Container */}
        <View style={styles.rulesListCard}>
          {RULES.map((rule, idx) => (
            <View key={rule.id}>
              <View style={styles.ruleItemContainer}>
                {/* Header: Number Badge + Title + Tag */}
                <View style={styles.ruleHeaderRow}>
                  <View style={styles.ruleNumberCircle}>
                    <Text style={styles.ruleNumberText}>{rule.id}</Text>
                  </View>
                  <View style={styles.ruleTitleGroup}>
                    <Text style={styles.ruleTitle}>{rule.title}</Text>
                    <Text style={styles.ruleTag}>{rule.tag}</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.ruleDescription}>{rule.description}</Text>

                {/* Quote in subtle italic coffee */}
                <Text style={styles.ruleQuote}>{rule.quote}</Text>
              </View>

              {/* Clean separator between rules (except last) */}
              {idx < RULES.length - 1 && <View style={styles.ruleSeparator} />}
            </View>
          ))}
        </View>

        {/* Compact Support Quick Actions in White/Coffee */}
        <View style={styles.supportActionsCard}>
          {onOpenPsychologists && (
            <>
              <TouchableOpacity
                style={styles.supportActionRow}
                activeOpacity={0.7}
                onPress={onOpenPsychologists}
              >
                <View style={styles.supportIconCircle}>
                  <Ionicons name="people-outline" size={16} color={colors.coffeePrimary} />
                </View>
                <View style={styles.supportTextGroup}>
                  <Text style={styles.supportTitle}>Directorio de Psicólogos</Text>
                  <Text style={styles.supportSub}>Especialistas verificados disponibles</Text>
                </View>
                <Ionicons name="chevron-forward" size={15} color={colors.coffeePrimary} />
              </TouchableOpacity>
              <View style={styles.supportDivider} />
            </>
          )}

          <TouchableOpacity
            style={styles.supportActionRow}
            activeOpacity={0.7}
            onPress={handleCallEmergency}
          >
            <View style={styles.supportIconCircle}>
              <Ionicons name="call-outline" size={16} color={colors.coffeePrimary} />
            </View>
            <View style={styles.supportTextGroup}>
              <Text style={styles.supportTitle}>Línea de Crisis 24/7</Text>
              <Text style={styles.supportSub}>Atención inmediata y confidencial</Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color={colors.coffeePrimary} />
          </TouchableOpacity>
        </View>

        {/* Minimal Footer */}
        <Text style={styles.footerText}>
          Entre Nosotros · Espacio de Escucha y Bienestar Emocional
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  /* Header Container */
  headerContainer: {
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  /* Single Unified Rules List Card */
  rulesListCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  ruleItemContainer: {
    paddingVertical: 14,
  },
  ruleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ruleNumberText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.coffeePrimary,
  },
  ruleTitleGroup: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.coffeeDark,
    marginBottom: 1,
  },
  ruleTag: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.coffeePrimary,
  },
  ruleDescription: {
    fontSize: 12.5,
    color: colors.textPrimary,
    lineHeight: 19,
    marginBottom: 6,
  },
  ruleQuote: {
    fontSize: 11.5,
    color: colors.coffeePrimary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  ruleSeparator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  /* Support Actions Card */
  supportActionsCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
  },
  supportActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  supportIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EAE3DF',
  },
  supportTextGroup: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.coffeeDark,
    marginBottom: 1,
  },
  supportSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  supportDivider: {
    height: 1,
    backgroundColor: '#EAE3DF',
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    paddingBottom: 8,
  },
});
