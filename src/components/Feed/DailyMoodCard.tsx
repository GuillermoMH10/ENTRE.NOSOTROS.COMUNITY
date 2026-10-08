import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOOD_OPTIONS, MoodType, MoodOption } from '../../data/dailyMoodResponses';
import {
  DailyMoodRecord,
  getTodayMoodRecord,
  createInstantMoodRecord,
  persistMoodRecordInBackground,
} from '../../services/moodService';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export const DailyMoodCard: React.FC = () => {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState<DailyMoodRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    let isMounted = true;
    const loadTodayMood = async () => {
      setLoading(true);
      const record = await getTodayMoodRecord(user?.id);
      if (isMounted) {
        setTodayRecord(record);
        setShowQuestion(!record);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    loadTodayMood();
    return () => {
      isMounted = false;
    };
  }, [user?.id, fadeAnim]);

  const handleSelectMood = (option: MoodOption) => {
    // 1. Instantaneous 0ms UI update
    const instantRecord = createInstantMoodRecord(option.id, user?.id);
    setTodayRecord(instantRecord);
    setShowQuestion(false);

    // 2. Persist in background asynchronously
    persistMoodRecordInBackground(instantRecord);
  };

  const handleChangeResponse = () => {
    setShowQuestion(true);
  };

  if (loading) {
    return null;
  }

  const selectedOption = todayRecord
    ? MOOD_OPTIONS.find((opt) => opt.id === todayRecord.mood) || MOOD_OPTIONS[0]
    : null;

  return (
    <Animated.View style={[styles.outerContainer, { opacity: fadeAnim }]}>
      <View
        style={[
          styles.card,
          todayRecord && !showQuestion
            ? {
                borderColor: colors.borderLight,
                shadowColor: selectedOption?.color || colors.primary,
              }
            : styles.defaultCardBorder,
        ]}
      >
        {/* UNANSWERED / EDITING STATE */}
        {(!todayRecord || showQuestion) && (
          <View style={styles.contentPadding}>
            {/* Header Title & Subtitle */}
            <View style={styles.headerTitleRow}>
              <View style={styles.sparkleIconWrapper}>
                <Ionicons name="sparkles" size={17} color={colors.primary} />
              </View>
              <View style={styles.headerTexts}>
                <Text style={styles.mainTitle}>¿Cómo te sientes hoy?</Text>
                <Text style={styles.subTitle}>
                  Toca una carita para conectar con tus emociones
                </Text>
              </View>
            </View>

            {/* 5 Emojis / Faces Selection Row - Clean transparent background & large faces */}
            <View style={styles.moodsRow}>
              {MOOD_OPTIONS.map((option) => {
                const isCurrentSelected = todayRecord?.mood === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.moodItem,
                      isCurrentSelected && styles.moodItemSelected,
                    ]}
                    activeOpacity={0.6}
                    onPress={() => handleSelectMood(option)}
                  >
                    <Text style={styles.moodEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.moodLabel,
                        { color: isCurrentSelected ? option.color : colors.textSecondary },
                        isCurrentSelected && styles.moodLabelSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                    {isCurrentSelected && (
                      <View style={[styles.selectedDot, { backgroundColor: option.color }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ANSWERED STATE */}
        {todayRecord && !showQuestion && selectedOption && (
          <View style={styles.contentPadding}>
            {/* Success Header */}
            <View style={styles.answeredHeader}>
              <View style={styles.answeredLeftRow}>
                <View style={styles.answeredEmojiCircle}>
                  <Text style={styles.answeredEmojiText}>
                    {selectedOption.emoji}
                  </Text>
                </View>
                <View style={styles.answeredTitleCol}>
                  <Text style={styles.answeredThanksText}>
                    Gracias por compartir
                  </Text>
                  <Text
                    style={[
                      styles.answeredMoodName,
                      { color: selectedOption.color },
                    ]}
                  >
                    Hoy te sientes {selectedOption.label.toLowerCase()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.changeResponseBtn}
                onPress={handleChangeResponse}
                activeOpacity={0.6}
              >
                <Text style={styles.changeResponseText}>Cambiar</Text>
              </TouchableOpacity>
            </View>

            {/* Tailored Supportive Quote */}
            <View
              style={[
                styles.quoteBubble,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderLeftColor: selectedOption.color,
                },
              ]}
            >
              <Text style={styles.quoteText}>
                "{todayRecord.quote}"
              </Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  defaultCardBorder: {
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
  },
  contentPadding: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sparkleIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTexts: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: -0.2,
  },
  subTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  moodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
  },
  moodItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: 'transparent', // Sin fondo en las caritas como solicitado
    borderRadius: 16,
    minWidth: 58,
  },
  moodItemSelected: {
    transform: [{ scale: 1.12 }],
  },
  moodEmoji: {
    fontSize: 38, // Carita mucho más grande y bonita
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  moodLabelSelected: {
    fontWeight: '800',
  },
  selectedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
  answeredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  answeredLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  answeredEmojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: colors.surfaceSoft,
  },
  answeredEmojiText: {
    fontSize: 28,
  },
  answeredTitleCol: {
    flex: 1,
  },
  answeredThanksText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  answeredMoodName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  changeResponseBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  changeResponseText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  quoteBubble: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderLeftWidth: 4,
    marginTop: 4,
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
});
