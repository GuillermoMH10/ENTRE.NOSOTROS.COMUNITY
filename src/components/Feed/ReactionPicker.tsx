import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Pressable,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { colors } from '../../theme/colors';
import { ReactionType, REACTIONS_MAP } from '../../types/post';

interface ReactionPickerProps {
  visible: boolean;
  position?: { x: number; y: number };
  onSelectReaction: (type: ReactionType) => void;
  onClose: () => void;
}

const REACTIONS_LIST: ReactionType[] = ['teAbrazo', 'teEscucho', 'noEstasSolo', 'fuerza'];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  visible,
  position,
  onSelectReaction,
  onClose,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(15)).current;

  // Individual item scale animations for staggered lively feel
  const itemAnims = useRef(REACTIONS_LIST.map(() => new Animated.Value(0.6))).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.stagger(
          35,
          itemAnims.map((anim) =>
            Animated.spring(anim, {
              toValue: 1,
              friction: 4,
              tension: 110,
              useNativeDriver: true,
            })
          )
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.4,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 10,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  // Calculate coordinates so picker stays nicely inside screen bounds
  const pickerWidth = 310;
  const pickerHeight = 90;

  let top = position ? position.y - pickerHeight + 6 : windowHeight / 2 - pickerHeight / 2;
  // If too close to top of screen, show below button instead
  if (top < 60) {
    top = position ? position.y + 40 : 80;
  }
  // Ensure within vertical bounds
  top = Math.max(20, Math.min(top, windowHeight - pickerHeight - 20));

  let left = position ? position.x - 10 : 16;
  // Ensure within horizontal bounds
  left = Math.max(12, Math.min(left, windowWidth - pickerWidth - 12));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Full screen backdrop: tapping anywhere outside dismisses picker */}
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={[
              styles.container,
              {
                top,
                left,
                transform: [
                  { scale: scaleAnim },
                  { translateY: translateYAnim },
                ],
                opacity: opacityAnim,
              },
            ]}
          >
            {REACTIONS_LIST.map((type, index) => {
              const item = REACTIONS_MAP[type];
              return (
                <Animated.View
                  key={type}
                  style={{
                    transform: [{ scale: itemAnims[index] }],
                  }}
                >
                  <TouchableOpacity
                    style={styles.reactionItem}
                    activeOpacity={0.65}
                    onPress={() => {
                      onSelectReaction(type);
                      onClose();
                    }}
                  >
                    {/* Glow & Icon background circle */}
                    <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                      <Image
                        source={item.image}
                        style={styles.reactionImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={[styles.reactionLabel, { color: item.color }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#EFEAE6',
    // Rich floating shadow
    shadowColor: '#2D211A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 16,
    gap: 8,
  },
  reactionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  reactionImage: {
    width: 44,
    height: 44,
  },
  reactionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
});
