import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

import { AnimaMascot } from '../Anima/AnimaMascot';

export type TabId = 'principal' | 'blog' | 'anima' | 'buscar' | 'crear' | 'ayuda';

interface TabItem {
  id: TabId;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  isMascot?: boolean;
}

interface BottomTabBarProps {
  activeTab?: TabId;
  onTabPress?: (tabId: TabId) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab = 'principal',
  onTabPress,
}) => {
  const tabs: TabItem[] = [
    {
      id: 'principal',
      label: 'Principal',
      icon: 'home-outline',
      activeIcon: 'home',
    },
    {
      id: 'blog',
      label: 'Blog',
      icon: 'newspaper-outline',
      activeIcon: 'newspaper',
    },
    {
      id: 'anima',
      label: 'ANIMA',
      isMascot: true,
    },
    {
      id: 'buscar',
      label: 'Buscar',
      icon: 'search-outline',
      activeIcon: 'search',
    },
    {
      id: 'crear',
      label: 'Crear',
      icon: 'add-circle-outline',
      activeIcon: 'add-circle',
    },
    {
      id: 'ayuda',
      label: '¿Ayuda?',
      icon: 'heart-circle-outline',
      activeIcon: 'heart-circle',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isCurrentActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => onTabPress && onTabPress(tab.id)}
            >
              <View style={styles.iconContainer}>
                {tab.isMascot ? (
                  <View style={[styles.mascotTabWrapper, isCurrentActive && styles.mascotTabWrapperActive]}>
                    <AnimaMascot size="xs" animated={isCurrentActive} />
                  </View>
                ) : (
                  <Ionicons
                    name={isCurrentActive ? tab.activeIcon! : tab.icon!}
                    size={22}
                    color={isCurrentActive ? colors.coffeePrimary : colors.textSecondary}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isCurrentActive ? styles.tabLabelActive : styles.tabLabelInactive,
                  tab.isMascot && isCurrentActive && { color: colors.coffeePrimary, fontWeight: '800' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 46,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: colors.coffeePrimary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  mascotTabWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotTabWrapperActive: {
    backgroundColor: '#E1EAEF',
    transform: [{ scale: 1.1 }],
  },
});
