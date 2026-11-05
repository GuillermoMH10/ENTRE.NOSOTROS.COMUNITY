import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { TestResult } from '../../types/psychologyTest';
import { subscribeToUserTestAndStreak } from '../../services/psychologyTestService';
import { PsychologyTestModal } from '../PsychologyTest/PsychologyTestModal';
import { colors } from '../../theme/colors';

interface ChallengeFlyerPostCardProps {
  onOpenStreakModal?: () => void;
  onRequireAuth?: () => void;
}

export const ChallengeFlyerPostCard: React.FC<ChallengeFlyerPostCardProps> = ({
  onOpenStreakModal,
  onRequireAuth,
}) => {
  const { user } = useAuth();
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToUserTestAndStreak(user?.id, (res) => {
      setLatestResult(res);
    });
    return () => unsubscribe();
  }, [user?.id]);

  const hasActiveChallenge = Boolean(latestResult?.streakState?.isActive);

  const handlePressFlyer = () => {
    if (hasActiveChallenge && onOpenStreakModal) {
      onOpenStreakModal();
      return;
    }
    setIsInviteModalOpen(true);
  };

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        activeOpacity={0.93}
        onPress={handlePressFlyer}
        style={styles.cardContainer}
      >
        {/* Header: ANIMA Avatar, Verified Name & Subtle Badge Pill */}
        <View style={styles.headerRow}>
          <Image
            source={require('../../../assets/perfilANIMA.png')}
            style={styles.authorAvatar}
            resizeMode="cover"
          />
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.authorUsername}>ANIMA</Text>
              <Ionicons
                name="checkmark-circle"
                size={15}
                color="#FF7A00"
                style={styles.verifiedBadge}
              />
            </View>
            <Text style={styles.subtitleText}>
              Reto de Mejora Personal • 7 Días
            </Text>
          </View>

          <View style={styles.badgeHighlightPill}>
            <Ionicons name="ribbon" size={12} color="#FF7A00" />
            <Text style={styles.badgeHighlightPillText}>Obtén Insignias</Text>
          </View>
        </View>

        {/* Short Description about the Challenge & Badges */}
        <Text style={styles.descriptionTitle}>
          ¡Descubre tu mejor versión un día a la vez y gana insignias para tu perfil!
        </Text>
        <Text style={styles.descriptionText}>
          Únete a nuestro reto de 7 días con misiones sencillas de bienestar, creatividad y autocuidado. Comparte tu evidencia diaria en la comunidad y desbloquea las 4 insignias coleccionables (🌱 Semilla de Cambio, 🔥 Impulso Vital, 🌿 Equilibrio Interior y 👑 Maestría Emocional).
        </Text>

        {/* Full Flyer Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={require('../../../assets/Reto de Mejora Personal con ANIMA.png')}
            style={styles.flyerImage}
            resizeMode="cover"
          />
        </View>
      </TouchableOpacity>

      {/* Invitation Modal when user clicks the Flyer */}
      <PsychologyTestModal
        visible={isInviteModalOpen}
        userId={user?.id}
        initialResult={latestResult}
        startMode="questionnaire"
        onClose={() => setIsInviteModalOpen(false)}
        onOpenPsychologists={() => setIsInviteModalOpen(false)}
        onOpenCreatePost={() => setIsInviteModalOpen(false)}
        onRequireAuth={onRequireAuth}
        onNavigateToProfile={() => {
          setIsInviteModalOpen(false);
          if (onOpenStreakModal) onOpenStreakModal();
        }}
        onTestCompleted={(res) => {
          setLatestResult(res);
          setIsInviteModalOpen(false);
          if (onOpenStreakModal) onOpenStreakModal();
        }}
        embedded={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF7A00',
    backgroundColor: '#FFF7ED',
  },
  authorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorUsername: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  subtitleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FF7A00',
    marginTop: 1,
  },
  badgeHighlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeHighlightPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  descriptionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 19,
    marginBottom: 12,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 2056 / 765,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  flyerImage: {
    width: '100%',
    height: '100%',
  },
});
