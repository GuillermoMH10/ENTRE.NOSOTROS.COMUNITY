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
        {/* Top Row: Topic Emoji + Title + Medal Preview */}
        <View style={styles.topRow}>
          <Text style={{ fontSize: 22 }}>{isCompletedAll ? '🏅' : topic.emoji}</Text>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.titleLine}>
              <Text style={styles.streakTitle}>
                {isCompletedAll
                  ? `¡Tema Superado: ${topic.name}!`
                  : `Actividades de Mejora • ${topic.name}`}
              </Text>
              <View
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: topic.softBg,
                    borderColor: topic.borderColor,
                  },
                ]}
              >
                <Text style={[styles.statusChipText, { color: topic.accentColor }]}>
                  A TU RITMO
                </Text>
              </View>
            </View>
            <Text style={styles.subtitleText} numberOfLines={1}>
              {topic.shortSubtitle}
            </Text>
          </View>

          <View style={styles.targetBadgeChip}>
            <Text style={{ fontSize: 15 }}>{targetBadge.emoji}</Text>
            <Text style={styles.targetBadgeChipText}>Medalla</Text>
          </View>
        </View>

        {/* Current Activity Strip + Action CTA */}
        <View style={styles.taskRow}>
          <Image
            source={require('../../../assets/perfilANIMA.png')}
            style={[styles.animaMiniImg, { borderColor: topic.accentColor }]}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.taskLabel}>
              {isCompletedAll ? 'Medalla obtenida:' : 'Actividad sugerida:'}
            </Text>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {isCompletedAll
                ? `${targetBadge.emoji} ${targetBadge.name}`
                : currentDay.task.title}
            </Text>
          </View>
          <View
            style={[
              styles.actionCtaPill,
              { backgroundColor: topic.accentColor },
            ]}
          >
            <Text style={styles.actionCtaText}>
              {isCompletedAll ? 'Ver medalla' : 'Ver actividad'}
            </Text>
            <Ionicons name="chevron-forward" size={13} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrap: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: colors.white,
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
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
    marginBottom: 10,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  streakTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  statusChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  subtitleText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  targetBadgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  targetBadgeChipText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#334155',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  animaMiniImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
  },
  taskLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  taskTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  actionCtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 3,
  },
  actionCtaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
