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
import { OFFICIAL_STREAK_BADGES } from '../../data/streakChallengesData';
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

  const currentDay =
    streak.days.find((d) => d.dayNumber === streak.currentDayNumber) ||
    streak.days[0];
  const targetBadge =
    OFFICIAL_STREAK_BADGES.find((b) => b.id === streak.targetBadgeId) ||
    OFFICIAL_STREAK_BADGES[0];

  const isCompletedAll = streak.status === 'completed';

  return (
    <View style={styles.outerWrap}>
      <TouchableOpacity
        style={[
          styles.bannerCard,
          isCompletedAll && { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
        ]}
        activeOpacity={0.9}
        onPress={onOpenStreakModal}
      >
        {/* Top Row: Flame + Streak Counter + Badge Preview */}
        <View style={styles.topRow}>
          <View style={styles.flameBadgeCircle}>
            <Text style={{ fontSize: 18 }}>{isCompletedAll ? '🏆' : '🔥'}</Text>
          </View>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.titleLine}>
              <Text style={styles.streakTitle}>
                {isCompletedAll
                  ? '¡Racha de 7 Días Lograda!'
                  : `Mi Racha • Día ${streak.currentDayNumber} de 7`}
              </Text>
              <View
                style={[
                  styles.statusChip,
                  isCompletedAll && { backgroundColor: '#10B981' },
                ]}
              >
                <Text style={styles.statusChipText}>
                  {streak.completedDaysCount}/7 DÍAS
                </Text>
              </View>
            </View>
            <Text style={styles.subtitleText} numberOfLines={1}>
              {streak.focusTitle}
            </Text>
          </View>

          <View style={styles.targetBadgeChip}>
            <Text style={{ fontSize: 15 }}>{targetBadge.emoji}</Text>
            <Text style={styles.targetBadgeChipText}>Nv.{targetBadge.level}</Text>
          </View>
        </View>

        {/* 7 Mini Day Indicators */}
        <View style={styles.miniDaysStrip}>
          {streak.days.map((d) => {
            const done = d.status === 'completed';
            const current = d.dayNumber === streak.currentDayNumber && !isCompletedAll;
            return (
              <View
                key={d.dayNumber}
                style={[
                  styles.miniDayPill,
                  done && styles.miniDayPillDone,
                  current && styles.miniDayPillCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.miniDayText,
                    (done || current) && { color: '#FFFFFF', fontWeight: '800' },
                  ]}
                >
                  D{d.dayNumber}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Today's Task Strip + Action CTA */}
        <View style={styles.taskRow}>
          <Image
            source={require('../../../assets/perfilANIMA.png')}
            style={styles.animaMiniImg}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.taskLabel}>
              {isCompletedAll ? 'Insignia desbloqueada:' : 'Reto de hoy:'}
            </Text>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {isCompletedAll
                ? `${targetBadge.emoji} ${targetBadge.name} — ¡Comparte tu resumen!`
                : `${currentDay.task.emoji} ${currentDay.task.title}`}
            </Text>
          </View>
          <View
            style={[
              styles.actionCtaPill,
              isCompletedAll && { backgroundColor: '#10B981' },
            ]}
          >
            <Text style={styles.actionCtaText}>
              {isCompletedAll ? 'Ver logro' : 'Subir foto'}
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
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1.5,
    borderColor: '#FB923C',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  flameBadgeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: colors.coffeeDark,
  },
  statusChip: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusChipText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  subtitleText: {
    fontSize: 11.5,
    color: '#C2410C',
    fontWeight: '600',
    marginTop: 1,
  },
  targetBadgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDBA74',
    gap: 3,
  },
  targetBadgeChipText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  miniDaysStrip: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  miniDayPill: {
    flex: 1,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDayPillDone: {
    backgroundColor: '#10B981',
  },
  miniDayPillCurrent: {
    backgroundColor: '#FF7A00',
  },
  miniDayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9A3412',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 13,
    gap: 8,
  },
  animaMiniImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF7A00',
  },
  taskLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  actionCtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 2,
  },
  actionCtaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
