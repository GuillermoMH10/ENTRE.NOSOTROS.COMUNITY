import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export interface AnimaToastPayload {
  id?: string;
  title: string;
  message: string;
  emoji?: string;
  accentColor?: string;
  durationMs?: number;
}

type ToastListener = (payload: AnimaToastPayload) => void;
const listeners = new Set<ToastListener>();

export const showAnimaToast = (payload: AnimaToastPayload) => {
  const enriched: AnimaToastPayload = {
    id: `anima_toast_${Date.now()}_${Math.random()}`,
    accentColor: '#FF7A00',
    durationMs: 5200,
    ...payload,
  };
  listeners.forEach((listener) => listener(enriched));
};

interface AnimaToastHostProps {
  topOffset?: number;
}

export const AnimaToastHost: React.FC<AnimaToastHostProps> = ({ topOffset = 18 }) => {
  const [toast, setToast] = useState<AnimaToastPayload | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 240,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setToast(null);
    });
  };

  useEffect(() => {
    const handler: ToastListener = (incoming) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setToast(incoming);
      translateY.setValue(-90);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 75,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        dismiss();
      }, incoming.durationMs || 5200);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!toast) return null;

  const accent = toast.accentColor || '#FF7A00';

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.hostWrapper,
        {
          top: Platform.OS === 'ios' ? topOffset + 34 : topOffset,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.toastCard, { borderColor: accent + '60' }]}>
        <View style={[styles.leftAccentStrip, { backgroundColor: accent }]} />

        <View style={styles.avatarContainer}>
          <Image
            source={require('../../../assets/perfilANIMA.png')}
            style={[styles.animaAvatar, { borderColor: accent }]}
            resizeMode="cover"
          />
          {toast.emoji ? (
            <View style={styles.emojiMiniBubble}>
              <Text style={styles.emojiMiniText}>{toast.emoji}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <Text style={styles.animaTag}>ANIMA</Text>
            <View style={[styles.dotSeparator, { backgroundColor: accent }]} />
            <Text style={[styles.toastTitle, { color: accent }]} numberOfLines={1}>
              {toast.title}
            </Text>
          </View>
          <Text style={styles.toastMessage} numberOfLines={3}>
            {toast.message}
          </Text>
        </View>

        <TouchableOpacity
          onPress={dismiss}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  hostWrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 99999,
    elevation: 999,
  },
  toastCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  leftAccentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
    marginLeft: 4,
  },
  animaAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: '#F1F5F9',
  },
  emojiMiniBubble: {
    position: 'absolute',
    bottom: -3,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  emojiMiniText: {
    fontSize: 11,
  },
  textColumn: {
    flex: 1,
    paddingRight: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  animaTag: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.coffeeDeep,
    letterSpacing: 0.3,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 6,
  },
  toastTitle: {
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  toastMessage: {
    fontSize: 12.5,
    color: colors.textPrimary,
    lineHeight: 17.5,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 2,
  },
});
