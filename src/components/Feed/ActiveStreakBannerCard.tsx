import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { TestResult } from '../../types/psychologyTest';
import { subscribeToUserTestAndStreak } from '../../services/psychologyTestService';
import { OFFICIAL_STREAK_BADGES, getTopicConfig } from '../../data/streakChallengesData';
import { colors } from '../../theme/colors';

interface ActiveStreakBannerCardProps {
  onOpenStreakModal?: () => void;
}

export const ActiveStreakBannerCard: React.FC<ActiveStreakBannerCardProps> = ({
  onOpenStreakModal,
}) => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToUserTestAndStreak(user?.id, (res) => {
      setTestResult(res);
    });
    return () => unsubscribe();
  }, [user?.id]);

  const streak = testResult?.streakState;
  if (!streak || !streak.isActive) {
    return null;
  }

  const topic = getTopicConfig(streak.focusCategory);
  const currentDay =
    streak.days.find((d) => d.dayNumber === streak.currentDayNumber) ||
    streak.days[0];
  const targetBadge =
    OFFICIAL_STREAK_BADGES.find((b) => b.id === topic.badgeId) ||
    OFFICIAL_STREAK_BADGES[0];

  const isCompletedAll = streak.status === 'completed';

  return (
    <View style={styles.outerWrap}>
      <TouchableOpacity
        style={styles.bannerCard}
        activeOpacity={0.9}
        onPress={onOpenStreakModal}
      >
        {/* Top Row: Clean Single-Line Header */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.topicPill,
              {
                backgroundColor: topic.softBg,
                borderColor: topic.borderColor,
              },
            ]}
          >
            <View
              style={[
                styles.topicDot,
                { backgroundColor: topic.accentColor },
              ]}
            />
            <Text
              style={[styles.topicPillText, { color: topic.accentColor }]}
              numberOfLines={1}
            >
              {isCompletedAll
                ? `Tema superado: ${topic.name}`
                : `Actividades • ${topic.name}`}
            </Text>
          </View>

          <View style={styles.targetBadgeChip}>
            <Ionicons
              name="medal-outline"
              size={12}
              color={topic.accentColor}
            />
            <Text style={styles.targetBadgeChipText}>
              {isCompletedAll ? 'Medalla obtenida' : `Día ${streak.currentDayNumber}`}
            </Text>
          </View>
        </View>

        {/* Current Activity Strip + Action CTA */}
        <View style={styles.taskRow}>
          <Image
            source={require('../../../assets/perfilANIMA.png')}
            style={[styles.animaMiniImg, { borderColor: topic.accentColor }]}
            resizeMode="cover"
          />
          <View style={styles.taskTextCol}>
            <Text style={styles.taskLabel}>
              {isCompletedAll ? 'Logro desbloqueado' : 'Actividad de hoy'}
            </Text>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {isCompletedAll ? targetBadge.name : currentDay.task.title}
            </Text>
          </View>
          <View
            style={[
              styles.actionCtaPill,
              { backgroundColor: topic.accentColor },
            ]}
          >
            <Text style={styles.actionCtaText}>
              {isCompletedAll ? 'Ver' : 'Ir'}
            </Text>
            <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrap: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: colors.white,
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    flexShrink: 1,
  },
  topicDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  topicPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  targetBadgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    flexShrink: 0,
  },
  targetBadgeChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 9,
  },
  animaMiniImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
  },
  taskTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  taskLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 16,
    marginTop: 1,
  },
  actionCtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6.5,
    borderRadius: 10,
    gap: 3,
    flexShrink: 0,
  },
  actionCtaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
