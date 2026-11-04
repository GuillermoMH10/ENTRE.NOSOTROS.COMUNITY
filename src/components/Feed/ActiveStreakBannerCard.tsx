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
        style={styles.bannerCard}
        activeOpacity={0.9}
        onPress={onOpenStreakModal}
      >
        {/* Top Row: Flame + Streak Counter + Badge Preview */}
        <View style={styles.topRow}>
          <Text style={{ fontSize: 22 }}>{isCompletedAll ? '🏆' : '🔥'}</Text>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.titleLine}>
              <Text style={styles.streakTitle}>
                {isCompletedAll
                  ? '¡Ruta de 7 Días Lograda!'
                  : `Mi Ruta • Día ${streak.currentDayNumber} de 7`}
              </Text>
              <View style={styles.statusChip}>
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
            <Text style={{ fontSize: 16 }}>{targetBadge.emoji}</Text>
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
                    done && { color: '#FFFFFF', fontWeight: '800' },
                    current && { color: '#FF7A00', fontWeight: '800' },
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
              {isCompletedAll ? 'Insignia desbloqueada:' : 'Actividad de hoy:'}
            </Text>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {isCompletedAll
                ? `${targetBadge.emoji} ${targetBadge.name} — ¡Comparte tu resumen!`
                : currentDay.task.title}
            </Text>
          </View>
          <View style={styles.actionCtaPill}>
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
  },
  streakTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  statusChip: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  statusChipText: {
    color: '#FF7A00',
    fontSize: 9.5,
    fontWeight: '900',
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
    color: '#0F172A',
  },
  miniDaysStrip: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  miniDayPill: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDayPillDone: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  miniDayPillCurrent: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF7A00',
  },
  miniDayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  animaMiniImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#FF7A00',
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
