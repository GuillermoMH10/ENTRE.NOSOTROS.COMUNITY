import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimaMascot } from '../Anima/AnimaMascot';
import { colors } from '../../theme/colors';

interface StandDynamicBannerCardProps {
  onOpenDynamic?: () => void;
}

export const StandDynamicBannerCard: React.FC<StandDynamicBannerCardProps> = ({ onOpenDynamic }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.leftContent}>
        <Text style={styles.title}>¿Estás de visita en nuestro stand?</Text>
        <Text style={styles.subtitle}>Participa en la dinámica</Text>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onOpenDynamic}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>Participar</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.white} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      <View style={styles.mascotContainer}>
        <AnimaMascot size="md" animated={true} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(34, 62, 82, 0.08)',
      },
    }),
  },
  leftContent: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 12,
  },
  actionBtn: {
    backgroundColor: colors.coffeePrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        cursor: 'pointer',
      },
    }),
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
});
