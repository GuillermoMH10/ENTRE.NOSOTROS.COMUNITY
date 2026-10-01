import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
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
                borderColor: (selectedOption?.color || colors.coffeePrimary) + '40',
                shadowColor: selectedOption?.color || colors.coffeePrimary,
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
                <Ionicons name="sparkles" size={16} color={colors.coffeePrimary} />
              </View>
              <View style={styles.headerTexts}>
                <Text style={styles.mainTitle}>¿Cómo te sientes hoy?</Text>
                <Text style={styles.subTitle}>
                  Toca una carita para conectar con tus emociones
                </Text>
              </View>
            </View>

            {/* 5 Emojis / Faces Selection Grid */}
            <View style={styles.moodsRow}>
              {MOOD_OPTIONS.map((option) => {
                const isCurrentSelected = todayRecord?.mood === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.moodItem,
                      { backgroundColor: option.lightBg },
                      isCurrentSelected && {
                        borderColor: option.color,
                        borderWidth: 2,
                        transform: [{ scale: 1.05 }],
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectMood(option)}
                  >
                    <Text style={styles.moodEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.moodLabel,
                        { color: option.color },
                        isCurrentSelected && { fontWeight: '800' },
                      ]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
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
                <View
                  style={[
                    styles.answeredEmojiCircle,
                    { backgroundColor: selectedOption.lightBg },
                  ]}
                >
                  <Text style={styles.answeredEmojiText}>
                    {selectedOption.emoji}
                  </Text>
                </View>
                <View style={styles.answeredTitleCol}>
                  <Text style={styles.answeredThanksText}>
                    Gracias por contestar
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
                  backgroundColor: selectedOption.lightBg + '60',
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
    borderRadius: 20,
    borderWidth: 1.4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  defaultCardBorder: {
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
  },
  contentPadding: {
    padding: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sparkleIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTexts: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: -0.2,
  },
  subTitle: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  moodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  moodItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  submittingLoader: {
    marginTop: 8,
    alignItems: 'center',
  },
  answeredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  answeredLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  answeredEmojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  answeredEmojiText: {
    fontSize: 22,
  },
  answeredTitleCol: {
    flex: 1,
  },
  answeredThanksText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  answeredMoodName: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 1,
  },
  changeResponseBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  changeResponseText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quoteBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderLeftWidth: 3.5,
    marginTop: 2,
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
});
