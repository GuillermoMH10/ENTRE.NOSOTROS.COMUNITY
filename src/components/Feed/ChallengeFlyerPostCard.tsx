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
                color="#3B82F6"
                style={styles.verifiedBadge}
              />
            </View>
            <Text style={styles.subtitleText}>
              Actividades de Apoyo y Mejora • A tu propio ritmo
            </Text>
          </View>

          <View style={styles.badgeHighlightPill}>
            <Ionicons name="medal-outline" size={12} color="#2563EB" />
            <Text style={styles.badgeHighlightPillText}>Obtén Medallas</Text>
          </View>
        </View>

        {/* Short Description about the Challenge & Badges */}
        <Text style={styles.descriptionTitle}>
          ¡Realiza actividades agradables a tu ritmo para sentirte mejor y gana medallas en tu perfil!
        </Text>
        <Text style={styles.descriptionText}>
          Elige el tema en el que te gustaría trabajar hoy (Depresión, Ansiedad, Estrés o Amor Propio) y realiza actividades interactivas cada vez que lo necesites, decidiendo si deseas publicarlas o guardarlas en privado.
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
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
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
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
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
    color: '#2563EB',
    marginTop: 1,
  },
  badgeHighlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeHighlightPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2563EB',
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flyerImage: {
    width: '100%',
    height: '100%',
  },
});
