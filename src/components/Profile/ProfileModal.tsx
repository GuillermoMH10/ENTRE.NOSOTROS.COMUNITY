import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const { user, logout } = useAuth();

  if (!visible || !user) return null;

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.card}>
              {/* Top Header */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Mi Perfil</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color={colors.coffeeDark} />
                </TouchableOpacity>
              </View>

              {/* Avatar and Info */}
              <View style={styles.profileBody}>
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                  <View style={styles.onlineBadge} />
                </View>

                <Text style={styles.usernameText}>@{user.username}</Text>
                <Text style={styles.emailText}>{user.email}</Text>

                <View style={styles.infoBadge}>
                  <Ionicons name="sparkles" size={14} color={colors.coffeePrimary} />
                  <Text style={styles.infoBadgeText}>Miembro Activo</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={18} color="#C62828" style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  closeButton: {
    padding: 4,
  },
  profileBody: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderMedium,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2E7D32',
    borderWidth: 2,
    borderColor: colors.white,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginBottom: 2,
  },
  emailText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.coffeeLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 1,
    borderColor: colors.coffeeSoft,
  },
  infoBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.coffeePrimary,
    marginLeft: 5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDECEA',
    paddingVertical: 10,
    borderRadius: spacing.borderRadius.md,
  },
  logoutText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#C62828',
  },
});
