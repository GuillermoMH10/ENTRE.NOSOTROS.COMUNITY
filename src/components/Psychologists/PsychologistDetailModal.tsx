import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Psychologist } from '../../types/psychologist';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PsychologistDetailModalProps {
  visible: boolean;
  psychologist: Psychologist | null;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PsychologistDetailModal: React.FC<PsychologistDetailModalProps> = ({
  visible,
  psychologist,
  onClose,
}) => {
  if (!visible || !psychologist) return null;

  const handleOpenPhone = () => {
    if (!psychologist.telefono) return;
    const cleanNumber = psychologist.telefono.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Contacto', psychologist.telefono);
    });
  };

  const handleOpenEmail = () => {
    if (!psychologist.correo) return;
    Linking.openURL(`mailto:${psychologist.correo}`).catch(() => {
      Alert.alert('Correo', psychologist.correo);
    });
  };

  const handleOpenMap = () => {
    if (!psychologist.ubicacion) return;
    const loc = psychologist.ubicacion.trim();
    if (loc.startsWith('http://') || loc.startsWith('https://') || loc.startsWith('maps:')) {
      Linking.openURL(loc).catch(() => {
        Alert.alert('No se pudo abrir el mapa', loc);
      });
    } else {
      const mapsQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
      Linking.openURL(mapsQueryUrl).catch(() => {
        Alert.alert('Ubicación', loc);
      });
    }
  };



  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Cerrar perfil"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil Profesional</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Hero Profile Section */}
          <View style={styles.heroProfileCard}>
            {/* Large High-Resolution Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: psychologist.imagen }}
                style={styles.largeAvatar}
                resizeMode="cover"
              />
              <View style={styles.verifiedIconBadge}>
                <Ionicons name="checkmark" size={16} color={colors.white} />
              </View>
            </View>

            {/* Name */}
            <Text style={styles.nameText}>{psychologist.nombre}</Text>

            {/* Clean Specialty (No background box, No icon) */}
            <Text style={styles.specialtyText}>
              {psychologist.especialidad}
            </Text>

            {/* Premium Action Contact Buttons */}
            <View style={styles.actionButtonsRow}>
              {psychologist.telefono ? (
                <TouchableOpacity
                  style={[styles.primaryActionBtn, styles.callBtn]}
                  onPress={handleOpenPhone}
                  activeOpacity={0.82}
                >
                  <Ionicons name="call" size={17} color={colors.white} />
                  <Text style={styles.primaryActionBtnText}>Llamar</Text>
                </TouchableOpacity>
              ) : null}

              {psychologist.correo ? (
                <TouchableOpacity
                  style={[styles.primaryActionBtn, styles.emailBtn]}
                  onPress={handleOpenEmail}
                  activeOpacity={0.82}
                >
                  <Ionicons name="mail" size={17} color={colors.white} />
                  <Text style={styles.primaryActionBtnText}>Enviar Correo</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Section: Sobre el Especialista */}
          {psychologist.descripcion ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Sobre el Especialista</Text>
              <View style={styles.cardBox}>
                <Text style={styles.bodyDescription}>
                  {psychologist.descripcion}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Section: Solo el mapa pequeño interactivo */}
          {psychologist.ubicacion ? (
            <View style={styles.sectionBlock}>
              <TouchableOpacity
                style={styles.mapSquareContainer}
                activeOpacity={0.85}
                onPress={handleOpenMap}
              >
                {/* Map Graphic Preview */}
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=700&q=80',
                  }}
                  style={styles.mapImageBackground}
                  resizeMode="cover"
                />

                {/* Subtle map overlay */}
                <View style={styles.mapOverlay} />

                {/* Central Pin Marker */}
                <View style={styles.centerPinContainer}>
                  <View style={styles.centerPinBubble}>
                    <Ionicons name="location" size={28} color={colors.coffeePrimary} />
                  </View>
                  <View style={styles.centerPinShadow} />
                </View>

                {/* Floating subtle Google Maps badge */}
                <View style={styles.floatingMapBadge}>
                  <Ionicons name="navigate-circle" size={16} color={colors.coffeePrimary} />
                  <Text style={styles.floatingMapBadgeText}>Google Maps</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Section: Información de Contacto Directo */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Contacto Directo</Text>
            <View style={styles.cardBox}>
              {psychologist.telefono ? (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={handleOpenPhone}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactIconBg}>
                    <Ionicons name="call-outline" size={18} color={colors.coffeePrimary} />
                  </View>
                  <View style={styles.contactInfoCol}>
                    <Text style={styles.contactLabel}>Teléfono / WhatsApp</Text>
                    <Text style={styles.contactValue}>{psychologist.telefono}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.borderLight} />
                </TouchableOpacity>
              ) : null}

              {psychologist.correo ? (
                <TouchableOpacity
                  style={[
                    styles.contactRow,
                    !psychologist.telefono && { borderTopWidth: 0 },
                    { borderBottomWidth: 0 },
                  ]}
                  onPress={handleOpenEmail}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactIconBg}>
                    <Ionicons name="mail-outline" size={18} color={colors.coffeePrimary} />
                  </View>
                  <View style={styles.contactInfoCol}>
                    <Text style={styles.contactLabel}>Correo Electrónico</Text>
                    <Text style={styles.contactValue}>{psychologist.correo}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.borderLight} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={{ height: 35 }} />
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: 0.1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  heroProfileCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    marginBottom: 20,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.coffeePrimary,
  },
  verifiedIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.coffeePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.white,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.coffeePrimary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    letterSpacing: 0.1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  callBtn: {
    backgroundColor: colors.coffeePrimary,
    shadowColor: colors.coffeePrimary,
  },
  emailBtn: {
    backgroundColor: colors.coffeeDark,
    shadowColor: colors.coffeeDark,
  },
  primaryActionBtnText: {
    color: colors.white,
    fontSize: 13.5,
    fontWeight: '700',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.coffeeDark,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  cardBox: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1.5,
  },
  bodyDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  mapSquareContainer: {
    width: '100%',
    height: 130,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: '#E8ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapImageBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  centerPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPinBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.coffeeDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 2,
    borderColor: colors.coffeePrimary,
  },
  centerPinShadow: {
    width: 14,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginTop: 2,
  },
  floatingMapBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  floatingMapBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  contactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfoCol: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 1,
  },
  contactValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
});
