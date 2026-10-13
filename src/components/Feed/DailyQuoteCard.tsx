import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentTenMinuteQuote, DAILY_QUOTES } from '../../data/dailyQuotes';
import { colors } from '../../theme/colors';

interface DailyQuoteCardProps {
  quoteOffset?: number;
}

export const DailyQuoteCard: React.FC<DailyQuoteCardProps> = ({ quoteOffset = 0 }) => {
  const getQuoteForOffset = () => {
    const base = getCurrentTenMinuteQuote();
    const targetIndex = (base.index + quoteOffset) % DAILY_QUOTES.length;
    return {
      index: targetIndex,
      quote: DAILY_QUOTES[targetIndex],
    };
  };

  const [currentQuoteData, setCurrentQuoteData] = useState(() => getQuoteForOffset());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      const newQuote = getQuoteForOffset();
      if (newQuote.index !== currentQuoteData.index) {
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ]).start();

        setCurrentQuoteData(newQuote);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentQuoteData.index, quoteOffset, fadeAnim]);

  return (
    <View style={styles.postItemContainer}>
      {/* Header: Author Avatar, Username, Verified Badge & Subtitle */}
      <View style={styles.headerRow}>
        <View style={styles.authorRow}>
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
                size={14}
                color="#3B82F6"
                style={styles.verifiedBadge}
              />
              <Ionicons
                name="sparkles"
                size={12}
                color="#F59E0B"
                style={{ marginLeft: 3 }}
              />
            </View>
            <Text style={styles.postSubtitle}>Mensaje con amor para ti ✨</Text>
          </View>
        </View>
      </View>

      {/* Body: Natural Publication Content */}
      <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
        <Text style={styles.contentParagraph}>
          {currentQuoteData.quote}
        </Text>
      </Animated.View>

      {/* ANIMA Warm Signature */}
      <View style={styles.signatureRow}>
        <Text style={styles.signatureText}>— Con cariño, ANIMA 💙</Text>
      </View>

      {/* Thin Hairline Divider Separator identical to all posts */}
      <View style={styles.postDivider} />
    </View>
  );
};

const styles = StyleSheet.create({
  postItemContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorUsername: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  postSubtitle: {
    fontSize: 11.5,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 1,
  },
  contentWrapper: {
    marginTop: 2,
    marginBottom: 6,
  },
  contentParagraph: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  postDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginTop: 10,
  },
});
