import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

interface MoreMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenPsychologists: () => void;
  onOpenRules: () => void;
  onOpenSupport: () => void;
  onRequireAuth: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  visible,
  onClose,
  onOpenProfile,
  onOpenPsychologists,
  onOpenRules,
  onOpenSupport,
  onRequireAuth,
}) => {
  const { user, logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const menuItems = [
    {
      id: 'perfil',
      label: 'Mi Perfil',
      icon: 'person-outline' as const,
      color: colors.coffeeDark,
      onPress: () => {
        onClose();
        if (user) {
          onOpenProfile();
        } else {
          onRequireAuth();
        }
      },
    },
    {
      id: 'psicologos',
      label: 'Especialistas y Psicólogos',
      icon: 'people-outline' as const,
      color: colors.coffeeDark,
      onPress: () => {
        onClose();
        onOpenPsychologists();
      },
    },
    {
      id: 'reglas',
      label: 'Reglas "Entre Nosotros"',
      icon: 'shield-checkmark-outline' as const,
      color: colors.coffeeDark,
      onPress: () => {
        onClose();
        onOpenRules();
      },
    },
    {
      id: 'ayuda',
      label: 'Necesito ayuda',
      icon: 'heart-circle-outline' as const,
      color: colors.coffeePrimary,
      onPress: () => {
        onClose();
        onOpenSupport();
      },
    },
    ...(user
      ? [
          {
            id: 'logout',
            label: 'Cerrar Sesión',
            icon: 'log-out-outline' as const,
            color: '#DC2626',
            isDanger: true,
            onPress: async () => {
              onClose();
              await logout();
            },
          },
        ]
      : [
          {
            id: 'login',
            label: 'Iniciar Sesión / Unirse',
            icon: 'log-in-outline' as const,
            color: colors.coffeePrimary,
            onPress: () => {
              onClose();
              onRequireAuth();
            },
          },
        ]),
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop overlay */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </Pressable>

        {/* Bottom Sheet Menu */}
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Title */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Más opciones</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Options list */}
          <View style={styles.optionsList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionRow,
                  index === menuItems.length - 1 && styles.lastOptionRow,
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconCircle,
                    item.isDanger && { backgroundColor: '#FEE2E2' },
                  ]}
                >
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    { color: item.color },
                    item.isDanger && { fontWeight: '700' },
                  ]}
                >
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.borderLight}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 10,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6E2E9',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    paddingTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F7',
  },
  lastOptionRow: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F6F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
