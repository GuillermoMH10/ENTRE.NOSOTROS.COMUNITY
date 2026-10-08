import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Post, ReactionType, REACTIONS_MAP } from '../../types/post';
import { PostMediaView } from './PostMediaView';
import { ReactionPicker } from './ReactionPicker';
import { ImageViewerModal } from '../UI/ImageViewerModal';
import { togglePostReaction, toggleSavePost, toggleFollowUser } from '../../services/postsService';
import { useAuth } from '../../context/AuthContext';

interface PostCardProps {
  post: Post;
  isFollowing?: boolean;
  onFollowToggle?: (targetAuthorId: string) => void;
  onCommentPress: (post: Post) => void;
  onRequireAuth: () => void;
  onOptionsPress?: (post: Post) => void;
  onEditPress?: (post: Post) => void;
  onDeletePress?: (post: Post) => void;
  onReportPress?: (post: Post) => void;
  onUserPress?: (userId: string, username: string, avatarUrl: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isFollowing: isFollowingProp,
  onFollowToggle,
  onCommentPress,
  onRequireAuth,
  onOptionsPress,
  onEditPress,
  onDeletePress,
  onReportPress,
  onUserPress,
}) => {
  const { user } = useAuth();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(Boolean(isFollowingProp));
  const reactionBtnRef = React.useRef<View>(null);

  useEffect(() => {
    if (isFollowingProp !== undefined) {
      setIsFollowing(isFollowingProp);
    }
  }, [isFollowingProp]);

  const currentUserId = user?.id || '';
  const userReactionType = currentUserId ? post.userReactions?.[currentUserId] : undefined;
  const isSaved = currentUserId ? post.savedBy?.includes(currentUserId) : false;
  const isAuthor = Boolean(user && user.id === post.authorId);

  // Format relative date
  const formatTimeAgo = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} d`;
  };

  // Total reactions count
  const totalReactions =
    (post.reactions?.teAbrazo || 0) +
    (post.reactions?.teEscucho || 0) +
    (post.reactions?.noEstasSolo || 0) +
    (post.reactions?.fuerza || 0);

  // Handle follow/unfollow tap
  const handleFollowPress = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    const nextState = !isFollowing;
    setIsFollowing(nextState);

    if (onFollowToggle) {
      onFollowToggle(post.authorId);
    } else {
      await toggleFollowUser(user.id, post.authorId);
    }
  };

  // Handle default tap on reaction button
  const handleSingleTapReaction = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    await togglePostReaction(post.id, user.id, 'teAbrazo');
  };

  // Handle long press on reaction button (opens reaction picker)
  const handleLongPressReaction = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (reactionBtnRef.current) {
      reactionBtnRef.current.measureInWindow((x, y, width, height) => {
        setPickerPosition({ x: Math.max(10, x || 16), y: Math.max(80, y || 300) });
        setShowReactionPicker(true);
      });
    } else {
      setShowReactionPicker(true);
    }
  };

  // Handle selecting reaction from floating picker
  const handleSelectReaction = async (reactionType: ReactionType) => {
    if (!user) return;
    await togglePostReaction(post.id, user.id, reactionType);
  };

  // Handle toggle save
  const handleToggleSave = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    await toggleSavePost(post.id, user.id);
  };

  // Open full-screen media viewer
  const handleMediaPress = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const activeReactionConfig = userReactionType ? REACTIONS_MAP[userReactionType] : null;

  return (
    <View style={[styles.postItemContainer, showReactionPicker && styles.postItemActiveZIndex]}>
      {/* Full-screen Media Viewer Modal */}
      <ImageViewerModal
        visible={viewerVisible}
        images={post.imageUrls}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />

      {/* Floating Reaction Picker */}
      <ReactionPicker
        visible={showReactionPicker}
        position={pickerPosition}
        onSelectReaction={handleSelectReaction}
        onClose={() => setShowReactionPicker(false)}
      />

      {/* Header: Author Avatar, Username, Time & Follow / Options */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.authorTouchable}
          onPress={() => onUserPress && onUserPress(post.authorId, post.authorUsername, (user && user.id === post.authorId && user.avatarUrl) ? user.avatarUrl : post.authorAvatarUrl)}
          activeOpacity={0.7}
        >
          <Image
            source={{
              uri: (user && user.id === post.authorId && user.avatarUrl)
                ? user.avatarUrl
                : post.authorAvatarUrl,
            }}
            style={styles.authorAvatar}
            resizeMode="cover"
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorUsername}>@{post.authorUsername}</Text>
            <Text style={styles.postTime}>{formatTimeAgo(post.timestamp)}</Text>
          </View>
        </TouchableOpacity>

        {/* Discreet Follow / Following Button (when viewing another user's post) */}
        {!isAuthor && (
          <TouchableOpacity
            style={[
              styles.followBtn,
              isFollowing && styles.followingBtn,
            ]}
            onPress={handleFollowPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFollowing ? "checkmark" : "add"}
              size={13}
              color={isFollowing ? colors.textSecondary : colors.primary}
              style={{ marginRight: 2 }}
            />
            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Options Button: Edit/Delete for Author, Discreet Report for Others */}
        {(onOptionsPress || onEditPress || onDeletePress || onReportPress) && (
          <TouchableOpacity
            style={styles.postOptionsBtn}
            onPress={() => {
              if (onOptionsPress) {
                onOptionsPress(post);
              } else if (isAuthor && onEditPress) {
                onEditPress(post);
              } else if (onReportPress) {
                onReportPress(post);
              }
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.6}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Body: Description Content */}
      {post.content ? (
        <Text style={styles.contentParagraph}>{post.content}</Text>
      ) : null}

      {/* Media View (Photos & Videos with Natural Proportions) */}
      <PostMediaView
        mediaUrls={post.imageUrls}
        onMediaPress={handleMediaPress}
      />

      {/* Hashtags in discrete modern slate/sky blue */}
      {post.hashtags && post.hashtags.length > 0 ? (
        <View style={styles.hashtagsRow}>
          {post.hashtags.map((tag, idx) => (
            <Text key={idx} style={styles.hashtagText}>
              {tag}{' '}
            </Text>
          ))}
        </View>
      ) : null}

      {/* Total Reaction Counters preview */}
      {totalReactions > 0 && (
        <View style={styles.counterRow}>
          <View style={styles.reactionIconsOverlap}>
            {post.reactions?.teAbrazo > 0 && (
              <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.teAbrazo.bgColor }]}>
                <Image
                  source={REACTIONS_MAP.teAbrazo.image}
                  style={styles.miniReactionImg}
                  resizeMode="contain"
                />
              </View>
            )}
            {post.reactions?.teEscucho > 0 && (
              <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.teEscucho.bgColor }]}>
                <Image
                  source={REACTIONS_MAP.teEscucho.image}
                  style={styles.miniReactionImg}
                  resizeMode="contain"
                />
              </View>
            )}
            {post.reactions?.noEstasSolo > 0 && (
              <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.noEstasSolo.bgColor }]}>
                <Image
                  source={REACTIONS_MAP.noEstasSolo.image}
                  style={styles.miniReactionImg}
                  resizeMode="contain"
                />
              </View>
            )}
            {post.reactions?.fuerza > 0 && (
              <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.fuerza.bgColor }]}>
                <Image
                  source={REACTIONS_MAP.fuerza.image}
                  style={styles.miniReactionImg}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
          <Text style={styles.counterText}>{totalReactions}</Text>
        </View>
      )}

      {/* Actions Footer: Reaccionar, Dejar unas palabras, Guardar */}
      <View style={styles.actionsFooter}>
        {/* 1. Reaction Button with Long Press */}
        <TouchableOpacity
          ref={reactionBtnRef as any}
          style={styles.actionBtn}
          onPress={handleSingleTapReaction}
          onLongPress={handleLongPressReaction}
          delayLongPress={200}
          activeOpacity={0.7}
        >
          {activeReactionConfig ? (
            <Image
              source={activeReactionConfig.image}
              style={styles.actionReactionImg}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={REACTIONS_MAP.teAbrazo.image}
              style={[styles.actionReactionImg, { opacity: 0.45 }]}
              resizeMode="contain"
            />
          )}
          <Text
            style={[
              styles.actionBtnText,
              activeReactionConfig && { color: activeReactionConfig.color, fontWeight: '700' },
            ]}
          >
            {activeReactionConfig ? activeReactionConfig.label : 'Te abrazo'}
          </Text>
        </TouchableOpacity>

        {/* 2. Dejar unas palabras (Comments) */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onCommentPress(post)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={17} color={colors.textSecondary} />
          <Text style={styles.actionBtnText}>
            Dejar unas palabras {post.commentsCount > 0 ? `(${post.commentsCount})` : ''}
          </Text>
        </TouchableOpacity>

        {/* 3. Guardar */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleToggleSave}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isSaved ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.actionBtnText, isSaved && styles.actionBtnTextActive]}>
            {isSaved ? 'Guardado' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Thin Hairline Divider Separator */}
      <View style={styles.postDivider} />
    </View>
  );
};

const styles = StyleSheet.create({
  postItemContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    position: 'relative',
    zIndex: 1,
  },
  postItemActiveZIndex: {
    zIndex: 100,
    elevation: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: 8,
  },
  followingBtn: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderLight,
  },
  followBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  followingBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  postOptionsBtn: {
    padding: 6,
    borderRadius: 14,
  },
  authorUsername: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  postTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  contentParagraph: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20.5,
    marginBottom: 4,
  },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 4,
  },
  hashtagText: {
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  reactionIconsOverlap: {
    flexDirection: 'row',
    marginRight: 6,
  },
  miniCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
    marginRight: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    overflow: 'hidden',
  },
  miniReactionImg: {
    width: 14,
    height: 14,
  },
  actionReactionImg: {
    width: 22,
    height: 22,
  },
  counterText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '600',
  },
  actionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  actionBtnText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginLeft: 5,
    fontWeight: '500',
  },
  actionBtnTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  postDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    width: '100%',
    marginTop: 6,
  },
});
