import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Video, ResizeMode, Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface AnimaVideoSplashProps {
  onFinish: () => void;
}

// Native video resolution is 478 x 534 (Aspect ratio ~0.895)
const VIDEO_ASPECT_RATIO = 478 / 534;

export const AnimaVideoSplash: React.FC<AnimaVideoSplashProps> = ({ onFinish }) => {
  const { width: windowWidth } = useWindowDimensions();
  const videoRef = useRef<Video>(null);
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const hasFinished = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Size calculation: centered, balanced, maintaining 478x534 proportions
  const videoWidth = Math.min(Math.round(windowWidth * 0.70), 260);
  const videoHeight = Math.round(videoWidth / VIDEO_ASPECT_RATIO); // ~290px

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
          useNativeDriver: Platform.OS !== 'web',
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
    }, Platform.OS === 'web' ? 3500 : 6500);

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
      useNativeDriver: Platform.OS !== 'web',
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
      {/* Web-specific CSS rule to guarantee the video tag stays contained and centered within its box */}
      {Platform.OS === 'web' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #anima-splash-box video,
              .anima-splash-video video {
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                max-height: 100% !important;
                object-fit: contain !important;
                display: block !important;
                margin: 0 auto !important;
              }
            `,
          }}
        />
      )}

      {/* Centered Video Wrapper */}
      <Animated.View
        nativeID="anima-splash-box"
        style={[
          styles.videoWrapper,
          {
            width: videoWidth,
            height: videoHeight,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Video
          ref={videoRef}
          source={require('../../../assets/animacion ANIMA.mp4')}
          style={styles.video}
          videoStyle={styles.videoElement}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={true}
          isLooping={false}
          isMuted={Platform.OS === 'web'}
          volume={Platform.OS === 'web' ? 0 : 1.0}
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

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoElement: {
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
    zIndex: 10001,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B6779',
  },
});
