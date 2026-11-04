import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface PostMediaViewProps {
  mediaUrls: string[];
  onMediaPress: (index: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_SINGLE_MEDIA_HEIGHT = 460;
const MIN_SINGLE_MEDIA_HEIGHT = 200;

/**
 * Checks whether a given media URL is a video
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('.mp4') ||
    lower.includes('.mov') ||
    lower.includes('.webm') ||
    lower.includes('.m4v') ||
    lower.includes('video/') ||
    lower.includes('video%2f') ||
    lower.includes('media_') && lower.includes('.mp4') ||
    lower.startsWith('data:video')
  );
}

export const PostMediaView: React.FC<PostMediaViewProps> = ({
  mediaUrls,
  onMediaPress,
}) => {
  if (!mediaUrls || mediaUrls.length === 0) return null;

  const count = mediaUrls.length;

  // Track dynamic aspect ratio for single image
  const [singleAspectRatio, setSingleAspectRatio] = useState<number>(4 / 3);
  const [containerWidth, setContainerWidth] = useState<number>(
    Math.min(SCREEN_WIDTH - 32, 620)
  );

  // Single video playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    // Enable audio playback mode for clear sound on iOS and Android
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (count === 1 && !isVideoUrl(mediaUrls[0])) {
      Image.getSize(
        mediaUrls[0],
        (width, height) => {
          if (width > 0 && height > 0) {
            const ratio = width / height;
            // Allow real natural proportions (from tall portrait 0.55 to wide landscape 2.4)
            const clamped = Math.max(0.55, Math.min(ratio, 2.4));
            setSingleAspectRatio(clamped);
          }
        },
        () => {}
      );
    }
  }, [mediaUrls, count]);

  // SINGLE MEDIA (Image or Video)
  if (count === 1) {
    const url = mediaUrls[0];
    const isVideo = isVideoUrl(url);

    if (isVideo) {
      return (
        <View
          style={[
            styles.singleContainer,
            {
              aspectRatio: 16 / 9,
              maxHeight: MAX_SINGLE_MEDIA_HEIGHT,
              minHeight: MIN_SINGLE_MEDIA_HEIGHT,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.videoWrapper}
            activeOpacity={0.95}
            onPress={() => setIsPlaying((prev) => !prev)}
          >
            <Video
              ref={videoRef}
              source={{ uri: url }}
              style={styles.mediaFill}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls={false}
              isLooping
              shouldPlay={isPlaying}
              isMuted={isMuted}
              volume={1.0}
            />

            {/* Centered Play Button when paused */}
            {!isPlaying && (
              <View style={styles.playButtonOverlay}>
                <Ionicons name="play" size={32} color={colors.white} style={{ marginLeft: 3 }} />
              </View>
            )}

            {/* Top Right Controls: Mute & Fullscreen */}
            <View style={styles.videoControlsOverlay}>
              <TouchableOpacity
                style={styles.controlCircleBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  setIsMuted((prev) => !prev);
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={16}
                  color={colors.white}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlCircleBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  onMediaPress(0);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="expand" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    // Single Image:
    // - Horizontal / Square (aspectRatio >= 1): full width at real aspect ratio
    // - Vertical / Portrait (aspectRatio < 1): compact grid-column size adjusted to its exact real aspect ratio
    const isVertical = singleAspectRatio < 0.98;
    let verticalBoxStyle: { width: number; height: number } | null = null;

    if (isVertical && containerWidth > 0) {
      const maxGridColWidth = Math.min(containerWidth * 0.49, 275);
      const maxGridColHeight = 340;
      let w = maxGridColWidth;
      let h = w / singleAspectRatio;
      if (h > maxGridColHeight) {
        h = maxGridColHeight;
        w = h * singleAspectRatio;
      }
      verticalBoxStyle = {
        width: Math.round(w),
        height: Math.round(h),
      };
    }

    return (
      <View
        style={styles.singleMediaRowWrapper}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && Math.abs(w - containerWidth) > 2) {
            setContainerWidth(w);
          }
        }}
      >
        <TouchableOpacity
          style={[
            styles.singleContainer,
            isVertical && verticalBoxStyle
              ? {
                  width: verticalBoxStyle.width,
                  height: verticalBoxStyle.height,
                }
              : {
                  width: '100%',
                  aspectRatio: singleAspectRatio,
                  minHeight: MIN_SINGLE_MEDIA_HEIGHT,
                },
          ]}
          activeOpacity={0.92}
          onPress={() => onMediaPress(0)}
        >
          <Image
            source={{ uri: url }}
            style={styles.mediaFill}
            resizeMode="cover"
            onLoad={(e) => {
              const src = e?.nativeEvent?.source;
              const target = (e?.nativeEvent as any)?.target;
              const w = src?.width || target?.naturalWidth;
              const h = src?.height || target?.naturalHeight;
              if (w && h && w > 0 && h > 0) {
                const ratio = w / h;
                setSingleAspectRatio(Math.max(0.45, Math.min(ratio, 2.4)));
              }
            }}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // 2 MEDIA (Side-by-side)
  if (count === 2) {
    return (
      <View style={styles.twoMediaContainer}>
        {mediaUrls.map((url, idx) => {
          const isVideo = isVideoUrl(url);
          return (
            <TouchableOpacity
              key={idx}
              style={styles.halfMediaWrapper}
              activeOpacity={0.92}
              onPress={() => onMediaPress(idx)}
            >
              {isVideo ? (
                <View style={styles.videoWrapper}>
                  <Video
                    source={{ uri: url }}
                    style={styles.mediaFill}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls={false}
                    isLooping
                    shouldPlay={false}
                  />
                  <View style={styles.playButtonMini}>
                    <Ionicons name="play" size={20} color={colors.white} style={{ marginLeft: 2 }} />
                  </View>
                </View>
              ) : (
                <Image
                  source={{ uri: url }}
                  style={styles.mediaFill}
                  resizeMode="cover"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // 3 MEDIA (1 large left + 2 stacked right)
  return (
    <View style={styles.threeMediaContainer}>
      <TouchableOpacity
        style={styles.threeLeftCol}
        activeOpacity={0.92}
        onPress={() => onMediaPress(0)}
      >
        {isVideoUrl(mediaUrls[0]) ? (
          <View style={styles.videoWrapper}>
            <Video
              source={{ uri: mediaUrls[0] }}
              style={styles.mediaFill}
              resizeMode={ResizeMode.COVER}
              useNativeControls={false}
              isLooping
              shouldPlay={false}
            />
            <View style={styles.playButtonMini}>
              <Ionicons name="play" size={22} color={colors.white} style={{ marginLeft: 2 }} />
            </View>
          </View>
        ) : (
          <Image
            source={{ uri: mediaUrls[0] }}
            style={styles.mediaFill}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
      <View style={styles.colGap} />
      <View style={styles.threeRightCol}>
        {mediaUrls.slice(1, 3).map((url, i) => {
          const idx = i + 1;
          const isVideo = isVideoUrl(url);
          return (
            <TouchableOpacity
              key={idx}
              style={styles.threeStackedItem}
              activeOpacity={0.92}
              onPress={() => onMediaPress(idx)}
            >
              {isVideo ? (
                <View style={styles.videoWrapper}>
                  <Video
                    source={{ uri: url }}
                    style={styles.mediaFill}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls={false}
                    isLooping
                    shouldPlay={false}
                  />
                  <View style={styles.playButtonMini}>
                    <Ionicons name="play" size={16} color={colors.white} style={{ marginLeft: 2 }} />
                  </View>
                </View>
              ) : (
                <Image
                  source={{ uri: url }}
                  style={styles.mediaFill}
                  resizeMode="cover"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  singleMediaRowWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  singleContainer: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginTop: 8,
    marginBottom: 4,
  },
  twoMediaContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 260,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
    gap: 6,
  },
  halfMediaWrapper: {
    flex: 1,
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    position: 'relative',
  },
  threeMediaContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 280,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  threeLeftCol: {
    flex: 1.2,
    height: '100%',
    backgroundColor: '#1E1E1E',
    position: 'relative',
  },
  colGap: {
    width: 4,
  },
  threeRightCol: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 4,
  },
  threeStackedItem: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    position: 'relative',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaFill: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  playButtonMini: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  videoControlsOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  controlCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
