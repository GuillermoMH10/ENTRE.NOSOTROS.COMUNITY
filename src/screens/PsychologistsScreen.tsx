import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  Animated,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  // Preview before full profile (5-second countdown)
  const [previewPsico, setPreviewPsico] = useState<Psychologist | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [selectedPsico, setSelectedPsico] = useState<Psychologist | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = subscribeToPsychologists((data) => {
      setPsychologists(data);
      setIsLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle 5-second countdown timer for description preview
  useEffect(() => {
    if (previewPsico) {
      setCountdown(5);
      progressAnim.setValue(0);

      // Animate progress bar smoothly over 5000ms
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start();

      let secondsLeft = 5;
      timerRef.current = setInterval(() => {
        secondsLeft -= 1;
        setCountdown(secondsLeft);

        if (secondsLeft <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          const target = previewPsico;
          setPreviewPsico(null);
          setSelectedPsico(target);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [previewPsico]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleCardPress = (psico: Psychologist) => {
    setPreviewPsico(psico);
  };

  const handleOpenFullNow = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const target = previewPsico;
    setPreviewPsico(null);
    setSelectedPsico(target);
  };

  const handleClosePreview = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPreviewPsico(null);
  };

  const renderHeader = () => (
    <View style={styles.topHeaderTitleContainer}>
      <Text style={styles.screenMainTitle}>Psicólogos</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Psychologist }) => {
    return (
      <TouchableOpacity
        style={styles.gridCard}
        activeOpacity={0.85}
        onPress={() => handleCardPress(item)}
      >
        {/* Circular Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.imagen }}
            style={styles.gridAvatar}
            resizeMode="cover"
          />
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={11} color={colors.white} />
          </View>
        </View>

        {/* Name */}
        <Text style={styles.gridNameText} numberOfLines={2}>
          {item.nombre}
        </Text>

        {/* Specialty */}
        <Text style={styles.gridSpecialtyText} numberOfLines={2}>
          {item.especialidad}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* App Header (identical to home, search, blog) */}
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
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
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
              <Ionicons name="people-outline" size={40} color={colors.coffeePrimary} />
              <Text style={styles.emptyTitle}>Próximamente especialistas</Text>
              <Text style={styles.emptySubtitle}>
                Estamos integrando a los mejores profesionales en psicología para brindarte el apoyo que necesitas.
              </Text>
            </View>
          }
        />
      )}

      {/* 5-SECOND DESCRIPTION PREVIEW MODAL */}
      {previewPsico !== null && (
        <Modal
          transparent
          visible={previewPsico !== null}
          animationType="fade"
          onRequestClose={handleClosePreview}
        >
          <View style={styles.previewBackdrop}>
            <View style={styles.previewCard}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.previewCloseBtn}
                onPress={handleClosePreview}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </TouchableOpacity>

              {/* Psychologist Header */}
              <View style={styles.previewAvatarContainer}>
                <Image
                  source={{ uri: previewPsico.imagen }}
                  style={styles.previewAvatar}
                  resizeMode="cover"
                />
              </View>

              <Text style={styles.previewNameText}>{previewPsico.nombre}</Text>
              <Text style={styles.previewSpecialtyText}>
                {previewPsico.especialidad}
              </Text>

              {/* Description Content */}
              <View style={styles.previewDescriptionBox}>
                <Text style={styles.previewDescriptionHeading}>Descripción</Text>
                <Text style={styles.previewDescriptionBody}>
                  {previewPsico.descripcion ||
                    'Especialista enfocado en acompañamiento emocional y bienestar integral.'}
                </Text>
              </View>

              {/* 5-Second Countdown Timer & Progress Bar */}
              <View style={styles.countdownContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.countdownText}>
                  Abriendo perfil completo en {countdown}s...
                </Text>
              </View>

              {/* Direct Open Button */}
              <TouchableOpacity
                style={styles.openFullNowBtn}
                onPress={handleOpenFullNow}
                activeOpacity={0.8}
              >
                <Text style={styles.openFullNowBtnText}>Ver perfil completo ahora</Text>
                <Ionicons name="arrow-forward" size={15} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Full Detail Modal */}
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
    paddingHorizontal: 14,
  },
  topHeaderTitleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  screenMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: -0.3,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  gridAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.coffeePrimary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.coffeePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  gridNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  gridSpecialtyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.coffeePrimary,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.coffeeDark,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  // Preview Modal Styles
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  previewCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  previewAvatarContainer: {
    marginBottom: 10,
  },
  previewAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: colors.coffeePrimary,
    backgroundColor: colors.surface,
  },
  previewNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
    marginBottom: 2,
  },
  previewSpecialtyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.coffeePrimary,
    textAlign: 'center',
    marginBottom: 14,
  },
  previewDescriptionBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  previewDescriptionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.coffeePrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewDescriptionBody: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  countdownContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.coffeePrimary,
    borderRadius: 2,
  },
  countdownText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  openFullNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coffeePrimary,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 12,
    gap: 6,
    width: '100%',
  },
  openFullNowBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
