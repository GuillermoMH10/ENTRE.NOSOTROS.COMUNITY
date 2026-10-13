import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { UserProfile } from '../../types/auth';
import { TabId } from '../Navigation/BottomTabBar';
import { Post } from '../../types/post';
import { FeedList } from '../Feed/FeedList';
import { CreatePostScreen } from '../../screens/CreatePostScreen';
import { SearchScreen } from '../../screens/SearchScreen';
import { BlogScreen } from '../../screens/BlogScreen';
import { PsychologistsScreen } from '../../screens/PsychologistsScreen';
import { RulesScreen } from '../../screens/RulesScreen';
import { SupportScreen } from '../../screens/SupportScreen';
import { AnimaScreen } from '../../screens/AnimaScreen';
import { ProfileScreen } from '../../screens/ProfileScreen';
import { UserProfileScreen } from '../../screens/UserProfileScreen';
import { FollowListModal, FollowTabType } from '../Profile/FollowListModal';
import { AnimaMascot } from '../Anima/AnimaMascot';
import {
  MOOD_OPTIONS,
  MoodOption,
  getRandomMoodResponse,
} from '../../data/dailyMoodResponses';
import {
  getTodayMoodRecord,
  createInstantMoodRecord,
  persistMoodRecordInBackground,
} from '../../services/moodService';
import { getCurrentTenMinuteQuote, DAILY_QUOTES } from '../../data/dailyQuotes';

export type DesktopNavId =
  | 'principal'
  | 'blog'
  | 'anima'
  | 'buscar'
  | 'psicologos'
  | 'reglas'
  | 'ayuda'
  | 'perfil';

interface DesktopWebLayoutProps {
  user: UserProfile | null;
  activeTab: TabId;
  onTabPress: (tabId: TabId) => void;
  onOpenProfile: () => void;
  onOpenPsychologists: () => void;
  onOpenRules: () => void;
  onOpenSupport: () => void;
  onOpenCreatePost: () => void;
  onRequireAuth: () => void;
  onCommentPress: (post: Post) => void;
  onOptionsPress: (post: Post) => void;
  onEditPress: (post: Post) => void;
  onDeletePress: (post: Post) => void;
  onUserPress: (userId: string, username: string, avatarUrl: string) => void;
  onOpenMonthDetail: (monthIndex: number) => void;
  onLogout: () => void;
  viewingUserProfile?: { userId: string; username?: string; avatarUrl?: string } | null;
  onCloseUserProfile?: () => void;
  isCreatePostOpen?: boolean;
  onCloseCreatePost?: () => void;
  onPostCreated?: () => void;
}

