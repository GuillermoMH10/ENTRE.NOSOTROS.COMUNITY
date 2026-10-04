import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Psychologist } from '../types/psychologist';
import { subscribeToPsychologists } from '../services/psychologistsService';
import { PsychologistDetailModal } from '../components/Psychologists/PsychologistDetailModal';
import { AppHeader } from '../components/Header/AppHeader';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface PsychologistsScreenProps {
  onOpenMenu: () => void;
  onJoinPress: () => void;
  onProfilePress: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

export const PsychologistsScreen: React.FC<PsychologistsScreenProps> = ({
  onOpenMenu,
  onJoinPress,
  onProfilePress,
  contentPaddingTop = 0,
  contentPaddingBottom = 80,
}) => {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPsico, setSelectedPsico] = useState<Psychologist | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPsychologists((data) => {
      setPsychologists(data);
      setIsLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleOpenWhatsApp = (whatsapp?: string, name?: string) => {
    if (!whatsapp) {
      Alert.alert('Contacto', 'Este especialista no tiene registrado un número de WhatsApp.');
      return;
    }
    const cleanNumber = whatsapp.replace(/[^\d]/g, '');
    const message = encodeURIComponent(
      `Hola ${name || 'Especialista'}, te contacto desde la aplicación Entre Nosotros. Me gustaría solicitar informes para una consulta.`
    );
    const url = `https://wa.me/${cleanNumber}?text=${message}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp', `No se pudo abrir WhatsApp: ${whatsapp}`);
    });
  };

  const handleOpenEmail = (correo?: string, name?: string) => {
    if (!correo) {
      Alert.alert('Contacto', 'Este especialista no tiene registrado un correo electrónico.');
      return;
    }
    const subject = encodeURIComponent('Consulta Psicológica - Entre Nosotros');
    const body = encodeURIComponent(
      `Hola ${name || 'Especialista'},\n\nTe contacto a través de la aplicación Entre Nosotros para solicitar información sobre tus consultas.\n\nSaludos.`
    );
    Linking.openURL(`mailto:${correo}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Correo', correo);
    });
  };

  const renderHeader = () => (
    <View style={styles.headerTitleContainer}>
      <View style={styles.titleRow}>
        <Ionicons name="medical-outline" size={22} color={colors.coffeePrimary} style={{ marginRight: 8 }} />
        <Text style={styles.screenMainTitle}>Especialistas en Psicología</Text>
      </View>
      <Text style={styles.screenSubTitle}>
        Profesionales calificados y verificados listos para acompañarte en tu bienestar emocional
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Psychologist }) => {
    const topicsToShow = (item.temas || []).slice(0, 3);
    const remainingTopicsCount = (item.temas || []).length - 3;

    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardTopContent}>
          {/* Left Column: Circular Avatar with verified badge */}
          <TouchableOpacity
            style={styles.avatarLeftCol}
            activeOpacity={0.88}
            onPress={() => setSelectedPsico(item)}
          >
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: item.imagen }} style={styles.avatarImage} resizeMode="cover" />
              <View style={styles.avatarVerifiedBadge}>
                <Ionicons name="checkmark" size={12} color={colors.white} />
              </View>
            </View>

            {/* Modalidad Badge under avatar */}
            <View style={styles.modalidadPill}>
              <Ionicons
                name={
                  item.modalidad?.includes('línea') || item.modalidad?.includes('Línea')
                    ? 'videocam-outline'
                    : 'business-outline'
                }
                size={11}
                color={colors.coffeePrimary}
              />
              <Text style={styles.modalidadPillText} numberOfLines={1}>
                {item.modalidad || 'Presencial/Línea'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Right Column: Name, Specialty, Topics, and Quick Info */}
          <TouchableOpacity
            style={styles.infoRightCol}
            activeOpacity={0.88}
            onPress={() => setSelectedPsico(item)}
          >
            {/* Name with Verified Checkmark */}
            <View style={styles.nameRow}>
              <Text style={styles.nameText} numberOfLines={1}>
                {item.nombre}
              </Text>
              <Ionicons name="checkmark-circle" size={17} color="#2563EB" style={{ marginLeft: 4 }} />
            </View>

            {/* Specialty */}
            <Text style={styles.specialtyText} numberOfLines={2}>
              {item.especialidad}
            </Text>

            {/* Topics (Max 3 + Counter) */}
            {topicsToShow.length > 0 ? (
              <View style={styles.topicsRow}>
                {topicsToShow.map((tema, idx) => (
                  <View key={idx} style={styles.topicChip}>
                    <Text style={styles.topicChipText} numberOfLines={1}>
                      {tema}
                    </Text>
                  </View>
                ))}
                {remainingTopicsCount > 0 && (
                  <View style={styles.remainingTopicChip}>
                    <Text style={styles.remainingTopicText}>+{remainingTopicsCount}</Text>
                  </View>
                )}
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* Bottom Actions Row: WhatsApp, Email, Ver Perfil */}
        <View style={styles.cardActionsRow}>
          {/* WhatsApp Button */}
          <TouchableOpacity
            style={styles.whatsappBtn}
            activeOpacity={0.85}
            onPress={() => handleOpenWhatsApp(item.whatsapp || item.telefono, item.nombre)}
          >
            <Ionicons name="logo-whatsapp" size={16} color={colors.white} />
            <Text style={styles.whatsappBtnText}>WhatsApp</Text>
          </TouchableOpacity>

          {/* Email Button */}
          <TouchableOpacity
            style={styles.emailBtn}
            activeOpacity={0.85}
            onPress={() => handleOpenEmail(item.correo, item.nombre)}
          >
            <Ionicons name="mail" size={15} color="#EA4335" />
            <Text style={styles.emailBtnText}>Correo</Text>
          </TouchableOpacity>

          {/* View Profile Button */}
          <TouchableOpacity
            style={styles.viewProfileBtn}
            activeOpacity={0.85}
            onPress={() => setSelectedPsico(item)}
          >
            <Text style={styles.viewProfileBtnText}>Ver perfil</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      <AppHeader
        onOpenMenu={onOpenMenu}
        onJoinPress={onJoinPress}
        onProfilePress={onProfilePress}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.coffeePrimary} />
        </View>
      ) : (
        <FlatList
          data={psychologists}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: contentPaddingTop + 8,
              paddingBottom: contentPaddingBottom + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.coffeePrimary}
              colors={[colors.coffeePrimary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={42} color={colors.coffeePrimary} />
              <Text style={styles.emptyTitle}>Próximamente especialistas</Text>
              <Text style={styles.emptySubtitle}>
                Estamos integrando a los mejores profesionales en psicología para brindarte el apoyo que necesitas.
              </Text>
            </View>
          }
        />
      )}

      {/* Full Psychologist Profile Modal */}
      <PsychologistDetailModal
        visible={selectedPsico !== null}
        psychologist={selectedPsico}
        onClose={() => setSelectedPsico(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  headerTitleContainer: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenMainTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: -0.2,
  },
  screenSubTitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 3,
    lineHeight: 18,
  },
  /* Card Container */
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2.5,
  },
  cardTopContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  /* Left Column */
  avatarLeftCol: {
    alignItems: 'center',
    width: 78,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.coffeePrimary,
    backgroundColor: colors.surface,
  },
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  modalidadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 3,
    maxWidth: 78,
  },
  modalidadPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },
  /* Right Column */
  infoRightCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.coffeeDark,
    flexShrink: 1,
  },
  specialtyText: {
    fontSize: 12.5,
    color: colors.coffeePrimary,
    fontWeight: '600',
    lineHeight: 17,
    marginBottom: 8,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  topicChip: {
    backgroundColor: '#F3EAE3',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: '#E5D5C8',
  },
  topicChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.coffeeDark,
  },
  remainingTopicChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: colors.borderLight,
  },
  remainingTopicText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  /* Bottom Actions */
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  whatsappBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECDCA',
    paddingHorizontal: 10,
    paddingVertical: 7.5,
    borderRadius: 12,
    gap: 4,
  },
  emailBtnText: {
    color: '#D92D20',
    fontSize: 12,
    fontWeight: '700',
  },
  viewProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coffeePrimary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 5,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  viewProfileBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  /* Empty State */
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    marginTop: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
});
