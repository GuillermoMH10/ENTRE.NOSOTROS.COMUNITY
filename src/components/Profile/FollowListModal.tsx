import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import {
  UserFollowItem,
  subscribeUserFollowList,
  subscribeToUserFollowing,
  toggleFollowUser,
} from '../../services/postsService';

export type FollowTabType = 'following' | 'followers';

interface FollowListModalProps {
  visible: boolean;
  userId: string | null;
  username?: string;
  initialTab?: FollowTabType;
  onClose: () => void;
  onUserPress: (userId: string, username: string, avatarUrl: string) => void;
  onRequireAuth: () => void;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  visible,
  userId,
  username = 'Usuario',
  initialTab = 'following',
  onClose,
  onUserPress,
  onRequireAuth,
}) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<FollowTabType>(initialTab);
  const [usersList, setUsersList] = useState<UserFollowItem[]>([]);
  const [myFollowingIds, setMyFollowingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Update active tab when initialTab changes
  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      setSearchQuery('');
    }
  }, [visible, initialTab]);

  // Subscribe to follow list of the viewed user
  useEffect(() => {
    if (!visible || !userId) {
      setUsersList([]);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeUserFollowList(userId, activeTab, (users) => {
      setUsersList(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [visible, userId, activeTab]);

  // Subscribe to current logged user's following list (to show +Seguir / Siguiendo state)
  useEffect(() => {
    if (!visible || !currentUser) {
      setMyFollowingIds([]);
      return;
    }

    const unsubscribe = subscribeToUserFollowing(currentUser.id, (ids) => {
      setMyFollowingIds(ids);
    });

    return () => unsubscribe();
  }, [visible, currentUser?.id]);

  if (!visible || !userId) return null;

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return usersList;
    const q = searchQuery.trim().toLowerCase();
    return usersList.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.bio && u.bio.toLowerCase().includes(q))
    );
  }, [usersList, searchQuery]);

  // Handle follow / unfollow toggle
  const handleToggleFollowItem = async (targetId: string) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    // Optimistic toggle
    const isCurrentlyFollowing = myFollowingIds.includes(targetId);
    if (isCurrentlyFollowing) {
      setMyFollowingIds((prev) => prev.filter((id) => id !== targetId));
    } else {
      setMyFollowingIds((prev) => [...prev, targetId]);
    }

    await toggleFollowUser(currentUser.id, targetId);
  };

  const handleSelectUser = (item: UserFollowItem) => {
    onClose();
    onUserPress(item.id, item.username, item.avatarUrl);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.rootContainer}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.navBackBtn}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.coffeeDark} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>@{username}</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Tab Selector: Seguidos vs Seguidores */}
        <View style={styles.tabSelectorRow}>
          <TouchableOpacity
            style={[
              styles.tabSelectorBtn,
              activeTab === 'following' && styles.tabSelectorBtnActive,
            ]}
            onPress={() => setActiveTab('following')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabSelectorText,
                activeTab === 'following' && styles.tabSelectorTextActive,
              ]}
            >
              Seguidos {activeTab === 'following' ? `(${usersList.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabSelectorBtn,
              activeTab === 'followers' && styles.tabSelectorBtnActive,
            ]}
            onPress={() => setActiveTab('followers')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabSelectorText,
                activeTab === 'followers' && styles.tabSelectorTextActive,
              ]}
            >
              Seguidores {activeTab === 'followers' ? `(${usersList.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <Ionicons
            name="search-outline"
            size={16}
            color={colors.textMuted}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar en ${activeTab === 'following' ? 'seguidos' : 'seguidores'}...`}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* User List Body */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? 'No se encontraron usuarios'
                : activeTab === 'following'
                ? 'Aún no sigue a nadie'
                : 'Aún no tiene seguidores'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim()
                ? 'Intenta con otro nombre de usuario.'
                : activeTab === 'following'
                ? 'Los usuarios a los que siga aparecerán listados aquí.'
                : 'Las personas que le sigan aparecerán listadas aquí.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isMe = Boolean(currentUser && currentUser.id === item.id);
              const isFollowingThisUser = myFollowingIds.includes(item.id);

              return (
                <View style={styles.userRow}>
                  {/* Avatar & Username */}
                  <TouchableOpacity
                    style={styles.userTouchable}
                    onPress={() => handleSelectUser(item)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: item.avatarUrl }}
                      style={styles.userAvatar}
                      resizeMode="cover"
                    />
                    <View style={styles.userInfo}>
                      <Text style={styles.usernameText}>@{item.username}</Text>
                      {item.bio ? (
                        <Text style={styles.userBioText} numberOfLines={1}>
                          {item.bio}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>

                  {/* Follow / Following Button */}
                  {!isMe && (
                    <TouchableOpacity
                      style={[
                        styles.followBtn,
                        isFollowingThisUser && styles.followingBtn,
                      ]}
                      onPress={() => handleToggleFollowItem(item.id)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={isFollowingThisUser ? "checkmark" : "add"}
                        size={13}
                        color={isFollowingThisUser ? colors.textSecondary : colors.primary}
                        style={{ marginRight: 2 }}
                      />
                      <Text
                        style={[
                          styles.followBtnText,
                          isFollowingThisUser && styles.followingBtnText,
                        ]}
                      >
                        {isFollowingThisUser ? 'Siguiendo' : 'Seguir'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 32 : 44,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
    zIndex: 10,
  },
  navBackBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.coffeeDeep,
    letterSpacing: -0.2,
  },
  tabSelectorRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  tabSelectorBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelectorBtnActive: {
    borderBottomColor: colors.primary,
  },
  tabSelectorText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabSelectorTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 40,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  userTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  usernameText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginBottom: 2,
  },
  userBioText: {
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  followingBtn: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderLight,
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  followingBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.coffeeDeep,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
