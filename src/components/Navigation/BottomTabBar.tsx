import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AnimaMascot } from '../Anima/AnimaMascot';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserTestAndStreak } from '../../services/psychologyTestService';
import { TestResult } from '../../types/psychologyTest';

export type TabId =
  | 'principal'
  | 'blog'
  | 'anima'
  | 'racha'
  | 'buscar'
  | 'crear'
  | 'ayuda'
  | 'mas';

interface TabItem {
  id: TabId;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  isMascot?: boolean;
  isStreak?: boolean;
}

interface BottomTabBarProps {
  activeTab?: TabId;
  onTabPress?: (tabId: TabId) => void;
  onOpenStreakModal?: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab = 'principal',
  onTabPress,
  onOpenStreakModal,
}) => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [streakPressedHighlight, setStreakPressedHighlight] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToUserTestAndStreak(user?.id, (res) => {
      setTestResult(res);
    });
    return () => unsubscribe();
  }, [user?.id]);

  const hasActiveStreak = Boolean(testResult?.streakState?.isActive);
  const completedDays = testResult?.streakState?.completedDaysCount || 0;

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
      label: 'Anima',
      isMascot: true,
    },
    ...(hasActiveStreak
      ? [
          {
            id: 'racha' as TabId,
            label: 'Actividades',
            icon: 'sparkles-outline' as const,
            activeIcon: 'sparkles' as const,
            isStreak: true,
          },
        ]
      : []),
    {
      id: 'buscar',
      label: 'Buscar',
      icon: 'search-outline',
      activeIcon: 'search',
    },
    {
      id: 'mas',
      label: 'Más...',
      icon: 'ellipsis-horizontal-circle-outline',
      activeIcon: 'ellipsis-horizontal-circle',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isCurrentActive = activeTab === tab.id || (tab.isStreak && streakPressedHighlight);
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              activeOpacity={0.75}
              onPress={() => {
                if (tab.isStreak) {
                  setStreakPressedHighlight(true);
                  setTimeout(() => setStreakPressedHighlight(false), 900);
                  if (onOpenStreakModal) {
                    onOpenStreakModal();
                  }
                  return;
                }
                if (onTabPress) {
                  onTabPress(tab.id);
                }
              }}
            >
              <View style={styles.iconContainer}>
                {tab.isMascot ? (
                  <View
                    style={[
                      styles.mascotTabWrapper,
                      isCurrentActive && styles.mascotTabWrapperActive,
                    ]}
                  >
                    <AnimaMascot size="sm" variant="profile" animated={false} />
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
                  tab.isMascot &&
                    isCurrentActive && { color: colors.coffeePrimary, fontWeight: '800' },
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
    height: 48,
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
    height: 28,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotTabWrapperActive: {
    backgroundColor: '#E1EAEF',
  },
  streakTabButtonOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: 12,
    marginHorizontal: 3,
    paddingVertical: 3,
  },
  streakFireIconClean: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
