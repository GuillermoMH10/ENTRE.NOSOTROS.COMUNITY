import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme/colors';

interface AppSplashScreenProps {
  onFinish: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Entrance animation: fade in and subtle scale up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // After display duration, fade out smoothly
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 1400);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, containerOpacity, onFinish]);

  return (
    <Animated.View
      pointerEvents={isFadingOut ? 'none' : 'auto'}
      style={[styles.container, { opacity: containerOpacity }]}
    >
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../../assets/splash-icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="Logo Entre Nosotros"
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF7F5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  logoImage: {
    width: Math.min(SCREEN_WIDTH * 0.65, 260),
    height: Math.min(SCREEN_WIDTH * 0.65, 260),
    borderRadius: Math.min(SCREEN_WIDTH * 0.65, 260) / 2,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
});
