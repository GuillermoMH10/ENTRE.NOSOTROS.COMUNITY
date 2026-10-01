import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

import { TabId } from '../Navigation/BottomTabBar';
import { useAuth } from '../../context/AuthContext';

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (tabId: TabId) => void;
  onOpenProfile?: () => void;
  onOpenPsychologists?: () => void;
  onOpenRules?: () => void;
  onRequireAuth?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.72, 270);

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  visible,
  onClose,
  onNavigate,
  onOpenProfile,
  onOpenPsychologists,
  onOpenRules,
  onRequireAuth,
}) => {
  const { user, logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7,
          tension: 80,
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
          toValue: -DRAWER_WIDTH,
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

  // Main 4 accesses
  const mainNavItems = [
    { id: 'principal' as const, label: 'Principal', icon: 'home-outline' as const },
    { id: 'blog' as const, label: 'Blog', icon: 'newspaper-outline' as const },
    { id: 'buscar' as const, label: 'Buscar', icon: 'search-outline' as const },
    { id: 'crear' as const, label: 'Crear', icon: 'add-circle-outline' as const },
  ];

  // Secondary accesses
  const secondaryNavItems = [
    { id: 'perfil', label: 'Perfil', icon: 'person-outline' as const },
    { id: 'psicologos', label: 'Psicólogos', icon: 'heart-outline' as const },
    { id: 'reglas', label: 'Reglas "Entre Nosotros"', icon: 'shield-checkmark-outline' as const },
    { id: 'necesito_ayuda', label: 'Necesito ayuda', icon: 'help-buoy-outline' as const },
    ...(user
      ? [{ id: 'logout', label: 'Cerrar Sesión', icon: 'log-out-outline' as const, isDanger: true }]
      : [{ id: 'login', label: 'Iniciar Sesión', icon: 'log-in-outline' as const, isAccent: true }]),
  ];

  const handleMainItemPress = (item: typeof mainNavItems[number]) => {
    onClose();
    if (onNavigate) {
      onNavigate(item.id);
    }
  };

  const handleSecondaryItemPress = async (id: string) => {
    onClose();
    if (id === 'perfil' && onOpenProfile) {
      onOpenProfile();
    } else if (id === 'psicologos' && onOpenPsychologists) {
      onOpenPsychologists();
    } else if (id === 'reglas' && onOpenRules) {
      onOpenRules();
    } else if (id === 'logout') {
      await logout();
    } else if (id === 'login' && onRequireAuth) {
      onRequireAuth();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Backdrop overlay - Click outside to close */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </Pressable>

        {/* Sliding Drawer Container */}
        <Animated.View
          style={[
            styles.drawerContainer,
            { transform: [{ translateX: slideAnim }], width: DRAWER_WIDTH },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Drawer Header with Perfectly Centered Logo (No X button) */}
            <View style={styles.drawerHeader}>
              <Image
                source={require('../../../assets/logoappE.png')}
                style={styles.drawerLogo}
                resizeMode="contain"
                accessibilityLabel="Logo Entre Nosotros"
              />
            </View>

            {/* Content List */}
            <ScrollView
              style={styles.menuScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuScrollContent}
            >
              {/* SECTION 1: 4 Main Accesses */}
              <View style={styles.section}>
                {mainNavItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.compactMenuItem}
                    activeOpacity={0.6}
                    onPress={() => handleMainItemPress(item)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={colors.coffeeDark}
                      style={styles.itemIcon}
                    />
                    <Text style={styles.itemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* SEPARATOR LINE */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
              </View>

              {/* SECTION 2: Secondary items */}
              <View style={styles.section}>
                {secondaryNavItems.map((item) => {
                  const iconColor = (item as any).isDanger
                    ? '#DC2626'
                    : (item as any).isAccent
                    ? colors.coffeePrimary
                    : colors.coffeeDark;
                  const textColor = (item as any).isDanger
                    ? '#DC2626'
                    : (item as any).isAccent
                    ? colors.coffeePrimary
                    : colors.coffeeDark;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.compactMenuItem,
                        (item as any).isDanger && { marginTop: 6 },
                      ]}
                      activeOpacity={0.6}
                      onPress={() => handleSecondaryItemPress(item.id)}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={iconColor}
                        style={styles.itemIcon}
                      />
                      <Text
                        style={[
                          styles.itemText,
                          { color: textColor },
                          (item as any).isDanger && { fontWeight: '700' },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* COMPACT FOOTER */}
            <View style={styles.drawerFooter}>
              <View style={styles.footerBorder} />
              <Text style={styles.footerText}>
                Todos los derechos reservados
              </Text>
              <Text style={styles.footerBrandText}>
                "Entre Nosotros 2026"
              </Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backdrop,
  },
  drawerContainer: {
    height: '100%',
    backgroundColor: colors.white,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 16,
    zIndex: 999,
  },
  safeArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  drawerHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  drawerLogo: {
    width: 135,
    height: 36,
  },
  menuScroll: {
    flex: 1,
  },
  menuScrollContent: {
    paddingVertical: 8,
  },
  section: {
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  compactMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    backgroundColor: 'transparent', // No background color
  },
  itemIcon: {
    marginRight: 12,
    width: 22,
    textAlign: 'center',
  },
  itemText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  dividerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dividerLine: {
    height: 1,
    backgroundColor: colors.divider,
    width: '100%',
  },
  drawerFooter: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  footerText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  footerBrandText: {
    fontSize: 11.5,
    color: colors.coffeePrimary,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 2,
  },
});
