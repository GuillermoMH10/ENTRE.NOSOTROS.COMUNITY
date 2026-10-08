import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import {
  DailyMoodRecord,
  WeekDayInfo,
  getCurrentWeekDays,
  getWeeklyMoodRecords,
  saveDailyMoodRecord,
  subscribeToMoodChanges,
  getTodayDateKey,
} from '../../services/moodService';
import { MOOD_OPTIONS, MoodOption } from '../../data/dailyMoodResponses';

interface WeeklyMoodTrackerProps {
  userId?: string | null;
  isFeedCard?: boolean;
}

export const WeeklyMoodTracker: React.FC<WeeklyMoodTrackerProps> = ({
  userId,
  isFeedCard = false,
}) => {
  const [weekDays, setWeekDays] = useState<WeekDayInfo[]>([]);
  const [records, setRecords] = useState<Record<string, DailyMoodRecord>>({});
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fade animation for quote/detail box
  const fadeAnim = useState(new Animated.Value(1))[0];

  const loadData = useCallback(async () => {
    const days = getCurrentWeekDays();
    setWeekDays(days);

    const todayKey = getTodayDateKey();
    // Default selected day to today
    setSelectedDateKey((prev) => prev || todayKey);

    const weeklyRecords = await getWeeklyMoodRecords(userId);
    setRecords(weeklyRecords);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData();

    // Subscribe to real-time mood check-in updates
    const unsubscribe = subscribeToMoodChanges((newRecord) => {
      setRecords((prev) => ({
        ...prev,
        [newRecord.date]: newRecord,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  const handleSelectDay = (day: WeekDayInfo) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedDateKey(day.dateKey);
  };

  const handleQuickRegisterMood = (option: MoodOption) => {
    const targetDateKey = selectedDateKey || getTodayDateKey();
    saveDailyMoodRecord(option.id, userId, targetDateKey);
  };

  // Selected Day info
  const selectedDayInfo = weekDays.find((d) => d.dateKey === selectedDateKey) || weekDays[0];
  const selectedRecord = selectedDateKey ? records[selectedDateKey] : null;
  const selectedMoodOption = selectedRecord
    ? MOOD_OPTIONS.find((m) => m.id === selectedRecord.mood)
    : null;

  if (loading && weekDays.length === 0) {
    return (
      <View style={[styles.loadingCard, isFeedCard && styles.feedLoadingCard]}>
        <ActivityIndicator size="small" color={colors.coffeePrimary} />
      </View>
    );
  }

  const content = (
    <View style={isFeedCard ? styles.feedCardInner : styles.cardInner}>
      {/* 1. Clean Header with title only */}
      <View style={styles.headerRow}>
        <View style={styles.sparkleIcon}>
          <Ionicons name="calendar" size={15} color={colors.coffeePrimary} />
        </View>
        <Text style={styles.headerTitle}>¿Cómo te has sentido esta semana?</Text>
      </View>

      {/* 2. Mini Weekly Chart / Days Columns */}
      <View style={styles.chartContainer}>
        <View style={styles.daysRow}>
          {weekDays.map((day) => {
            const isSelected = day.dateKey === selectedDateKey;
            const dayRecord = records[day.dateKey];
            const moodOpt = dayRecord ? MOOD_OPTIONS.find((m) => m.id === dayRecord.mood) : null;

            return (
              <TouchableOpacity
                key={day.dateKey}
                style={[
                  styles.dayColumn,
                  isSelected && styles.dayColumnSelected,
                  day.isToday && !isSelected && styles.dayColumnToday,
                ]}
                activeOpacity={0.75}
                onPress={() => handleSelectDay(day)}
              >
                {/* Day Name */}
                <Text
                  style={[
                    styles.dayNameText,
                    isSelected && styles.dayNameTextSelected,
                    day.isToday && styles.dayNameTextToday,
                  ]}
                >
                  {day.dayNameShort}
                </Text>

                {/* Day Number */}
                <Text
                  style={[
                    styles.dayNumberText,
                    isSelected && styles.dayNumberTextSelected,
                    day.isToday && styles.dayNumberTextToday,
                  ]}
                >
                  {day.dayNumber}
                </Text>

                {/* Pill / Capsule Chart Bar */}
                <View
                  style={[
                    styles.moodPill,
                    moodOpt
                      ? {
                          backgroundColor: moodOpt.lightBg,
                          borderColor: moodOpt.color + '40',
                        }
                      : day.isToday
                      ? styles.moodPillTodayEmpty
                      : styles.moodPillEmpty,
                    isSelected && styles.moodPillSelected,
                  ]}
                >
                  {moodOpt ? (
                    <Text style={styles.moodEmoji}>{moodOpt.emoji}</Text>
                  ) : day.isToday ? (
                    <Ionicons name="add" size={15} color={colors.coffeePrimary} />
                  ) : (
                    <View
                      style={[
                        styles.emptyDot,
                        day.isFuture && styles.emptyDotFuture,
                      ]}
                    />
                  )}
                </View>

                {/* Bottom Active Indicator */}
                {isSelected ? (
                  <View style={styles.activeDotIndicator} />
                ) : day.isToday ? (
                  <Text style={styles.todayTinyLabel}>Hoy</Text>
                ) : (
                  <View style={{ height: 10 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Single Clean Dynamic Message Section ("Mensaje para tu corazón") */}
      <Animated.View style={[styles.detailBox, { opacity: fadeAnim }]}>
        {/* Selected Day Header */}
        <View style={styles.detailHeader}>
          <View style={styles.detailDayInfo}>
            <Ionicons
              name="time-outline"
              size={13}
              color={colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.detailDayName}>
              {selectedDayInfo
                ? `${selectedDayInfo.dayNameFull} ${selectedDayInfo.dayNumber} de ${selectedDayInfo.monthName}`
                : 'Día seleccionado'}
              {selectedDayInfo?.isToday ? ' (Hoy)' : ''}
            </Text>
          </View>

          {selectedMoodOption ? (
            <View
              style={[
                styles.moodStatusBadge,
                {
                  backgroundColor: selectedMoodOption.lightBg,
                  borderColor: selectedMoodOption.color + '50',
                },
              ]}
            >
              <Text style={styles.moodStatusEmoji}>{selectedMoodOption.emoji}</Text>
              <Text
                style={[
                  styles.moodStatusText,
                  { color: selectedMoodOption.color },
                ]}
              >
                {selectedMoodOption.label}
              </Text>
            </View>
          ) : (
            <View style={styles.noRecordBadge}>
              <Text style={styles.noRecordBadgeText}>
                {selectedDayInfo?.isToday
                  ? 'Sin registrar'
                  : selectedDayInfo?.isFuture
                  ? 'Próximamente'
                  : 'Sin registro'}
              </Text>
            </View>
          )}
        </View>

        {/* Dynamic Empathic Phrase or Quick 1-Tap Selector */}
        {selectedRecord && selectedMoodOption ? (
          <View
            style={[
              styles.quoteCard,
              {
                backgroundColor: selectedMoodOption.lightBg + '55',
                borderLeftColor: selectedMoodOption.color,
              },
            ]}
          >
            <View style={styles.quoteIconRow}>
              <Ionicons
                name="chatbubble-ellipses"
                size={15}
                color={selectedMoodOption.color}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.quoteTitle, { color: selectedMoodOption.color }]}>
                Mensaje para tu corazón
              </Text>
            </View>
            <Text style={styles.quoteBody}>"{selectedRecord.quote}"</Text>
          </View>
        ) : selectedDayInfo?.isToday ? (
          <View style={styles.todayPromptCard}>
            <Text style={styles.todayPromptTitle}>
              ¿Cómo te sientes hoy?
            </Text>
            <View style={styles.quickMoodsRow}>
              {MOOD_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.quickMoodBtn,
                    { backgroundColor: opt.lightBg },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleQuickRegisterMood(opt)}
                >
                  <Text style={styles.quickMoodEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.quickMoodLabel, { color: opt.color }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : selectedDayInfo?.isFuture ? (
          <View style={styles.emptyDayNotice}>
            <Ionicons name="sparkles-outline" size={17} color={colors.coffeePrimary} style={{ marginBottom: 4 }} />
            <Text style={styles.emptyDayNoticeText}>
              Vive un día a la vez. Cada nuevo amanecer traerá la oportunidad de conectar con tu sentir.
            </Text>
          </View>
        ) : (
          <View style={styles.emptyDayNotice}>
            <Ionicons name="leaf-outline" size={17} color={colors.coffeePrimary} style={{ marginBottom: 4 }} />
            <Text style={styles.emptyDayNoticeText}>
              No registraste tu emoción este día. Recuerda que cada paso en tu camino de bienestar cuenta.
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );

  if (isFeedCard) {
    return (
      <View style={styles.feedCardContainer}>
        {content}
        <View style={styles.postDivider} />
      </View>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardInner: {
    padding: 16,
  },
  feedCardContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  feedCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    padding: 14,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1.5,
    marginBottom: 10,
  },
  postDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginTop: 6,
  },
  loadingCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 24,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: colors.borderLight,
  },
  feedLoadingCard: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sparkleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: -0.2,
  },
  chartContainer: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 3,
    borderRadius: 12,
  },
  dayColumnSelected: {
    backgroundColor: colors.white,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dayColumnToday: {},
  dayNameText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dayNameTextSelected: {
    color: colors.coffeeDark,
    fontWeight: '800',
  },
  dayNameTextToday: {
    color: colors.coffeePrimary,
    fontWeight: '700',
  },
  dayNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginBottom: 5,
  },
  dayNumberTextSelected: {
    color: colors.coffeeDark,
    fontWeight: '900',
  },
  dayNumberTextToday: {
    color: colors.coffeePrimary,
  },
  moodPill: {
    width: 33,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'transparent',
  },
  moodPillSelected: {
    borderWidth: 2,
    borderColor: colors.coffeePrimary,
    transform: [{ scale: 1.05 }],
  },
  moodPillTodayEmpty: {
    backgroundColor: '#FFFFFF',
    borderStyle: 'dashed',
    borderColor: colors.coffeePrimary,
    borderWidth: 1.3,
  },
  moodPillEmpty: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  moodEmoji: {
    fontSize: 18,
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coffeeMedium,
  },
  emptyDotFuture: {
    backgroundColor: colors.borderLight,
  },
  activeDotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.coffeePrimary,
    marginTop: 5,
  },
  todayTinyLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.coffeePrimary,
    marginTop: 3,
  },
  detailBox: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailDayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailDayName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  moodStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 9,
    borderWidth: 1,
  },
  moodStatusEmoji: {
    fontSize: 11.5,
    marginRight: 3,
  },
  moodStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  noRecordBadge: {
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 7,
  },
  noRecordBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quoteCard: {
    padding: 10,
    borderRadius: 11,
    borderLeftWidth: 3.5,
  },
  quoteIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  quoteTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quoteBody: {
    fontSize: 12,
    lineHeight: 17.5,
    color: colors.textPrimary,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  todayPromptCard: {
    padding: 10,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  todayPromptTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.coffeeDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  quickMoodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickMoodBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  quickMoodEmoji: {
    fontSize: 26,
    marginBottom: 3,
  },
  quickMoodLabel: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  emptyDayNotice: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  emptyDayNoticeText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
    fontStyle: 'italic',
  },
});
