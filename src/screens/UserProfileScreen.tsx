import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Post } from '../types/post';
import { PostCard } from '../components/Feed/PostCard';
import { ImageViewerModal } from '../components/UI/ImageViewerModal';
import { fetchUserProfile, subscribeToUserPosts } from '../services/postsService';

interface UserProfileScreenProps {
  visible: boolean;
  userId: string | null;
  initialUsername?: string;
  initialAvatarUrl?: string;
  onClose: () => void;
  onCommentPress: (post: Post) => void;
  onRequireAuth: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  visible,
  userId,
  initialUsername,
  initialAvatarUrl,
  onClose,
  onCommentPress,
  onRequireAuth,
}) => {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Full-screen Image Viewer
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

  useEffect(() => {
    if (!visible || !userId) {
      setProfileData(null);
      setPosts([]);
      return;
    }

    setLoadingProfile(true);
    setLoadingPosts(true);

    // 1. Fetch User Data
    fetchUserProfile(userId).then((data) => {
      setProfileData(data);
      setLoadingProfile(false);
    });

    // 2. Real-time Subscription to this user's posts
    const unsubscribe = subscribeToUserPosts(userId, (userPosts) => {
      setPosts(userPosts);
      setLoadingPosts(false);
    });

    return () => unsubscribe();
  }, [visible, userId]);

  if (!visible || !userId) return null;

  const handleOpenImageViewer = (imagesList: string[], index = 0) => {
    setViewerImages(imagesList);
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const username = profileData?.username || initialUsername || 'Usuario';
  const avatarUrl =
    profileData?.avatarUrl ||
    initialAvatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
  const coverUrl = profileData?.coverPhotoUrl || null;
  const bio = profileData?.bio || '';
  const createdAt = profileData?.createdAt;
  const followingCount = profileData?.followingCount || 0;
  const followersCount = profileData?.followersCount || 0;

  const formatJoinedDate = (isoString?: string) => {
    if (!isoString) return 'Recientemente';
    try {
      const date = new Date(isoString);
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
      ];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return 'Recientemente';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.rootContainer}>
        {/* Full-screen Image Viewer */}
        <ImageViewerModal
          visible={viewerVisible}
          images={viewerImages}
          initialIndex={viewerIndex}
          onClose={() => setViewerVisible(false)}
        />

        {/* Top Sticky Navigation Bar */}
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

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
          {/* 1. Cover Photo Banner */}
          <View style={styles.coverBanner}>
            {coverUrl ? (
              <TouchableOpacity
                style={styles.coverTouchable}
                onPress={() => handleOpenImageViewer([coverUrl])}
                activeOpacity={0.9}
              >
                <Image source={{ uri: coverUrl }} style={styles.coverImage} resizeMode="cover" />
              </TouchableOpacity>
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="sparkles-outline" size={24} color="rgba(255, 255, 255, 0.4)" />
              </View>
            )}
          </View>

          {/* 2. Avatar & Profile Header Info */}
          <View style={styles.profileHeaderContent}>
            {/* Overlapping Avatar */}
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                onPress={() => handleOpenImageViewer([avatarUrl])}
                activeOpacity={0.85}
              >
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
              </TouchableOpacity>
            </View>

            {/* Username */}
            <Text style={styles.usernameText}>@{username}</Text>

            {/* Bio */}
            {bio ? (
              <View style={styles.bioContainer}>
                <Text style={styles.bioText}>{bio}</Text>
              </View>
            ) : null}

            {/* Joined Date */}
            <View style={styles.joinedRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textMuted} style={{ marginRight: 5 }} />
              <Text style={styles.joinedText}>Se unió en {formatJoinedDate(createdAt)}</Text>
            </View>

            {/* Stats (Seguidos / Seguidores) */}
            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Text style={styles.statCount}>{followingCount}</Text>
                <Text style={styles.statLabel}>Seguidos</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statCount}>{followersCount}</Text>
                <Text style={styles.statLabel}>Seguidores</Text>
              </View>
            </View>
          </View>

          {/* 3. Section Title: Publicaciones */}
          <View style={styles.sectionHeaderBar}>
            <Ionicons name="document-text-outline" size={16} color={colors.coffeeDeep} style={{ marginRight: 6 }} />
            <Text style={styles.sectionHeadingText}>Publicaciones</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{posts.length}</Text>
            </View>
          </View>

          {/* Posts List */}
          {loadingPosts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.coffeePrimary} />
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={38} color={colors.borderMedium} />
              <Text style={styles.emptyTitle}>Sin publicaciones</Text>
              <Text style={styles.emptySubtitle}>Este usuario no ha compartido publicaciones aún.</Text>
            </View>
          ) : (
            <View style={styles.postsList}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onCommentPress={onCommentPress}
                  onRequireAuth={onRequireAuth}
                />
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
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
    borderBottomColor: '#F4EFEB',
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
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.coffeeDeep,
    letterSpacing: -0.2,
  },
  scrollBody: {
    flex: 1,
  },
  coverBanner: {
    width: '100%',
    height: 140,
    backgroundColor: '#1C1614',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverTouchable: {
    width: '100%',
    height: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeaderContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE6',
  },
  avatarContainer: {
    marginTop: -44,
    marginBottom: 10,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3.5,
    borderColor: colors.white,
    backgroundColor: colors.surface,
  },
  usernameText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: colors.coffeeDeep,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  bioContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18.5,
  },
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  joinedText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF7F5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0EBE6',
  },
  statCount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.coffeeDeep,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sectionHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionHeadingText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  sectionBadge: {
    backgroundColor: '#F5EFEA',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
    marginLeft: 6,
  },
  sectionBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  postsList: {
    paddingTop: 2,
  },
});