export const DesktopWebLayout: React.FC<DesktopWebLayoutProps> = ({
  user,
  activeTab,
  onTabPress,
  onOpenProfile,
  onOpenPsychologists,
  onOpenRules,
  onOpenSupport,
  onOpenCreatePost,
  onRequireAuth,
  onCommentPress,
  onOptionsPress,
  onEditPress,
  onDeletePress,
  onUserPress,
  onOpenMonthDetail,
  onLogout,
  viewingUserProfile,
  onCloseUserProfile,
  isCreatePostOpen = false,
  onCloseCreatePost,
  onPostCreated,
}) => {
  // Center section can be any of the main tabs or 'psicologos' | 'reglas' | 'ayuda' | 'perfil'
  const [activeSection, setActiveSection] = useState<DesktopNavId>(
    activeTab === 'mas' ? 'principal' : (activeTab as DesktopNavId)
  );

  // Search input in sidebar
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Live user profile data (counts, cover photo, avatar)
  const [liveUserData, setLiveUserData] = useState<{
    followingCount?: number;
    followersCount?: number;
    coverPhotoUrl?: string;
    avatarUrl?: string;
    bio?: string;
  }>({
    followingCount: user?.followingCount || 0,
    followersCount: user?.followersCount || 0,
    coverPhotoUrl: user?.coverPhotoUrl,
    avatarUrl: user?.avatarUrl,
    bio: user?.bio,
  });

  // Follow Modal State (Seguidores / Seguidos)
  const [followModalVisible, setFollowModalVisible] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<FollowTabType>('following');

  // Daily Mood State (¿Cómo te sientes hoy?)
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [moodFeedback, setMoodFeedback] = useState<string | null>(null);

  // Daily Quote State (Frase del día)
  const [quoteOffset, setQuoteOffset] = useState(0);
  const currentQuoteText = (() => {
    try {
      const base = getCurrentTenMinuteQuote();
      const idx = typeof base?.index === 'number' ? base.index : 0;
      const targetIndex = Math.abs(idx + quoteOffset) % (DAILY_QUOTES?.length || 1);
      return DAILY_QUOTES[targetIndex] || DAILY_QUOTES[0] || 'Tu presencia importa. Aunque hoy no puedas verlo con claridad, tu vida tiene un valor incalculable.';
    } catch {
      return DAILY_QUOTES?.[0] || 'Tu presencia importa. Date permiso de avanzar a tu propio ritmo.';
    }
  })();

  // Keep activeSection in sync with parent activeTab if changed externally
  useEffect(() => {
    if (activeTab !== 'mas') {
      setActiveSection(activeTab as DesktopNavId);
    }
  }, [activeTab]);

  // Subscribe to live user follower and following counts & profile assets
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLiveUserData({
          followingCount: data.followingCount ?? user.followingCount ?? 0,
          followersCount: data.followersCount ?? user.followersCount ?? 0,
          coverPhotoUrl: data.coverPhotoUrl || user.coverPhotoUrl,
          avatarUrl: data.avatarUrl || user.avatarUrl,
          bio: data.bio ?? user.bio,
        });
      }
    });
    return () => unsubscribe();
  }, [user?.id]);

  // Check today's mood on mount
  useEffect(() => {
    getTodayMoodRecord(user?.id).then((rec) => {
      if (rec) {
        setSelectedMoodId(rec.mood);
        setMoodFeedback(rec.quote || getRandomMoodResponse(rec.mood));
      }
    });
  }, [user?.id]);

  const handleSelectMood = (option: MoodOption) => {
    const quote = getRandomMoodResponse(option.id);
    setSelectedMoodId(option.id);
    setMoodFeedback(quote);
    const instantRecord = createInstantMoodRecord(option.id, user?.id);
    persistMoodRecordInBackground(instantRecord);
  };

  const handleSidebarSearchSubmit = () => {
    setActiveSection('buscar');
  };

  const handleOpenFollowers = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setFollowModalTab('followers');
    setFollowModalVisible(true);
  };

  const handleOpenFollowing = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setFollowModalTab('following');
    setFollowModalVisible(true);
  };

  const NAV_ITEMS: { id: DesktopNavId; label: string; icon: string; iconActive: string; badge?: string }[] = [
    { id: 'principal', label: 'Principal', icon: 'home-outline', iconActive: 'home' },
    { id: 'blog', label: 'Blog y Calendario', icon: 'book-outline', iconActive: 'book' },
    { id: 'anima', label: 'ANIMA', icon: 'heart-circle-outline', iconActive: 'heart-circle', badge: 'IA' },
    { id: 'buscar', label: 'Buscar', icon: 'search-outline', iconActive: 'search' },
    { id: 'psicologos', label: 'Psicólogos', icon: 'medkit-outline', iconActive: 'medkit' },
    { id: 'reglas', label: 'Reglas de Comunidad', icon: 'shield-checkmark-outline', iconActive: 'shield-checkmark' },
    { id: 'ayuda', label: 'Necesito Ayuda', icon: 'help-buoy-outline', iconActive: 'help-buoy' },
  ];

  return (
    <View style={styles.desktopRoot}>
      {Platform.OS === 'web' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Custom Web Scrollbar Styling - Modern, elegant, visible */
              ::-webkit-scrollbar {
                width: 9px !important;
                height: 9px !important;
                display: block !important;
              }
              ::-webkit-scrollbar-track {
                background: #F1F5F9 !important;
                border-radius: 9999px !important;
              }
              ::-webkit-scrollbar-thumb {
                background: #94A3B8 !important;
                border-radius: 9999px !important;
                border: 2px solid #F1F5F9 !important;
              }
              ::-webkit-scrollbar-thumb:hover {
                background: #64748B !important;
              }
              ::-webkit-scrollbar-thumb:active {
                background: #475569 !important;
              }
              ::-webkit-scrollbar-corner {
                background: transparent !important;
              }
              html, body, #root, * {
                scrollbar-width: thin !important;
                scrollbar-color: #94A3B8 #F1F5F9 !important;
              }
            `,
          }}
        />
      )}
      <View style={styles.desktopColumnsContainer}>
        {/* ========================================================================= */}
        {/* 1. LEFT SIDEBAR (Accesos & Navegación)                                      */}
        {/* ========================================================================= */}
        <View style={styles.leftSidebar}>
          {/* Top Logo */}
          <TouchableOpacity
            style={styles.logoRow}
            activeOpacity={0.8}
            onPress={() => {
              setActiveSection('principal');
              onTabPress('principal');
            }}
          >
            <Image
              source={require('../../../assets/logoappE.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="Logo Entre Nosotros"
            />
          </TouchableOpacity>

          {/* Quick Search Bar */}
          <View style={styles.sidebarSearchWrapper}>
            <Ionicons name="search" size={16} color="#7F94A2" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.sidebarSearchInput}
              placeholder="Buscar en la comunidad..."
              placeholderTextColor="#7F94A2"
              value={sidebarSearch}
              onChangeText={setSidebarSearch}
              onSubmitEditing={handleSidebarSearchSubmit}
              returnKeyType="search"
            />
          </View>

          {/* Navigation Items List */}
          <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={true}>
            <View style={styles.navList}>
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.navItem, isActive && styles.navItemActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (isCreatePostOpen && onCloseCreatePost) {
                        onCloseCreatePost();
                      }
                      if (viewingUserProfile && onCloseUserProfile) {
                        onCloseUserProfile();
                      }
                      setActiveSection(item.id);
                      if (['principal', 'blog', 'anima', 'buscar'].includes(item.id)) {
                        onTabPress(item.id as TabId);
                      }
                    }}
                  >
                    <Ionicons
                      name={(isActive ? item.iconActive : item.icon) as any}
                      size={20}
                      color={isActive ? colors.coffeePrimary : '#4B6779'}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                      {item.label}
                    </Text>
                    {item.badge && (
                      <View style={styles.navItemBadge}>
                        <Text style={styles.navItemBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Prominent Create Post CTA Button */}
            <TouchableOpacity
              style={styles.createPostCTA}
              activeOpacity={0.85}
              onPress={onOpenCreatePost}
            >
              <Ionicons name="add-circle" size={20} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.createPostCTAText}>Crear Publicación</Text>
            </TouchableOpacity>

            {/* Animated Companion Card (Para que el lado izquierdo no se vea vacío) */}
            <View style={styles.sidebarCompanionCard}>
              <View style={styles.sidebarCompanionMascotWrap}>
                <AnimaMascot size="sm" variant="full" animated={true} />
              </View>
              <View style={styles.sidebarCompanionContent}>
                <View style={styles.sidebarCompanionBadge}>
                  <Ionicons name="sparkles" size={10} color="#D97706" />
                  <Text style={styles.sidebarCompanionBadgeText}>Entre Nosotros</Text>
                </View>
                <Text style={styles.sidebarCompanionMsg}>
                  Tómate un respiro, no estás solo ✨
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Profile / Auth Strip */}
          <View style={styles.sidebarBottomStrip}>
            {user ? (
              <View style={styles.userStripRow}>
                <TouchableOpacity
                  style={styles.userStripProfile}
                  activeOpacity={0.8}
                  onPress={() => setActiveSection('perfil')}
                >
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.userStripAvatar}
                    resizeMode="cover"
                  />
                  <View style={styles.userStripTextCol}>
                    <Text style={styles.userStripName} numberOfLines={1}>
                      {user.username}
                    </Text>
                    <Text style={styles.userStripHandle}>Ver mi perfil</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutIconBtn}
                  onPress={onLogout}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Cerrar sesión"
                >
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.loginCTA}
                activeOpacity={0.85}
                onPress={onRequireAuth}
              >
                <Ionicons name="person-circle-outline" size={20} color={colors.coffeePrimary} style={{ marginRight: 8 }} />
                <Text style={styles.loginCTAText}>Iniciar Sesión / Unirse</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 2. CENTER COLUMN (Contenido Dinámico)                                      */}
        {/* ========================================================================= */}
        <View style={styles.centerColumn}>
          {isCreatePostOpen ? (
            <CreatePostScreen
              visible={true}
              onClose={onCloseCreatePost || (() => {})}
              onPostCreated={() => {
                if (onPostCreated) onPostCreated();
                if (onCloseCreatePost) onCloseCreatePost();
              }}
              embedded={true}
            />
          ) : viewingUserProfile ? (
            <UserProfileScreen
              visible={true}
              userId={viewingUserProfile.userId}
              initialUsername={viewingUserProfile.username}
              initialAvatarUrl={viewingUserProfile.avatarUrl}
              onClose={onCloseUserProfile || (() => {})}
              onCommentPress={onCommentPress}
              onRequireAuth={onRequireAuth}
              embedded={true}
            />
          ) : (
            <>
              {activeSection === 'principal' && (
                <View style={styles.feedWrapper}>
                  {/* Quick Post Prompt Card on Top of Feed */}
                  <View style={styles.quickPostCard}>
                    <TouchableOpacity
                      style={styles.quickPostAvatarWrap}
                      activeOpacity={0.8}
                      onPress={() => (user ? setActiveSection('perfil') : onRequireAuth())}
                    >
                      {user ? (
                        <Image
                          source={{ uri: user.avatarUrl }}
                          style={styles.quickPostAvatar}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.quickPostAvatarPlaceholder}>
                          <Ionicons name="person" size={18} color="#7F94A2" />
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickPostInputFake}
                      activeOpacity={0.85}
                      onPress={onOpenCreatePost}
                    >
                      <Text style={styles.quickPostPlaceholder}>
                        ¿Qué estás sintiendo hoy? Desahógate aquí...
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickPostPlusBtn}
                      activeOpacity={0.8}
                      onPress={onOpenCreatePost}
                    >
                      <Ionicons name="add" size={20} color={colors.white} />
                    </TouchableOpacity>
                  </View>

                  {/* Centered Feed List */}
                  <FeedList
                    onCommentPress={onCommentPress}
                    onRequireAuth={onRequireAuth}
                    onOptionsPress={onOptionsPress}
                    onEditPress={onEditPress}
                    onDeletePress={onDeletePress}
                    onUserPress={onUserPress}
                    onOpenMonthDetail={onOpenMonthDetail}
                    contentPaddingTop={6}
                    contentPaddingBottom={40}
                  />
                </View>
              )}

              {activeSection === 'psicologos' && (
                <PsychologistsScreen
                  onOpenMenu={() => {}}
                  onJoinPress={onRequireAuth}
                  onProfilePress={onOpenProfile}
                  hideAppHeader={true}
                  contentPaddingTop={12}
                  contentPaddingBottom={40}
                />
              )}

              {activeSection === 'blog' && (
                <BlogScreen
                  onOpenMenu={() => {}}
                  onJoinPress={onRequireAuth}
                  onProfilePress={onOpenProfile}
                  onOpenPsychologists={() => setActiveSection('psicologos')}
                  hideAppHeader={true}
                  contentPaddingTop={12}
                  contentPaddingBottom={40}
                />
              )}

              {activeSection === 'anima' && (
                <AnimaScreen
                  onOpenMenu={() => {}}
                  onJoinPress={onRequireAuth}
                  onProfilePress={onOpenProfile}
                  onOpenPsychologists={() => setActiveSection('psicologos')}
                  hideAppHeader={true}
                  contentPaddingTop={0}
                  contentPaddingBottom={0}
                />
              )}

              {activeSection === 'buscar' && (
                <SearchScreen
                  onCommentPress={onCommentPress}
                  onRequireAuth={onRequireAuth}
                  onOptionsPress={onOptionsPress}
                  onEditPress={onEditPress}
                  onDeletePress={onDeletePress}
                  onUserPress={onUserPress}
                  contentPaddingTop={12}
                  contentPaddingBottom={40}
                />
              )}

              {activeSection === 'perfil' && (
                <ProfileScreen
                  visible={true}
                  onClose={() => setActiveSection('principal')}
                  onRequireAuth={onRequireAuth}
                  onOpenPsychologists={() => setActiveSection('psicologos')}
                  onOpenCreatePost={onOpenCreatePost}
                  embedded={true}
                />
              )}

              {activeSection === 'reglas' && (
                <RulesScreen
                  onOpenMenu={() => {}}
                  onJoinPress={onRequireAuth}
                  onProfilePress={onOpenProfile}
                  onOpenPsychologists={() => setActiveSection('psicologos')}
                  hideAppHeader={true}
                  contentPaddingTop={12}
                  contentPaddingBottom={40}
                />
              )}

              {activeSection === 'ayuda' && (
                <SupportScreen
                  onOpenMenu={() => {}}
                  onJoinPress={onRequireAuth}
                  onProfilePress={onOpenProfile}
                  onOpenPsychologists={() => setActiveSection('psicologos')}
                  onOpenCreatePost={onOpenCreatePost}
                  hideAppHeader={true}
                  contentPaddingTop={12}
                  contentPaddingBottom={40}
                />
              )}
            </>
          )}
        </View>

        {/* ========================================================================= */}
        {/* 3. RIGHT SIDEBAR (Recuadros Fijos Siempre Presentes)                       */}
        {/* ========================================================================= */}
        <View style={styles.rightSidebar}>
          <ScrollView
            style={styles.rightSidebarScroll}
            contentContainerStyle={styles.rightSidebarScrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* ------------------------------------------------------------- */}
            {/* RECUADRO 1: PERFIL DE USUARIO                                 */}
            {/* ------------------------------------------------------------- */}
            {user ? (
              <View style={styles.widgetCard}>
                {/* Cover Banner with Real Image or Fallback */}
                {(() => {
                  const activeCoverUrl = liveUserData.coverPhotoUrl || user.coverPhotoUrl;
                  const activeAvatarUrl = liveUserData.avatarUrl || user.avatarUrl;
                  return (
                    <>
                      <View style={styles.profileCardHeaderBanner}>
                        {activeCoverUrl ? (
                          <Image
                            source={{ uri: activeCoverUrl }}
                            style={styles.profileCardCoverImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.profileCardCoverPlaceholder}>
                            <Ionicons name="sparkles" size={20} color="rgba(255, 255, 255, 0.6)" />
                          </View>
                        )}
                        <View style={styles.profileCardCoverOverlay} />
                      </View>

                      <View style={styles.profileCardBody}>
                        {/* Large Profile Picture with Border */}
                        <TouchableOpacity
                          style={styles.profileAvatarWrapper}
                          activeOpacity={0.85}
                          onPress={() => setActiveSection('perfil')}
                        >
                          <Image
                            source={{ uri: activeAvatarUrl }}
                            style={styles.profileAvatarLarge}
                            resizeMode="cover"
                          />
                          <View style={styles.profileBadgeDot}>
                            <Ionicons name="checkmark" size={10} color={colors.white} />
                          </View>
                        </TouchableOpacity>

                        {/* Name and Handle */}
                        <Text style={styles.profileCardName} numberOfLines={1}>
                          {user.username}
                        </Text>
                        <Text style={styles.profileCardEmail} numberOfLines={1}>
                          {user.email}
                        </Text>
                        {user.bio ? (
                          <Text style={styles.profileCardBio} numberOfLines={2}>
                            {user.bio}
                          </Text>
                        ) : null}

                        {/* Followers & Following Stats */}
                        <View style={styles.profileStatsRow}>
                          <TouchableOpacity
                            style={styles.profileStatItem}
                            activeOpacity={0.7}
                            onPress={handleOpenFollowing}
                          >
                            <Text style={styles.profileStatNumber}>
                              {liveUserData.followingCount ?? 0}
                            </Text>
                            <Text style={styles.profileStatLabel}>Seguidos</Text>
                          </TouchableOpacity>

                          <View style={styles.profileStatDivider} />

                          <TouchableOpacity
                            style={styles.profileStatItem}
                            activeOpacity={0.7}
                            onPress={handleOpenFollowers}
                          >
                            <Text style={styles.profileStatNumber}>
                              {liveUserData.followersCount ?? 0}
                            </Text>
                            <Text style={styles.profileStatLabel}>Seguidores</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Action button */}
                        <TouchableOpacity
                          style={styles.viewFullProfileBtn}
                          activeOpacity={0.8}
                          onPress={() => setActiveSection('perfil')}
                        >
                          <Text style={styles.viewFullProfileBtnText}>Ver mi perfil completo</Text>
                          <Ionicons name="arrow-forward" size={14} color={colors.coffeePrimary} />
                        </TouchableOpacity>
                      </View>
                    </>
                  );
                })()}
              </View>
            ) : (
              <View style={styles.widgetCard}>
                <View style={styles.guestCardBody}>
                  <View style={styles.guestIconCircle}>
                    <Ionicons name="people" size={28} color={colors.coffeePrimary} />
                  </View>
                  <Text style={styles.guestTitle}>Únete a Entre Nosotros</Text>
                  <Text style={styles.guestSubtitle}>
                    Un espacio seguro para compartir tus emociones, seguir a otros miembros y cuidar tu bienestar mental.
                  </Text>
                  <TouchableOpacity
                    style={styles.guestLoginBtn}
                    activeOpacity={0.85}
                    onPress={onRequireAuth}
                  >
                    <Text style={styles.guestLoginBtnText}>Iniciar Sesión / Registrarse</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ------------------------------------------------------------- */}
            {/* RECUADRO 2: ACCESO A ANIMA                                    */}
            {/* ------------------------------------------------------------- */}
            <View style={styles.widgetCard}>
              <View style={styles.animaWidgetBody}>
                <View style={styles.animaWidgetTopRow}>
                  <Image
                    source={require('../../../assets/perfilANIMA.png')}
                    style={styles.animaAvatar}
                    resizeMode="cover"
                  />
                  <View style={styles.animaInfoCol}>
                    <View style={styles.animaTitleRow}>
                      <Text style={styles.animaTitle}>ANIMA</Text>
                      <View style={styles.animaLiveBadge}>
                        <View style={styles.animaGreenDot} />
                        <Text style={styles.animaLiveText}>En línea</Text>
                      </View>
                    </View>
                    <Text style={styles.animaSubtitle}>Acompañante Emocional 💙</Text>
                  </View>
                </View>

                {/* Friendly Speech Bubble */}
                <View style={styles.animaSpeechBubble}>
                  <Text style={styles.animaSpeechText}>
                    "Hola 🌱. Estoy aquí para escucharte sin juzgar, acompañarte y ayudarte a encontrar calma."
                  </Text>
                </View>

                {/* Direct Action Button */}
                <TouchableOpacity
                  style={[
                    styles.animaChatBtn,
                    activeSection === 'anima' && styles.animaChatBtnActive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setActiveSection('anima');
                    onTabPress('anima');
                  }}
                >
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={16}
                    color={activeSection === 'anima' ? colors.white : '#2C4656'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.animaChatBtnText,
                      activeSection === 'anima' && styles.animaChatBtnTextActive,
                    ]}
                  >
                    {activeSection === 'anima' ? 'Conversando ahora' : 'Chatear con ANIMA'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ------------------------------------------------------------- */}
            {/* RECUADRO 3: ¿CÓMO TE SIENTES HOY?                             */}
            {/* ------------------------------------------------------------- */}
            <View style={styles.widgetCard}>
              <View style={styles.moodWidgetBody}>
                <View style={styles.widgetHeaderRow}>
                  <View style={styles.widgetHeaderIconCircle}>
                    <Ionicons name="heart" size={14} color={colors.coffeePrimary} />
                  </View>
                  <View>
                    <Text style={styles.widgetTitle}>¿Cómo te sientes hoy?</Text>
                    <Text style={styles.widgetSubtitle}>Registra tu estado emocional</Text>
                  </View>
                </View>

                {/* Mood Grid with Cute Emojis */}
                <View style={styles.moodGrid}>
                  {MOOD_OPTIONS.map((mood) => {
                    const isSelected = selectedMoodId === mood.id;
                    return (
                      <TouchableOpacity
                        key={mood.id}
                        style={[
                          styles.moodChip,
                          isSelected && styles.moodChipSelected,
                        ]}
                        activeOpacity={0.75}
                        onPress={() => handleSelectMood(mood)}
                      >
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                        <Text
                          style={[
                            styles.moodLabel,
                            isSelected && styles.moodLabelSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {mood.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Supportive Feedback Message */}
                {moodFeedback && (
                  <View style={styles.moodFeedbackBox}>
                    <Ionicons name="sparkles" size={13} color="#2563EB" style={{ marginRight: 6, marginTop: 1 }} />
                    <Text style={styles.moodFeedbackText}>
                      {moodFeedback}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ------------------------------------------------------------- */}
            {/* RECUADRO 4: MENSAJE DE ANIMA (FRASE DEL DÍA)                   */}
            {/* ------------------------------------------------------------- */}
            <View style={styles.widgetCard}>
              <View style={styles.quoteWidgetBody}>
                <View style={styles.quoteHeaderRow}>
                  <View style={styles.quoteHeaderLeft}>
                    <Image
                      source={require('../../../assets/perfilANIMA.png')}
                      style={styles.quoteAnimaAvatar}
                      resizeMode="cover"
                    />
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.widgetTitle}>Mensaje de ANIMA</Text>
                        <Ionicons name="sparkles" size={12} color="#3B82F6" style={{ marginLeft: 3 }} />
                      </View>
                      <Text style={styles.quoteSubtitle}>Para acompañar tu día</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.quoteRefreshBtn}
                    onPress={() => setQuoteOffset((prev) => prev + 1)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Ver otra frase"
                  >
                    <Ionicons name="reload-outline" size={14} color="#5A7486" />
                  </TouchableOpacity>
                </View>

                {/* Quote Box */}
                <View style={styles.quoteMessageBox}>
                  <Text style={styles.quoteMessageText}>
                    "{currentQuoteText}"
                  </Text>
                  <View style={styles.quoteAuthorRow}>
                    <Image
                      source={require('../../../assets/perfilANIMA.png')}
                      style={styles.quoteAuthorMiniAvatar}
                      resizeMode="cover"
                    />
                    <Text style={styles.quoteAuthorText}>
                      — Con cariño, ANIMA 💙
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Visual Scroll Indicator Cue for Right Sidebar */}
          <View style={styles.rightScrollCue}>
            <Ionicons name="chevron-down" size={13} color="#64748B" />
            <Text style={styles.rightScrollCueText}>Desliza para ver más</Text>
          </View>
        </View>
      </View>

      {/* Persistent Follow List Modal on Desktop */}
      <FollowListModal
        visible={followModalVisible}
        userId={user?.id || null}
        username={user?.username}
        initialTab={followModalTab}
        onClose={() => setFollowModalVisible(false)}
        onUserPress={(targetId, targetUsername, targetAvatar) => {
          setFollowModalVisible(false);
          onUserPress(targetId, targetUsername, targetAvatar);
        }}
        onRequireAuth={onRequireAuth}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  desktopRoot: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web'
      ? ({
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
        } as any)
      : {}),
  },
  desktopColumnsContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
  },

  /* ------------------------------------------------------------- */
  /* LEFT SIDEBAR STYLES                                           */
  /* ------------------------------------------------------------- */
  leftSidebar: {
    width: 250,
    height: '100%',
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: '#E1EAEF',
    flexDirection: 'column',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  logoImage: {
    width: 175,
    height: 52,
  },
  sidebarSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F6F9',
    borderWidth: 1,
    borderColor: '#E1EAEF',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 34,
    marginBottom: 12,
  },
  sidebarSearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
    paddingVertical: 0,
  },
  navScroll: {
    flex: 1,
  },
  navList: {
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: '#E1EAEF',
  },
  navItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B6779',
    flex: 1,
  },
  navItemTextActive: {
    color: '#1E293B',
    fontWeight: '700',
  },
  navItemBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  navItemBadgeText: {
    color: colors.white,
    fontSize: 9.5,
    fontWeight: '800',
  },
  createPostCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#355971',
    borderRadius: 12,
    paddingVertical: 9,
    marginTop: 14,
    marginBottom: 10,
    shadowColor: '#355971',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 2.5,
  },
  createPostCTAText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
  sidebarCompanionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 10,
    marginTop: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sidebarCompanionMascotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarCompanionContent: {
    flex: 1,
  },
  sidebarCompanionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  sidebarCompanionBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sidebarCompanionMsg: {
    fontSize: 11,
    lineHeight: 15,
    color: '#0369A1',
    fontWeight: '600',
  },
  sidebarBottomStrip: {
    borderTopWidth: 1,
    borderTopColor: '#E1EAEF',
    paddingTop: 10,
  },
  userStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userStripProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  userStripAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E1EAEF',
    marginRight: 8,
  },
  userStripTextCol: {
    flex: 1,
  },
  userStripName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  userStripHandle: {
    fontSize: 10.5,
    color: '#64748B',
  },
  logoutIconBtn: {
    padding: 5,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  loginCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F6F9',
    borderWidth: 1,
    borderColor: '#E1EAEF',
    borderRadius: 10,
    paddingVertical: 8,
  },
  loginCTAText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },

  /* ------------------------------------------------------------- */
  /* CENTER COLUMN STYLES                                          */
  /* ------------------------------------------------------------- */
  centerColumn: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: '#E1EAEF',
    overflow: 'hidden',
  },
  feedWrapper: {
    flex: 1,
    width: '100%',
  },
  quickPostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E1EAEF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  quickPostAvatarWrap: {},
  quickPostAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E1EAEF',
  },
  quickPostAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F6F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPostInputFake: {
    flex: 1,
    backgroundColor: '#F0F6F9',
    borderWidth: 1,
    borderColor: '#E1EAEF',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  quickPostPlaceholder: {
    fontSize: 12,
    color: '#7F94A2',
  },
  quickPostPlusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#355971',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ------------------------------------------------------------- */
  /* RIGHT SIDEBAR STYLES (Tope al Borde Derecho)                  */
  /* ------------------------------------------------------------- */
  rightSidebar: {
    width: 380,
    height: '100%',
    backgroundColor: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
  },
  rightSidebarScroll: {
    flex: 1,
  },
  rightSidebarScrollContent: {
    padding: 10,
    gap: 10,
    paddingBottom: 16,
  },
  rightScrollCue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderTopColor: '#E1EAEF',
  },
  rightScrollCueText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  widgetCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1EAEF',
    overflow: 'hidden',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1.5,
  },

  /* Widget 1: Profile Card */
  profileCardHeaderBanner: {
    height: 95,
    backgroundColor: '#355971',
    position: 'relative',
    overflow: 'hidden',
  },
  profileCardCoverImage: {
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' ? ({ objectFit: 'cover' } as any) : {}),
  },
  profileCardCoverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#355971',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCardCoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  profileCardBody: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    alignItems: 'center',
    marginTop: -26,
  },
  profileAvatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  profileAvatarLarge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: '#F0F6F9',
    ...(Platform.OS === 'web' ? ({ objectFit: 'cover' } as any) : {}),
  },
  profileBadgeDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCardName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  profileCardEmail: {
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileCardBio: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1EAEF',
    width: '100%',
    paddingVertical: 5,
    marginVertical: 6,
  },
  profileStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatNumber: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileStatLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  profileStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E1EAEF',
  },
  viewFullProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    width: '100%',
    backgroundColor: '#F0F6F9',
    borderWidth: 1,
    borderColor: '#E1EAEF',
    borderRadius: 8,
    paddingVertical: 6,
  },
  viewFullProfileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },

  /* Guest Profile Card */
  guestCardBody: {
    padding: 14,
    alignItems: 'center',
  },
  guestIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1EAEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  guestTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  guestSubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 10,
  },
  guestLoginBtn: {
    backgroundColor: '#355971',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    width: '100%',
    alignItems: 'center',
  },
  guestLoginBtnText: {
    color: colors.white,
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Widget 2: ANIMA */
  animaWidgetBody: {
    padding: 11,
  },
  animaWidgetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  animaAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    marginRight: 8,
    ...(Platform.OS === 'web' ? ({ objectFit: 'cover' } as any) : {}),
  },
  animaInfoCol: {
    flex: 1,
  },
  animaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  animaTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  animaLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  animaGreenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  animaLiveText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  animaSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
  },
  animaSpeechBubble: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 8,
    marginBottom: 8,
  },
  animaSpeechText: {
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 15,
    fontStyle: 'italic',
  },
  animaChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  animaChatBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  animaChatBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0369A1',
  },
  animaChatBtnTextActive: {
    color: colors.white,
  },

  /* Widget 3: Mood Tracker */
  moodWidgetBody: {
    padding: 11,
  },
  widgetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  widgetHeaderIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  widgetSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  moodChip: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E1EAEF',
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  moodChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  moodEmoji: {
    fontSize: 16,
    marginBottom: 1,
  },
  moodLabel: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '600',
  },
  moodLabelSelected: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  moodFeedbackBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    padding: 6,
    marginTop: 6,
  },
  moodFeedbackText: {
    fontSize: 10,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 14,
  },

  /* Widget 4: Frase de ANIMA */
  quoteWidgetBody: {
    padding: 11,
  },
  quoteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quoteHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quoteAnimaAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  quoteSubtitle: {
    fontSize: 9.5,
    color: '#3B82F6',
    fontWeight: '600',
  },
  quoteRefreshBtn: {
    padding: 3,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
  },
  quoteMessageBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 10,
    padding: 9,
  },
  quoteMessageText: {
    fontSize: 11,
    color: '#1E3A8A',
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 6,
  },
  quoteAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
  },
  quoteAuthorMiniAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  quoteAuthorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
});
