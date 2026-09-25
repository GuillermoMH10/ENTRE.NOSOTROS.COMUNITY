import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';

interface AppHeaderProps {
  onOpenMenu: () => void;
  onJoinPress: () => void;
  onProfilePress: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenMenu,
  onJoinPress,
  onProfilePress,
}) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Absolute Centered Logo to ensure 100% precision */}
        <View style={styles.centerLogoWrapper} pointerEvents="none">
          <Image
            source={require('../../../assets/logoappE.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo Entre Nosotros"
          />
        </View>

        {/* Left: Hamburger Menu Button (No background) */}
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={onOpenMenu}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Abrir menú de navegación"
          accessibilityRole="button"
        >
          <Ionicons name="menu-outline" size={30} color={colors.coffeeDark} />
        </TouchableOpacity>

        {/* Right: Circular Avatar with Profile Identifier Badge or Unirse Button */}
        {user ? (
          <TouchableOpacity
            style={styles.profileAvatarButton}
            onPress={onProfilePress}
            activeOpacity={0.8}
            accessibilityLabel="Ver perfil de usuario"
            accessibilityRole="button"
          >
            <View style={styles.avatarRing}>
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.userAvatarImage}
                resizeMode="cover"
              />
            </View>
            {/* Profile mini-badge identifier */}
            <View style={styles.profileBadge}>
              <Ionicons name="person" size={9} color={colors.white} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={onJoinPress}
            activeOpacity={0.85}
            accessibilityLabel="Unirse a Entre Nosotros"
            accessibilityRole="button"
          >
            <Text style={styles.joinButtonText}>Unirse</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 6 : 8,
    paddingBottom: 8,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    position: 'relative',
  },
  centerLogoWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 185,
    height: 46,
  },
  hamburgerButton: {
    width: 38,
    height: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  joinButton: {
    backgroundColor: colors.coffeePrimary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: spacing.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.coffeePrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  joinButtonText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  profileAvatarButton: {
    position: 'relative',
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.8,
    borderColor: colors.coffeePrimary,
    padding: 1.5,
    backgroundColor: colors.white,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  userAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  profileBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: colors.coffeePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
