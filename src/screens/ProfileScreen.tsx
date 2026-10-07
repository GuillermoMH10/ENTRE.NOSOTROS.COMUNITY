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
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types/post';
import { PostCard } from '../components/Feed/PostCard';
import { CommentsScreen } from './CommentsScreen';
import { PostOptionsModal } from '../components/Feed/PostOptionsModal';
import { EditPostModal } from '../components/Feed/EditPostModal';
import { ImageViewerModal } from '../components/UI/ImageViewerModal';
import {
  uploadMediaToStorage,
  deletePost,
  subscribeToUserPosts,
  subscribeToSavedPosts,
  subscribeToReactedPosts,
} from '../services/postsService';
import { getLatestTestResult } from '../services/psychologyTestService';
import { TestResult } from '../types/psychologyTest';
import { PsychologyTestModal } from '../components/PsychologyTest/PsychologyTestModal';
import { WeeklyMoodTracker } from '../components/Profile/WeeklyMoodTracker';

interface ProfileScreenProps {
  visible: boolean;
  onClose: () => void;
  onRequireAuth?: () => void;
  onOpenPsychologists?: () => void;
  onOpenCreatePost?: () => void;
}

type ProfileTab = 'posts' | 'saved' | 'reacted' | null;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  visible,
  onClose,
  onRequireAuth,
  onOpenPsychologists,
  onOpenCreatePost,
}) => {
  const { user, logout, updateUserProfile } = useAuth();

  // Active Tab: null initially (clean blank space as requested), or 'posts' | 'saved' | 'reacted'
  const [selectedTab, setSelectedTab] = useState<ProfileTab>(null);
  const [latestTestResult, setLatestTestResult] = useState<TestResult | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testModalMode, setTestModalMode] = useState<'questionnaire' | 'result'>('questionnaire');

  // Feed lists for each tab
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [reactedPosts, setReactedPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Image Uploading States
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Bio Editing States
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Post Options & Edit States (Author)
  const [selectedPostForOptions, setSelectedPostForOptions] = useState<Post | null>(null);
  const [selectedPostForEdit, setSelectedPostForEdit] = useState<Post | null>(null);

  // Active Comment Post Modal
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);

  // Full-screen Image Viewer (Cover & Avatar)
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

  const handleOpenImageViewer = (imagesList: string[], idx = 0) => {
    setViewerImages(imagesList);
    setViewerIndex(idx);
    setViewerVisible(true);
  };

  // Fetch latest psychology test result
  useEffect(() => {
    if (visible && user) {
      getLatestTestResult(user.id).then((res) => {
        setLatestTestResult(res);
      });
    }
  }, [visible, user]);

  // Real-time subscriptions based on active tab
  useEffect(() => {
    if (!visible || !user) return;

    if (selectedTab === 'posts') {
      setLoadingPosts(true);
      const unsubscribe = subscribeToUserPosts(user.id, (posts) => {
        setUserPosts(posts);
        setLoadingPosts(false);
      });
      return () => unsubscribe();
    }

    if (selectedTab === 'saved') {
      setLoadingPosts(true);
      const unsubscribe = subscribeToSavedPosts(user.id, (posts) => {
        setSavedPosts(posts);
        setLoadingPosts(false);
      });
      return () => unsubscribe();
    }

    if (selectedTab === 'reacted') {
      setLoadingPosts(true);
      const unsubscribe = subscribeToReactedPosts(user.id, (posts) => {
        setReactedPosts(posts);
        setLoadingPosts(false);
      });
      return () => unsubscribe();
    }
  }, [visible, user, selectedTab]);

  // Format creation date (e.g., "Septiembre 2026")
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

  // Pick and Upload Cover Photo
  const handlePickCoverPhoto = async () => {
    if (!user) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se requiere acceso a la galería para actualizar la foto de portada.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.35,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsUploadingCover(true);
        const asset = result.assets[0];
        const source = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const storagePath = `users/${user.id}/cover_${Date.now()}.jpg`;

        const publicUrl = await uploadMediaToStorage(source, storagePath);
        await updateUserProfile({ coverPhotoUrl: publicUrl });
        setIsUploadingCover(false);
      }
    } catch (error: any) {
      setIsUploadingCover(false);
      Alert.alert('Error', error.message || 'No se pudo subir la foto de portada.');
    }
  };

  // Pick and Upload Profile Avatar
  const handlePickAvatar = async () => {
    if (!user) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se requiere acceso a la galería para cambiar la foto de perfil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.35,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsUploadingAvatar(true);
        const asset = result.assets[0];
        const source = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const storagePath = `users/${user.id}/avatar_${Date.now()}.jpg`;

        const publicUrl = await uploadMediaToStorage(source, storagePath);
        await updateUserProfile({ avatarUrl: publicUrl });
        setIsUploadingAvatar(false);
      }
    } catch (error: any) {
      setIsUploadingAvatar(false);
      Alert.alert('Error', error.message || 'No se pudo actualizar la foto de perfil.');
    }
  };

  // Open Bio Editor
  const handleOpenBioEditor = () => {
    setBioInput(user?.bio || '');
    setIsEditingBio(true);
  };

  // Save Bio
  const handleSaveBio = async () => {
    setIsSavingBio(true);
    await updateUserProfile({ bio: bioInput.trim() });
    setIsSavingBio(false);
    setIsEditingBio(false);
  };

  // Delete Post Handler
  const handleDeletePost = async (post: Post) => {
    const res = await deletePost(post.id);
    if (!res.success) {
      Alert.alert('Error', res.error || 'No se pudo eliminar la publicación.');
    }
  };

  // Logout confirmation state
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Logout with confirmation
  const handleLogoutPress = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await logout();
    onClose();
  };

  if (!visible || !user) return null;

  // Active tab posts list
  const currentTabPosts =
    selectedTab === 'posts'
      ? userPosts
      : selectedTab === 'saved'
      ? savedPosts
      : selectedTab === 'reacted'
      ? reactedPosts
      : [];

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

        {/* Comments Modal if active */}
        <CommentsScreen
          visible={activeCommentPost !== null}
          post={activeCommentPost}
          onClose={() => setActiveCommentPost(null)}
          onRequireAuth={onRequireAuth || (() => {})}
        />

        {/* Bio Edit Modal */}
        {isEditingBio && (
          <Modal
            visible={true}
            transparent
            animationType="fade"
            onRequestClose={() => setIsEditingBio(false)}
          >
            <View style={styles.editModalBackdrop}>
              <View style={styles.editModalCard}>
                <View style={styles.editModalHeader}>
                  <Text style={styles.editModalTitle}>Descripción de Perfil</Text>
                  <TouchableOpacity onPress={() => setIsEditingBio(false)}>
                    <Ionicons name="close" size={22} color={colors.coffeeDark} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.editBioInput}
                  multiline
                  maxLength={160}
                  value={bioInput}
                  onChangeText={setBioInput}
                  placeholder="Escribe una pequeña descripción sobre ti..."
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                />
                <Text style={styles.bioCharCount}>{bioInput.length}/160</Text>
                <View style={styles.editModalActions}>
                  <TouchableOpacity
                    style={styles.editCancelBtn}
                    onPress={() => setIsEditingBio(false)}
                    disabled={isSavingBio}
                  >
                    <Text style={styles.editCancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editSaveBtn}
                    onPress={handleSaveBio}
                    disabled={isSavingBio}
                  >
                    {isSavingBio ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.editSaveBtnText}>Guardar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

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
          <Text style={styles.navTitle}>Perfil</Text>
          <TouchableOpacity
            onPress={handleLogoutPress}
            style={styles.navLogoutBtn}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="log-out-outline" size={19} color="#A85C52" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
          {/* 1. Cover Photo Banner */}
          <View style={styles.coverBanner}>
            {user.coverPhotoUrl ? (
              <TouchableOpacity
                style={styles.coverImageTouchable}
                onPress={() => handleOpenImageViewer([user.coverPhotoUrl!])}
                activeOpacity={0.9}
              >
                <Image source={{ uri: user.coverPhotoUrl }} style={styles.coverImage} resizeMode="cover" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.coverPlaceholder}
                onPress={handlePickCoverPhoto}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
                <Text style={styles.coverPlaceholderText}>Actualiza tu foto de portada</Text>
              </TouchableOpacity>
            )}

            {isUploadingCover ? (
              <View style={styles.uploadingCoverOverlay}>
                <ActivityIndicator size="small" color={colors.white} />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.coverEditBadge}
                onPress={handlePickCoverPhoto}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="camera" size={14} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>

          {/* 2. Avatar & Header Profile Info */}
          <View style={styles.profileHeaderContent}>
            {/* Overlapping Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarTouchable}>
                <TouchableOpacity
                  onPress={() => user.avatarUrl && handleOpenImageViewer([user.avatarUrl])}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
                </TouchableOpacity>

                {isUploadingAvatar ? (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator size="small" color={colors.white} />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.avatarEditBadge}
                    onPress={handlePickAvatar}
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="camera" size={13} color={colors.white} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Username */}
            <Text style={styles.usernameText}>@{user.username}</Text>

            {/* Editable Bio / Description */}
            <TouchableOpacity style={styles.bioContainer} onPress={handleOpenBioEditor} activeOpacity={0.7}>
              {user.bio ? (
                <Text style={styles.bioText}>{user.bio}</Text>
              ) : (
                <Text style={styles.bioPlaceholderText}>Agregar una pequeña descripción...</Text>
              )}
              <Ionicons name="pencil" size={13} color={colors.coffeePrimary} style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            {/* Joined Date */}
            <View style={styles.joinedRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textMuted} style={{ marginRight: 5 }} />
              <Text style={styles.joinedText}>Se unió en {formatJoinedDate(user.createdAt)}</Text>
            </View>

            {/* Discrete Stats Buttons (Seguidos / Seguidores) */}
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statPill} activeOpacity={0.7}>
                <Text style={styles.statCount}>{user.followingCount || 0}</Text>
                <Text style={styles.statLabel}>Seguidos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statPill} activeOpacity={0.7}>
                <Text style={styles.statCount}>{user.followersCount || 0}</Text>
                <Text style={styles.statLabel}>Seguidores</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. The 3 Sections Tabs separated by thin vertical dividers */}
          <View style={styles.tabsSection}>
            <View style={styles.tabsRow}>
              {/* Tab 1: Mis publicaciones */}
              <TouchableOpacity
                style={[styles.tabButton, selectedTab === 'posts' && styles.tabButtonActive]}
                onPress={() => setSelectedTab(selectedTab === 'posts' ? null : 'posts')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={selectedTab === 'posts' ? 'document-text' : 'document-text-outline'}
                  size={14}
                  color={selectedTab === 'posts' ? colors.coffeeDeep : colors.textMuted}
                  style={{ marginRight: 4 }}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.tabText, selectedTab === 'posts' && styles.tabTextActive]}
                >
                  Mis publicaciones
                </Text>
              </TouchableOpacity>

              {/* Thin Vertical Divider 1 */}
              <View style={styles.tabVerticalDivider} />

              {/* Tab 2: Guardados */}
              <TouchableOpacity
                style={[styles.tabButton, selectedTab === 'saved' && styles.tabButtonActive]}
                onPress={() => setSelectedTab(selectedTab === 'saved' ? null : 'saved')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={selectedTab === 'saved' ? 'bookmark' : 'bookmark-outline'}
                  size={14}
                  color={selectedTab === 'saved' ? colors.coffeeDeep : colors.textMuted}
                  style={{ marginRight: 4 }}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.tabText, selectedTab === 'saved' && styles.tabTextActive]}
                >
                  Guardados
                </Text>
              </TouchableOpacity>

              {/* Thin Vertical Divider 2 */}
              <View style={styles.tabVerticalDivider} />

              {/* Tab 3: Estuve presente */}
              <TouchableOpacity
                style={[styles.tabButton, selectedTab === 'reacted' && styles.tabButtonActive]}
                onPress={() => setSelectedTab(selectedTab === 'reacted' ? null : 'reacted')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={selectedTab === 'reacted' ? 'heart' : 'heart-outline'}
                  size={14}
                  color={selectedTab === 'reacted' ? colors.coffeeDeep : colors.textMuted}
                  style={{ marginRight: 4 }}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.tabText, selectedTab === 'reacted' && styles.tabTextActive]}
                >
                  Estuve presente
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tab Content Rendering */}
          {selectedTab === null ? (
            <>
              {latestTestResult ? (
                <View style={styles.profileTestCard}>
                  <View style={styles.profileTestHeader}>
                    <View style={styles.profileTestTitleRow}>
                      <Ionicons name="pulse" size={17} color={latestTestResult.badgeColor} style={{ marginRight: 6 }} />
                      <Text style={styles.profileTestMainTitle}>Tu Bienestar Emocional</Text>
                    </View>
                    <Text style={styles.profileTestDate}>
                      {new Date(latestTestResult.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={[styles.profileTestBadge, { backgroundColor: latestTestResult.badgeColor + '18' }]}>
                    <Text style={[styles.profileTestBadgeText, { color: latestTestResult.badgeColor }]}>
                      {latestTestResult.levelTitle}
                    </Text>
                  </View>

                  <Text style={styles.profileTestSummaryText} numberOfLines={3}>
                    {latestTestResult.summary}
                  </Text>

                  {/* 3 Main Dimensions preview */}
                  <View style={styles.profileDimList}>
                    {latestTestResult.dimensions.slice(0, 3).map((dim) => {
                      const color =
                        dim.level === 'bajo'
                          ? '#10B981'
                          : dim.level === 'moderado'
                          ? '#F59E0B'
                          : '#EF4444';
                      return (
                        <View key={dim.key} style={styles.profileDimItem}>
                          <View style={styles.profileDimHeader}>
                            <Text style={styles.profileDimLabel}>{dim.label}</Text>
                            <Text style={[styles.profileDimLevel, { color }]}>{dim.level.toUpperCase()}</Text>
                          </View>
                          <View style={styles.profileDimBarTrack}>
                            <View
                              style={[
                                styles.profileDimBarFill,
                                { width: `${dim.percentage}%`, backgroundColor: color },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* 2 Separated Distinct Buttons */}
                  <View style={styles.profileTestActionsRow}>
                    <TouchableOpacity
                      style={styles.profileViewResultBtn}
                      activeOpacity={0.85}
                      onPress={() => {
                        setTestModalMode('result');
                        setIsTestModalOpen(true);
                      }}
                    >
                      <Ionicons name="eye-outline" size={14} color={colors.white} style={{ marginRight: 5 }} />
                      <Text style={styles.profileViewResultBtnText}>Ver evaluación</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.profileRetakeBtn}
                      activeOpacity={0.85}
                      onPress={() => {
                        setTestModalMode('questionnaire');
                        setIsTestModalOpen(true);
                      }}
                    >
                      <Ionicons name="refresh-outline" size={14} color={colors.coffeeDark} style={{ marginRight: 5 }} />
                      <Text style={styles.profileRetakeBtnText}>Repetir test</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.profileNoTestContainer}>
                  <View style={styles.profileNoTestIconCircle}>
                    <Ionicons name="heart-circle-outline" size={32} color={colors.coffeePrimary} />
                  </View>
                  <Text style={styles.profileNoTestTitle}>Conoce tu estado de bienestar</Text>
                  <Text style={styles.profileNoTestSubtitle}>
                    Realiza nuestro test emocional interactivo para evaluar tus niveles de ánimo, ansiedad, estrés y descanso.
                  </Text>
                  <TouchableOpacity
                    style={styles.profileStartTestBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      setTestModalMode('questionnaire');
                      setIsTestModalOpen(true);
                    }}
                  >
                    <Ionicons name="clipboard-outline" size={16} color={colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.profileStartTestBtnText}>Realizar test emocional</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Weekly Mood Tracker Section ("¿Cómo te has sentido esta semana?") */}
              <WeeklyMoodTracker userId={user?.id} />
            </>
          ) : (
            <>
              {/* Return Button to Graphs & Emotional Wellbeing */}
              <View style={styles.tabReturnBar}>
                <TouchableOpacity
                  style={styles.tabReturnBtn}
                  onPress={() => setSelectedTab(null)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={14} color={colors.coffeeDark} style={{ marginRight: 6 }} />
                  <Text style={styles.tabReturnBtnText}>Volver a mis gráficas y bienestar</Text>
                  <Ionicons name="pulse" size={14} color={colors.coffeePrimary} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>

              {loadingPosts ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.coffeePrimary} />
                </View>
              ) : currentTabPosts.length === 0 ? (
                <View style={styles.emptyTabContainer}>
                  <Ionicons
                    name={
                      selectedTab === 'posts'
                        ? 'document-text-outline'
                        : selectedTab === 'saved'
                        ? 'bookmark-outline'
                        : 'heart-outline'
                    }
                    size={36}
                    color={colors.borderMedium}
                  />
                  <Text style={styles.emptyTabTitle}>
                    {selectedTab === 'posts'
                      ? 'No has publicado nada aún'
                      : selectedTab === 'saved'
                      ? 'No tienes publicaciones guardadas'
                      : 'Aún no has reaccionado a ninguna publicación'}
                  </Text>
                  <Text style={styles.emptyTabSubtitle}>
                    {selectedTab === 'posts'
                      ? 'Comparte tus pensamientos y desahógate cuando lo necesites.'
                      : selectedTab === 'saved'
                      ? 'Guarda publicaciones para verlas más tarde.'
                      : 'Expresa tu apoyo a la comunidad reaccionando a publicaciones.'}
                  </Text>
                </View>
              ) : (
                <View style={styles.postsListContainer}>
                  {currentTabPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onCommentPress={(p) => setActiveCommentPost(p)}
                      onRequireAuth={onRequireAuth || (() => {})}
                      onOptionsPress={(p) => setSelectedPostForOptions(p)}
                    />
                  ))}
                </View>
              )}
            </>
          )}

          {/* Bottom Clear Logout Option */}
          <View style={styles.bottomLogoutContainer}>
            <TouchableOpacity
              style={styles.bottomLogoutBtn}
              onPress={handleLogoutPress}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={styles.bottomLogoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Logout Confirmation Modal (100% Reliable Cross-Platform) */}
        {isLogoutConfirmOpen && (
          <Modal
            transparent
            visible={isLogoutConfirmOpen}
            animationType="fade"
            onRequestClose={() => setIsLogoutConfirmOpen(false)}
          >
            <View style={styles.editModalBackdrop}>
              <View style={styles.logoutModalCard}>
                <View style={styles.logoutIconCircle}>
                  <Ionicons name="log-out-outline" size={26} color="#DC2626" />
                </View>
                <Text style={styles.logoutModalTitle}>¿Cerrar Sesión?</Text>
                <Text style={styles.logoutModalMessage}>
                  ¿Estás seguro de que deseas salir de tu cuenta?
                </Text>
                <View style={styles.logoutModalActions}>
                  <TouchableOpacity
                    style={styles.logoutCancelBtn}
                    onPress={() => setIsLogoutConfirmOpen(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.logoutCancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.logoutConfirmBtn}
                    onPress={handleConfirmLogout}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.logoutConfirmBtnText}>Cerrar Sesión</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Post Options Bottom Sheet (Edit & Delete for Author) */}
        <PostOptionsModal
          visible={selectedPostForOptions !== null}
          post={selectedPostForOptions}
          onClose={() => setSelectedPostForOptions(null)}
          onEdit={(p) => setSelectedPostForEdit(p)}
          onDelete={handleDeletePost}
        />

        {/* Edit Post Modal */}
        <EditPostModal
          visible={selectedPostForEdit !== null}
          post={selectedPostForEdit}
          onClose={() => setSelectedPostForEdit(null)}
        />

        {/* Psychology Test Modal */}
        <PsychologyTestModal
          visible={isTestModalOpen}
          userId={user?.id}
          initialResult={latestTestResult}
          startMode={testModalMode}
          onClose={() => setIsTestModalOpen(false)}
          onOpenPsychologists={() => {
            onClose();
            if (onOpenPsychologists) onOpenPsychologists();
          }}
          onOpenCreatePost={() => {
            onClose();
            if (onOpenCreatePost) onOpenCreatePost();
          }}
          onTestCompleted={(res) => setLatestTestResult(res)}
        />
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
  navLogoutBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  scrollBody: {
    flex: 1,
  },
  // Cover Banner
  coverBanner: {
    width: '100%',
    height: 140,
    backgroundColor: '#1C1614',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImageTouchable: {
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
    gap: 6,
  },
  coverPlaceholderText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  coverEditBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  uploadingCoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Profile Header Info
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
  avatarTouchable: {
    position: 'relative',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    borderWidth: 3.5,
    borderColor: colors.white,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.coffeePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.coffeeDeep,
    letterSpacing: -0.3,
  },
  bioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    maxWidth: 320,
  },
  bioText: {
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
  bioPlaceholderText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  joinedText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  // Discrete Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: '#F7F3EE',
    borderWidth: 1,
    borderColor: '#EFE9E2',
    gap: 5,
  },
  statCount: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // 3 Tabs Section
  tabsSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#EFEAE4',
  },
  tabVerticalDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E5DFD9',
  },
  tabText: {
    fontSize: 10.8,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: -0.2,
  },
  tabTextActive: {
    color: colors.coffeeDeep,
    fontWeight: '700',
  },
  // Blank space when no tab is selected
  cleanBlankSpace: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  cleanBlankText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
    gap: 8,
  },
  emptyTabTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.coffeeDeep,
    textAlign: 'center',
    marginTop: 6,
  },
  emptyTabSubtitle: {
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  postsListContainer: {
    paddingTop: 6,
  },
  // Edit Modal Styles
  editModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  editModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  editModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  editBioInput: {
    borderWidth: 1,
    borderColor: '#E8E1D9',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bioCharCount: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 10,
  },
  editModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  editCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  editCancelBtnText: {
    fontSize: 13.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  editSaveBtn: {
    backgroundColor: colors.coffeePrimary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  editSaveBtnText: {
    fontSize: 13.5,
    color: colors.white,
    fontWeight: '700',
  },
  // Bottom Logout Button
  bottomLogoutContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  bottomLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    width: '100%',
  },
  bottomLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  // Logout Modal Card
  logoutModalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.coffeeDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  logoutModalMessage: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  logoutModalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  logoutCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  logoutConfirmBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutConfirmBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.white,
  },
  /* Profile Psychology Test Card */
  profileTestCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2.5,
  },
  profileTestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileTestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTestMainTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  profileTestDate: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  profileTestBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  profileTestBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  profileTestSummaryText: {
    fontSize: 12.5,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 12,
  },
  profileDimList: {
    gap: 8,
    marginBottom: 12,
  },
  profileDimItem: {
    backgroundColor: '#FAF7F5',
    padding: 8,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: '#EAE3DF',
  },
  profileDimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileDimLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  profileDimLevel: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  profileDimBarTrack: {
    height: 5,
    backgroundColor: '#E5DCD6',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  profileDimBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  profileTestActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileViewResultBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coffeePrimary,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  profileViewResultBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.white,
  },
  profileRetakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F5',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE3DF',
  },
  profileRetakeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  /* Profile No Test Invitation Container */
  profileNoTestContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    gap: 8,
  },
  profileNoTestIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3EAE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  profileNoTestTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
  },
  profileNoTestSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  profileStartTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coffeePrimary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  profileStartTestBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.white,
  },
  /* Tab Return Bar to Graphs and Overview */
  tabReturnBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  tabReturnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F5',
    borderWidth: 1.2,
    borderColor: '#EAE3DF',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  tabReturnBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
});
