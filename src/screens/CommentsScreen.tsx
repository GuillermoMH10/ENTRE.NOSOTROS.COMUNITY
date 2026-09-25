import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { Post, PostComment } from '../types/post';
import { ImageViewerModal } from '../components/UI/ImageViewerModal';
import {
  addComment,
  subscribeToComments,
  toggleCommentHeart,
} from '../services/postsService';

interface CommentsScreenProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onRequireAuth: () => void;
}

export const CommentsScreen: React.FC<CommentsScreenProps> = ({
  visible,
  post,
  onClose,
  onRequireAuth,
}) => {
  const { user } = useAuth();

  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Full-screen Image Viewer
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

  // Subscribe to comments in real-time
  useEffect(() => {
    if (visible && post) {
      setIsLoading(true);
      const unsubscribe = subscribeToComments(post.id, (list) => {
        setComments(list);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [visible, post]);

  // Pick up to 1 image
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Se requiere permiso para adjuntar una foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const finalUri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setAttachedImage(finalUri);
    }
  };

  // Submit comment
  const handleSendComment = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    if (!commentText.trim() && !attachedImage) return;

    if (!post) return;

    setIsSending(true);

    const result = await addComment(
      post.id,
      user.id,
      user.username,
      user.avatarUrl,
      commentText,
      attachedImage || undefined
    );

    setIsSending(false);

    if (result.success) {
      setCommentText('');
      setAttachedImage(null);
    } else {
      Alert.alert('Error', result.error || 'No se pudo enviar tu mensaje.');
    }
  };

  // Toggle heart (ONLY post author can do this)
  const handleHeartPress = async (comment: PostComment) => {
    if (!user || !post) return;

    if (user.id !== post.authorId) {
      Alert.alert('Aviso', 'Solo quien creó la publicación puede dar un corazón a las palabras recibidas.');
      return;
    }

    await toggleCommentHeart(post.id, comment.id, comment.authorHeart);
  };

  // Open full-screen image viewer
  const handleOpenViewer = (imagesList: string[], idx = 0) => {
    setViewerImages(imagesList);
    setViewerIndex(idx);
    setViewerVisible(true);
  };

  const isPostAuthor = user?.id === post?.authorId;

  if (!visible || !post) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.rootContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Full-screen Image Viewer */}
        <ImageViewerModal
          visible={viewerVisible}
          images={viewerImages}
          initialIndex={viewerIndex}
          onClose={() => setViewerVisible(false)}
        />

        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.coffeeDark} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Dejar unas palabras</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Comments List */}
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.postContextCard}>
              <View style={styles.postContextAuthorRow}>
                <Image source={{ uri: post.authorAvatarUrl }} style={styles.contextAvatar} />
                <View>
                  <Text style={styles.contextUsername}>@{post.authorUsername}</Text>
                  <Text style={styles.contextTagline}>Publicación original</Text>
                </View>
              </View>
              {post.content ? (
                <Text style={styles.contextContent} numberOfLines={3}>
                  {post.content}
                </Text>
              ) : null}

              {/* Context post images preview (if any) */}
              {post.imageUrls && post.imageUrls.length > 0 && (
                <View style={styles.contextImagesRow}>
                  {post.imageUrls.map((url, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleOpenViewer(post.imageUrls, idx)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: url }} style={styles.contextThumb} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.contextDivider} />
              <Text style={styles.commentsHeading}>
                Palabras de la comunidad ({comments.length})
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.commentCard}>
              <Image source={{ uri: item.authorAvatarUrl }} style={styles.commentAvatar} />
              <View style={styles.commentBody}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUsername}>@{item.authorUsername}</Text>
                  {/* Author Heart Indicator / Button */}
                  <TouchableOpacity
                    style={[
                      styles.heartBtn,
                      item.authorHeart && styles.heartBtnActive,
                    ]}
                    onPress={() => handleHeartPress(item)}
                    activeOpacity={isPostAuthor ? 0.7 : 1}
                  >
                    <Ionicons
                      name={item.authorHeart ? 'heart' : 'heart-outline'}
                      size={16}
                      color={item.authorHeart ? '#D47355' : colors.textMuted}
                    />
                    {item.authorHeart && (
                      <Text style={styles.authorHeartBadge}>Autor</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>

                {/* Attached Comment Image with Click to View Full Screen */}
                {item.imageUrl && (
                  <TouchableOpacity
                    style={styles.commentImageContainer}
                    activeOpacity={0.85}
                    onPress={() => handleOpenViewer([item.imageUrl!], 0)}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.commentImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyCommentsBox}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.coffeeSoft} />
                <Text style={styles.emptyCommentsText}>
                  Aún no hay palabras. Sé el primero en dejar un mensaje de apoyo.
                </Text>
              </View>
            ) : (
              <ActivityIndicator size="small" color={colors.coffeePrimary} style={{ margin: 20 }} />
            )
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Bar at Bottom */}
        <View style={styles.bottomInputBar}>
          {attachedImage && (
            <View style={styles.attachedPreview}>
              <Image source={{ uri: attachedImage }} style={styles.attachedThumb} />
              <TouchableOpacity
                style={styles.removeAttachedBtn}
                onPress={() => setAttachedImage(null)}
              >
                <Ionicons name="close" size={12} color={colors.white} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            {/* Pick Image button */}
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <Ionicons name="image-outline" size={22} color={colors.coffeePrimary} />
            </TouchableOpacity>

            <TextInput
              style={styles.commentInput}
              placeholder="Dejar unas palabras..."
              placeholderTextColor={colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!commentText.trim() && !attachedImage) || isSending
                  ? styles.sendBtnDisabled
                  : null,
              ]}
              onPress={handleSendComment}
              disabled={(!commentText.trim() && !attachedImage) || isSending}
              activeOpacity={0.8}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="send" size={16} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? 38 : 48,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 4,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  listContent: {
    paddingBottom: 20,
  },
  postContextCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 8,
  },
  postContextAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contextAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  contextUsername: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  contextTagline: {
    fontSize: 11,
    color: colors.textMuted,
  },
  contextContent: {
    fontSize: 13.5,
    color: colors.textPrimary,
    lineHeight: 19,
    marginTop: 4,
  },
  contextImagesRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  contextThumb: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  contextDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 10,
  },
  commentsHeading: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.coffeeMedium,
    letterSpacing: 0.3,
  },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginRight: 10,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  heartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
  },
  heartBtnActive: {
    backgroundColor: '#FAF0EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  authorHeartBadge: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D47355',
    marginLeft: 3,
  },
  commentText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18.5,
  },
  commentImageContainer: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 6,
  },
  commentImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  emptyCommentsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyCommentsText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  bottomInputBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  attachedPreview: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  attachedThumb: {
    width: '100%',
    height: '100%',
  },
  removeAttachedBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachBtn: {
    padding: 6,
    marginRight: 6,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    maxHeight: 90,
    fontSize: 13.5,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.coffeePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
