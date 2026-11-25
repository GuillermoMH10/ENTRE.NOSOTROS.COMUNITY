import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface StandDynamicBannerCardProps {
  onOpenDynamic?: () => void;
}

export const StandDynamicBannerCard: React.FC<StandDynamicBannerCardProps> = ({ onOpenDynamic }) => {
  return (
    <View style={styles.cardContainer}>
      {/* Top Banner Tag */}
      <View style={styles.tagRow}>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={12} color="#D97706" style={{ marginRight: 4 }} />
          <Text style={styles.badgeText}>STAND EN VIVO · CONOCE ENTRE NOSOTROS</Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>100 Actividades</Text>
        </View>
      </View>

      {/* Main Title */}
      <Text style={styles.title}>¿Estás de visita en nuestro Stand?</Text>

      {/* Subtitle / Explanation */}
      <Text style={styles.description}>
        ¡No necesitas registrarte! Toca el botón para recibir una actividad o reto al azar, comparte tu frase, consejo o foto, y tu aporte saldrá en vivo en este muro.
      </Text>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onOpenDynamic}
        activeOpacity={0.85}
      >
        <Ionicons name="dice-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.actionBtnText}>Participar en la Dinámica</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFBEB', // Warm amber tint
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    ...Platform.select({
      ios: {
        shadowColor: '#D97706',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 3px 10px rgba(217, 119, 6, 0.12)',
      },
    }),
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  countPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#78350F',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 14,
  },
  actionBtn: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#B45309',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(180, 83, 9, 0.25)',
        cursor: 'pointer',
      },
    }),
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
