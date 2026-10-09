import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

export type MascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type MascotVariant = 'profile' | 'full';

interface AnimaMascotProps {
  size?: MascotSize;
  variant?: MascotVariant;
  animated?: boolean;
  isThinking?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZE_MAP: Record<MascotSize, number> = {
  xs: 24,
  sm: 36,
  md: 60,
  lg: 100,
  xl: 140,
};

export const AnimaMascot: React.FC<AnimaMascotProps> = ({
  size = 'md',
  variant = 'profile',
  animated = false,
  isThinking = false,
  style,
}) => {
  const dimension = SIZE_MAP[size];
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) {
      floatAnim.setValue(0);
      return;
    }

    // Gentle floating loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 4,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();

    return () => {
      floatLoop.stop();
    };
  }, [animated]);

  useEffect(() => {
    if (isThinking) {
      // Pulse animation when generating response
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.96,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isThinking]);

  return (
    <View style={[styles.wrapper, { width: dimension, height: dimension }, style]}>
      {/* Soft ambient glow ring behind mascot */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: dimension * 1.08,
            height: dimension * 1.08,
            borderRadius: (dimension * 1.08) / 2,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Mascot Image with floating translate */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            width: dimension,
            height: dimension,
            transform: [
              { translateY: animated ? floatAnim : 0 },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <Image
          source={
            variant === 'full'
              ? require('../../../assets/Mascota axolote kawaii ANIMA.png')
              : require('../../../assets/perfilANIMA.png')
          }
          style={[
            styles.image,
            variant === 'profile' && { borderRadius: dimension / 2 },
          ]}
          resizeMode="contain"
          accessibilityLabel="Mascota ANIMA"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: '#E1EAEF',
    opacity: 0.7,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
