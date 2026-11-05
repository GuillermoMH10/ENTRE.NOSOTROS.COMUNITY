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

  const [isChangingToday, setIsChangingToday] = useState(false);

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
      {/* 1. Clean Header with Subtitle & ANIMA touch */}
      <View style={styles.headerRow}>
        <View style={styles.sparkleIcon}>
          <Ionicons name="sparkles" size={16} color="#FF7A00" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>¿Cómo te has sentido esta semana?</Text>
          <Text style={styles.headerSubtitle}>
            Toca un día o elige tu emoción de hoy para registrar tu bienestar
          </Text>
        </View>
      </View>

      {/* 2. Mini Weekly Chart / Days Columns (Large Emojis WITHOUT background) */}
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
                onPress={() => {
                  setIsChangingToday(false);
                  handleSelectDay(day);
                }}
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

                {/* Emoji Slot: NO background behind the emoji face, large emoji */}
                <View
                  style={[
                    styles.moodPill,
                    moodOpt
                      ? styles.moodPillWithEmoji
                      : day.isToday
                      ? styles.moodPillTodayEmpty
                      : styles.moodPillEmpty,
                    isSelected && !moodOpt && styles.moodPillSelected,
                  ]}
                >
                  {moodOpt ? (
                    <Text
                      style={[
                        styles.moodEmojiLarge,
                        isSelected && { transform: [{ scale: 1.14 }] },
                      ]}
                    >
                      {moodOpt.emoji}
                    </Text>
                  ) : day.isToday ? (
                    <Ionicons name="add" size={16} color="#FF7A00" />
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

      {/* 3. Single Clean Dynamic Message Section */}
      <Animated.View style={[styles.detailBox, { opacity: fadeAnim }]}>
        {/* Selected Day Header */}
        <View style={styles.detailHeader}>
          <View style={styles.detailDayInfo}>
            <Ionicons
              name="calendar-clear-outline"
              size={13}
              color={colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.detailDayName}>
              {selectedDayInfo
                ? `${selectedDayInfo.dayNameFull} ${selectedDayInfo.dayNumber} de ${selectedDayInfo.monthName}`
                : 'Día seleccionado'}
              {selectedDayInfo?.isToday ? ' • Hoy' : ''}
            </Text>
          </View>

          {selectedMoodOption && !isChangingToday ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.moodStatusClean}>
                <Text style={styles.moodStatusEmojiClean}>{selectedMoodOption.emoji}</Text>
                <Text
                  style={[
                    styles.moodStatusText,
                    { color: selectedMoodOption.color },
                  ]}
                >
                  {selectedMoodOption.label}
                </Text>
              </View>
              {selectedDayInfo?.isToday && (
                <TouchableOpacity
                  onPress={() => setIsChangingToday(true)}
                  activeOpacity={0.7}
                  style={styles.changeMoodTinyBtn}
                >
                  <Text style={styles.changeMoodTinyBtnText}>Cambiar</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noRecordBadge}>
              <Text style={styles.noRecordBadgeText}>
                {selectedDayInfo?.isToday
                  ? 'Elige tu emoción'
                  : selectedDayInfo?.isFuture
                  ? 'Próximamente'
                  : 'Sin registro'}
              </Text>
            </View>
          )}
        </View>

        {/* Dynamic Empathic Phrase or Quick 1-Tap Selector with HUGE Emojis & NO background */}
        {selectedRecord && selectedMoodOption && !isChangingToday ? (
          <View
            style={[
              styles.quoteCard,
              {
                backgroundColor: '#F8FAFC',
                borderLeftColor: selectedMoodOption.color,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={styles.quoteBigFloatingEmoji}>{selectedMoodOption.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.quoteIconRow}>
                  <Ionicons
                    name="heart"
                    size={13}
                    color={selectedMoodOption.color}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={[styles.quoteTitle, { color: selectedMoodOption.color }]}>
                    Mensaje para tu corazón
                  </Text>
                </View>
                <Text style={styles.quoteBody}>"{selectedRecord.quote}"</Text>
              </View>
            </View>
          </View>
        ) : selectedDayInfo?.isToday ? (
          <View style={styles.todayPromptCard}>
            <Text style={styles.todayPromptTitle}>
              ¿Cómo te sientes hoy?
            </Text>
            <View style={styles.quickMoodsRow}>
              {MOOD_OPTIONS.map((opt) => {
                const isCurr = selectedRecord?.mood === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.quickMoodBtn,
                      isCurr && styles.quickMoodBtnSelected,
                    ]}
                    activeOpacity={0.65}
                    onPress={() => {
                      setIsChangingToday(false);
                      handleQuickRegisterMood(opt);
                    }}
                  >
                    <Text style={styles.quickMoodEmoji}>{opt.emoji}</Text>
                    <Text
                      style={[
                        styles.quickMoodLabel,
                        { color: isCurr ? opt.color : '#475569' },
                        isCurr && { fontWeight: '800' },
                      ]}
                      numberOfLines={1}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  chartContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    paddingVertical: 4,
    borderRadius: 13,
  },
  dayColumnSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dayColumnToday: {},
  dayNameText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  dayNameTextSelected: {
    color: '#0F172A',
    fontWeight: '800',
  },
  dayNameTextToday: {
    color: '#FF7A00',
    fontWeight: '800',
  },
  dayNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  dayNumberTextSelected: {
    color: '#0F172A',
    fontWeight: '900',
  },
  dayNumberTextToday: {
    color: '#FF7A00',
    fontWeight: '900',
  },
  moodPill: {
    width: 36,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'transparent',
  },
  moodPillWithEmoji: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  moodPillSelected: {
    borderWidth: 1.5,
    borderColor: '#FF7A00',
  },
  moodPillTodayEmpty: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderColor: '#FDBA74',
    borderWidth: 1.4,
  },
  moodPillEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  moodEmojiLarge: {
    fontSize: 28,
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  emptyDotFuture: {
    backgroundColor: '#E2E8F0',
  },
  activeDotIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FF7A00',
    marginTop: 4,
  },
  todayTinyLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF7A00',
    marginTop: 3,
  },
  detailBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailDayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailDayName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  moodStatusClean: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  moodStatusEmojiClean: {
    fontSize: 20,
    marginRight: 5,
  },
  moodStatusText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  changeMoodTinyBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  changeMoodTinyBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  noRecordBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noRecordBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  quoteCard: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderLeftWidth: 3.5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quoteBigFloatingEmoji: {
    fontSize: 38,
    backgroundColor: 'transparent',
  },
  quoteIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  quoteTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quoteBody: {
    fontSize: 12,
    lineHeight: 17.5,
    color: '#334155',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  todayPromptCard: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  todayPromptTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  quickMoodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickMoodBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    backgroundColor: 'transparent',
  },
  quickMoodBtnSelected: {
    transform: [{ scale: 1.12 }],
  },
  quickMoodEmoji: {
    fontSize: 38,
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  quickMoodLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDayNotice: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  emptyDayNoticeText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
    fontStyle: 'italic',
  },
});
