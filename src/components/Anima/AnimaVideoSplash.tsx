import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Animated,
  Platform,
} from 'react-native';
import { Video, ResizeMode, Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface AnimaVideoSplashProps {
  onFinish: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AnimaVideoSplash: React.FC<AnimaVideoSplashProps> = ({ onFinish }) => {
  const videoRef = useRef<Video>(null);
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const hasFinished = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Setup sound & auto-play
  useEffect(() => {
    let isMounted = true;

    const setupAudioAndPlay = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });

        // Entrance animation
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }).start();

        if (videoRef.current && isMounted) {
          await videoRef.current.playAsync().catch((err) => {
            console.log('Video auto-play handled:', err);
          });
          setIsPlaying(true);
        }
      } catch (err) {
        console.warn('Audio/Video initialization error:', err);
      }
    };

    setupAudioAndPlay();

    // Safety timeout: in case video duration is long or finish event doesn't fire
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 7000);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  const handleFinish = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;

    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.warn('Video playback error:', status.error);
        handleFinish();
      }
      return;
    }

    if (status.isPlaying) {
      setIsPlaying(true);
    }

    // When video completes, transition quickly
    if (status.didJustFinish) {
      handleFinish();
    }
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Centered Video Wrapper */}
      <Animated.View
        style={[
          styles.videoWrapper,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Video
          ref={videoRef}
          source={require('../../../assets/animacion ANIMA.mp4')}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={true}
          isLooping={false}
          isMuted={false}
          volume={1.0}
          useNativeControls={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      </Animated.View>

      {/* Top Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleFinish}
        activeOpacity={0.8}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityLabel="Saltar animación"
      >
        <Text style={styles.skipButtonText}>Saltar</Text>
        <Ionicons name="arrow-forward" size={14} color="#5A7486" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const VIDEO_SIZE = Math.min(SCREEN_WIDTH * 0.88, 380);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoWrapper: {
    width: VIDEO_SIZE,
    height: VIDEO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderRadius: 24,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F6F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1EAEF',
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B6779',
  },
});
