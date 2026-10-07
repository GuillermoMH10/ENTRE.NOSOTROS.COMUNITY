import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { AppHeader } from '../components/Header/AppHeader';
import { BottomTabBar, TabId } from '../components/Navigation/BottomTabBar';
import { FeedList } from '../components/Feed/FeedList';
import { HamburgerMenu } from '../components/Drawer/HamburgerMenu';
import { AuthScreen } from './AuthScreen';
import { ProfileScreen } from './ProfileScreen';
import { CreatePostScreen } from './CreatePostScreen';
import { CommentsScreen } from './CommentsScreen';
import { EditPostModal } from '../components/Feed/EditPostModal';
import { PostOptionsModal } from '../components/Feed/PostOptionsModal';
import { SearchScreen } from './SearchScreen';
import { BlogScreen } from './BlogScreen';
import { PsychologistsScreen } from './PsychologistsScreen';
import { RulesScreen } from './RulesScreen';
import { SupportScreen } from './SupportScreen';
import { UserProfileScreen } from './UserProfileScreen';
import { MonthDetailModal } from '../components/Blog/MonthDetailModal';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';
import { deletePost } from '../services/postsService';
import { colors } from '../theme/colors';

const HEADER_HEIGHT = 56;
const TABBAR_HEIGHT = 64;

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>('principal');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPsychologistsOpen, setIsPsychologistsOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(new Date().getMonth());
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [selectedPostForOptions, setSelectedPostForOptions] = useState<Post | null>(null);
  const [selectedPostForEdit, setSelectedPostForEdit] = useState<Post | null>(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<{
    userId: string;
    username?: string;
    avatarUrl?: string;
  } | null>(null);

  // Animated bars offset
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const isBarsHidden = useRef(false);

  const handleOpenMenu = () => setIsMenuOpen(true);
  const handleCloseMenu = () => setIsMenuOpen(false);

  const handleOpenAuth = () => setIsAuthOpen(true);
  const handleCloseAuth = () => setIsAuthOpen(false);

  const handleOpenProfile = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setIsProfileOpen(true);
    }
  };
  const handleCloseProfile = () => setIsProfileOpen(false);

  const handleOpenPsychologists = () => {
    setIsRulesOpen(false);
    setIsPsychologistsOpen(true);
  };
  const handleClosePsychologists = () => {
    setIsPsychologistsOpen(false);
  };

  const handleOpenRules = () => {
    setIsPsychologistsOpen(false);
    setIsRulesOpen(true);
  };
  const handleCloseRules = () => {
    setIsRulesOpen(false);
  };

  // Handle scroll direction change to collapse or show bars
  const handleScrollDirectionChange = (direction: 'up' | 'down') => {
    if (direction === 'down' && !isBarsHidden.current) {
      isBarsHidden.current = true;
      Animated.parallel([
        Animated.timing(headerTranslateY, {
          toValue: -(HEADER_HEIGHT + 30),
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(tabBarTranslateY, {
          toValue: TABBAR_HEIGHT + 30,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (direction === 'up' && isBarsHidden.current) {
      isBarsHidden.current = false;
      Animated.parallel([
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(tabBarTranslateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Tab navigation handler
  const handleTabPress = (tabId: TabId) => {
    setIsPsychologistsOpen(false);
    setIsRulesOpen(false);
    setActiveTab(tabId);
    if (tabId === 'crear') {
      if (!user) {
        setIsAuthOpen(true);
      } else {
        setIsCreateOpen(true);
      }
    }
  };

  // Open comments for a specific post
  const handleCommentPress = (post: Post) => {
    setSelectedPostForComments(post);
  };

  const handleCloseComments = () => {
    setSelectedPostForComments(null);
  };

  const handlePostCreated = () => {
    setActiveTab('principal');
  };

  // Delete post handler
  const handleDeletePost = async (post: Post) => {
    await deletePost(post.id);
  };

  // Open user profile
  const handleOpenUserProfile = (userId: string, username?: string, avatarUrl?: string) => {
    if (user && user.id === userId) {
      setIsProfileOpen(true);
    } else {
      setSelectedUserForProfile({ userId, username, avatarUrl });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
      />
      <View style={styles.container}>
        {/* Animated Top Header (Collapses up on scroll down) - Only in Principal tab */}
        {activeTab === 'principal' && !isRulesOpen && !isPsychologistsOpen && (
          <Animated.View
            style={[
              styles.animatedHeaderWrapper,
              { transform: [{ translateY: headerTranslateY }] },
            ]}
          >
            <AppHeader
              onOpenMenu={handleOpenMenu}
              onJoinPress={handleOpenAuth}
              onProfilePress={handleOpenProfile}
            />
          </Animated.View>
        )}

        {/* Tab Content: Reglas vs Psicólogos vs Buscar vs Blog vs Principal Feed */}
        {isRulesOpen ? (
          <RulesScreen
            onOpenMenu={handleOpenMenu}
            onJoinPress={handleOpenAuth}
            onProfilePress={handleOpenProfile}
            onOpenPsychologists={handleOpenPsychologists}
            contentPaddingTop={0}
            contentPaddingBottom={TABBAR_HEIGHT + (Platform.OS === 'ios' ? 14 : 4)}
          />
        ) : isPsychologistsOpen ? (
          <PsychologistsScreen
            onOpenMenu={handleOpenMenu}
            onJoinPress={handleOpenAuth}
            onProfilePress={handleOpenProfile}
            contentPaddingTop={0}
            contentPaddingBottom={TABBAR_HEIGHT + (Platform.OS === 'ios' ? 14 : 4)}
          />
        ) : activeTab === 'buscar' ? (
          <SearchScreen
            onCommentPress={handleCommentPress}
            onRequireAuth={handleOpenAuth}
            onOptionsPress={(post) => setSelectedPostForOptions(post)}
            onEditPress={(post) => setSelectedPostForEdit(post)}
            onDeletePress={handleDeletePost}
            onUserPress={handleOpenUserProfile}
            onOpenMenu={handleOpenMenu}
            contentPaddingTop={10}
            contentPaddingBottom={TABBAR_HEIGHT + (Platform.OS === 'ios' ? 14 : 4)}
          />
        ) : activeTab === 'blog' ? (
          <BlogScreen
            onOpenMenu={handleOpenMenu}
            onJoinPress={handleOpenAuth}
            onProfilePress={handleOpenProfile}
            onOpenPsychologists={handleOpenPsychologists}
            contentPaddingTop={0}
            contentPaddingBottom={TABBAR_HEIGHT + (Platform.OS === 'ios' ? 14 : 4)}
          />
        ) : activeTab === 'ayuda' ? (
          <SupportScreen
            onOpenMenu={handleOpenMenu}
            onJoinPress={handleOpenAuth}
            onProfilePress={handleOpenProfile}
            onOpenPsychologists={handleOpenPsychologists}
            onOpenCreatePost={() => {
              if (!user) {
                setIsAuthOpen(true);
              } else {
                setIsCreateOpen(true);
              }
            }}
            contentPaddingTop={0}
            contentPaddingBottom={TABBAR_HEIGHT + (Platform.OS === 'ios' ? 14 : 4)}
          />
        ) : (
          <FeedList
            onCommentPress={handleCommentPress}
            onRequireAuth={handleOpenAuth}
            onOptionsPress={(post) => setSelectedPostForOptions(post)}
            onEditPress={(post) => setSelectedPostForEdit(post)}
            onDeletePress={handleDeletePost}
            onUserPress={handleOpenUserProfile}
            onScrollDirectionChange={handleScrollDirectionChange}
            onOpenMonthDetail={(monthIdx) => {
              setSelectedMonthIndex(monthIdx);
              setIsMonthModalOpen(true);
            }}
            contentPaddingTop={HEADER_HEIGHT + (Platform.OS === 'android' ? 4 : 2)}
            contentPaddingBottom={TABBAR_HEIGHT + (Platform.OS === 'ios' ? 14 : 4)}
          />
        )}

        {/* Animated Bottom Tab Bar (Collapses down on scroll down) */}
        <Animated.View
          style={[
            styles.animatedTabBarWrapper,
            { transform: [{ translateY: tabBarTranslateY }] },
          ]}
        >
          <BottomTabBar
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        </Animated.View>

        {/* Sliding Hamburger Drawer */}
        <HamburgerMenu
          visible={isMenuOpen}
          onClose={handleCloseMenu}
          onNavigate={handleTabPress}
          onOpenProfile={handleOpenProfile}
          onOpenPsychologists={handleOpenPsychologists}
          onOpenRules={handleOpenRules}
          onRequireAuth={handleOpenAuth}
        />

        {/* Authentication Modal (Login & Register) */}
        <AuthScreen visible={isAuthOpen} onClose={handleCloseAuth} />

        {/* User Profile Screen (Full Screen) */}
        <ProfileScreen
          visible={isProfileOpen}
          onClose={handleCloseProfile}
          onRequireAuth={handleOpenAuth}
          onOpenPsychologists={handleOpenPsychologists}
          onOpenCreatePost={() => {
            if (!user) {
              setIsAuthOpen(true);
            } else {
              setIsCreateOpen(true);
            }
          }}
        />

        {/* Create Post Screen (Desahógate, este es tu espacio) */}
        <CreatePostScreen
          visible={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setActiveTab('principal');
          }}
          onPostCreated={handlePostCreated}
        />

        {/* Comments Screen (Dejar unas palabras) */}
        <CommentsScreen
          visible={!!selectedPostForComments}
          post={selectedPostForComments}
          onClose={handleCloseComments}
          onRequireAuth={handleOpenAuth}
        />

        {/* Post Options Bottom Sheet (Edit & Delete for Author) */}
        <PostOptionsModal
          visible={selectedPostForOptions !== null}
          post={selectedPostForOptions}
          onClose={() => setSelectedPostForOptions(null)}
          onEdit={(post) => setSelectedPostForEdit(post)}
          onDelete={handleDeletePost}
        />

        {/* Edit Post Modal (Directly in Home Feed) */}
        <EditPostModal
          visible={selectedPostForEdit !== null}
          post={selectedPostForEdit}
          onClose={() => setSelectedPostForEdit(null)}
        />

        {/* Other User Profile Screen (Shows ONLY their posts) */}
        <UserProfileScreen
          visible={selectedUserForProfile !== null}
          userId={selectedUserForProfile?.userId || null}
          initialUsername={selectedUserForProfile?.username}
          initialAvatarUrl={selectedUserForProfile?.avatarUrl}
          onClose={() => setSelectedUserForProfile(null)}
          onCommentPress={handleCommentPress}
          onRequireAuth={handleOpenAuth}
        />

        {/* Monthly Awareness & Psychology Calendar Modal */}
        <MonthDetailModal
          visible={isMonthModalOpen}
          initialMonthIndex={selectedMonthIndex}
          onClose={() => setIsMonthModalOpen(false)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    position: 'relative',
    overflow: 'hidden',
  },
  animatedHeaderWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colors.white,
  },
  animatedTabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colors.white,
  },
});
