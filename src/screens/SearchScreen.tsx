import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Post } from '../types/post';
import { UserProfile } from '../types/auth';
import { PostCard } from '../components/Feed/PostCard';
import {
  getRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearAllRecentSearches,
  executeUniversalSearch,
  fetchRecommendedContent,
  SearchResults,
  RecommendedContent,
} from '../services/searchService';
import { useAuth } from '../context/AuthContext';

interface SearchScreenProps {
  onCommentPress: (post: Post) => void;
  onRequireAuth: () => void;
  onOptionsPress?: (post: Post) => void;
  onEditPress?: (post: Post) => void;
  onDeletePress?: (post: Post) => void;
  onUserPress?: (userId: string, username: string, avatarUrl: string) => void;
  onOpenMenu?: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

type FilterCategory = 'all' | 'posts' | 'users' | 'hashtags';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onCommentPress,
  onRequireAuth,
  onOptionsPress,
  onEditPress,
  onDeletePress,
  onUserPress,
  onOpenMenu,
  contentPaddingTop = 8,
  contentPaddingBottom = 80,
}) => {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedContent>({
    trendingHashtags: [],
    suggestedUsers: [],
    recommendedPosts: [],
  });
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const searchInputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data (recent searches + recommendations)
  useEffect(() => {
    loadRecentSearches();
    loadRecommendations();
  }, []);

  const loadRecentSearches = async () => {
    const list = await getRecentSearches();
    setRecentSearches(list);
  };

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    const data = await fetchRecommendedContent();
    setRecommendations(data);
    setLoadingRecommendations(false);
  };

  // Perform search
  const performSearch = async (queryText: string, saveToHistory = true) => {
    const term = queryText.trim();
    if (!term) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (saveToHistory) {
      const updated = await saveRecentSearch(term);
      setRecentSearches(updated);
    }

    const results = await executeUniversalSearch(term);
    setSearchResults(results);
    setIsSearching(false);
  };

  // Debounced auto-search when typing
  const handleQueryChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text, false);
    }, 380);
  };

  // Handle submit (press enter/search key)
  const handleSubmitEditing = () => {
    if (searchQuery.trim()) {
      Keyboard.dismiss();
      performSearch(searchQuery, true);
    }
  };

  // Select a recent search term
  const handleSelectRecent = (term: string) => {
    setSearchQuery(term);
    performSearch(term, true);
  };

  // Delete individual recent search
  const handleRemoveRecent = async (term: string) => {
    const updated = await removeRecentSearch(term);
    setRecentSearches(updated);
  };

  // Clear all recent searches
  const handleClearAllRecents = async () => {
    await clearAllRecentSearches();
    setRecentSearches([]);
  };

  // Select a hashtag recommendation
  const handleSelectHashtag = (tag: string) => {
    setSearchQuery(tag);
    performSearch(tag, true);
  };

  // Select a suggested user
  const handleSelectUser = (suggestedUser: UserProfile) => {
    if (onUserPress) {
      onUserPress(suggestedUser.id, suggestedUser.username, suggestedUser.avatarUrl);
    } else {
      const query = `@${suggestedUser.username}`;
      setSearchQuery(query);
      performSearch(query, true);
    }
  };

  // Clear search bar
  const handleClearInput = () => {
    setSearchQuery('');
    setSearchResults(null);
    setIsSearching(false);
    searchInputRef.current?.focus();
  };

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Search Bar Header */}
      <View style={[styles.headerContainer, { paddingTop: contentPaddingTop }]}>
        <View style={styles.searchBarRow}>
          {onOpenMenu ? (
            <TouchableOpacity
              onPress={onOpenMenu}
              style={styles.menuButton}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="menu-outline" size={26} color={colors.coffeeDark} />
            </TouchableOpacity>
          ) : null}

          <View style={styles.searchBarWrapper}>
            <Ionicons name="search" size={18} color={colors.coffeePrimary} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Buscar usuarios, #hashtags o posts..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={handleQueryChange}
              onSubmitEditing={handleSubmitEditing}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {hasQuery ? (
              <TouchableOpacity onPress={handleClearInput} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={19} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter Category Chips (Active when search query exists) */}
        {hasQuery && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScrollView}
            contentContainerStyle={styles.filtersRow}
          >
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
              onPress={() => setActiveFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
                Todos ({searchResults?.totalCount || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'posts' && styles.filterChipActive]}
              onPress={() => setActiveFilter('posts')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="document-text-outline"
                size={13}
                color={activeFilter === 'posts' ? colors.white : colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.filterChipText, activeFilter === 'posts' && styles.filterChipTextActive]}>
                Publicaciones ({searchResults?.posts.length || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'users' && styles.filterChipActive]}
              onPress={() => setActiveFilter('users')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="people-outline"
                size={13}
                color={activeFilter === 'users' ? colors.white : colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.filterChipText, activeFilter === 'users' && styles.filterChipTextActive]}>
                Usuarios ({searchResults?.users.length || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'hashtags' && styles.filterChipActive]}
              onPress={() => setActiveFilter('hashtags')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="pricetag-outline"
                size={13}
                color={activeFilter === 'hashtags' ? colors.white : colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.filterChipText, activeFilter === 'hashtags' && styles.filterChipTextActive]}>
                Hashtags ({searchResults?.hashtags.length || 0})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentPaddingBottom + 30 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Loading Indicator */}
        {isSearching ? (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="small" color={colors.coffeePrimary} />
            <Text style={styles.searchingText}>Buscando en la comunidad...</Text>
          </View>
        ) : hasQuery && searchResults ? (
          /* Search Results View */
          <View style={styles.resultsContainer}>
            {searchResults.totalCount === 0 ? (
              /* Empty Search State */
              <View style={styles.emptyResultsWrapper}>
                <Ionicons name="search-outline" size={44} color={colors.borderMedium} />
                <Text style={styles.emptyResultsTitle}>Sin resultados</Text>
                <Text style={styles.emptyResultsSubtitle}>
                  No encontramos coincidencias para "{searchQuery}". Intenta con otros términos o revisa los temas sugeridos.
                </Text>
              </View>
            ) : (
              <>
                {/* 1. Users Results */}
                {(activeFilter === 'all' || activeFilter === 'users') && searchResults.users.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Usuarios</Text>
                      <Text style={styles.sectionBadge}>{searchResults.users.length}</Text>
                    </View>
                    <View style={styles.usersList}>
                      {searchResults.users.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.userCard}
                          onPress={() => handleSelectUser(item)}
                          activeOpacity={0.7}
                        >
                          <Image source={{ uri: item.avatarUrl }} style={styles.userCardAvatar} />
                          <View style={styles.userCardInfo}>
                            <Text style={styles.userCardName}>@{item.username}</Text>
                            {item.bio ? (
                              <Text numberOfLines={1} style={styles.userCardBio}>
                                {item.bio}
                              </Text>
                            ) : null}
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* 2. Hashtags Results */}
                {(activeFilter === 'all' || activeFilter === 'hashtags') && searchResults.hashtags.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Temas y Hashtags</Text>
                      <Text style={styles.sectionBadge}>{searchResults.hashtags.length}</Text>
                    </View>
                    <View style={styles.tagsWrapRow}>
                      {searchResults.hashtags.map((item, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.tagResultChip}
                          onPress={() => handleSelectHashtag(item.tag)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.tagResultChipHash}>#</Text>
                          <Text style={styles.tagResultChipText}>{item.tag.replace(/^#/, '')}</Text>
                          <View style={styles.tagResultCountBadge}>
                            <Text style={styles.tagResultCountText}>{item.count}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* 3. Posts Results */}
                {(activeFilter === 'all' || activeFilter === 'posts') && searchResults.posts.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Publicaciones</Text>
                      <Text style={styles.sectionBadge}>{searchResults.posts.length}</Text>
                    </View>
                    <View style={styles.postsList}>
                      {searchResults.posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onCommentPress={onCommentPress}
                          onRequireAuth={onRequireAuth}
                          onOptionsPress={onOptionsPress}
                          onEditPress={onEditPress}
                          onDeletePress={onDeletePress}
                          onUserPress={onUserPress}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          /* Default State: Recent Searches & Recommendations */
          <View style={styles.defaultContainer}>
            {/* 1. Recent Searches (Stored Locally) */}
            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeaderBetween}>
                  <View style={styles.recentTitleRow}>
                    <Ionicons name="time-outline" size={16} color={colors.coffeePrimary} style={{ marginRight: 6 }} />
                    <Text style={styles.sectionTitle}>Búsquedas recientes</Text>
                  </View>
                  <TouchableOpacity onPress={handleClearAllRecents} activeOpacity={0.7}>
                    <Text style={styles.clearAllText}>Borrar todo</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.recentChipsContainer}>
                  {recentSearches.map((term, index) => (
                    <View key={index} style={styles.recentChip}>
                      <TouchableOpacity
                        style={styles.recentChipTouch}
                        onPress={() => handleSelectRecent(term)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="search-outline" size={13} color={colors.textMuted} style={{ marginRight: 5 }} />
                        <Text style={styles.recentChipText} numberOfLines={1}>
                          {term}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.recentRemoveBtn}
                        onPress={() => handleRemoveRecent(term)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name="close" size={14} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 2. Trending Hashtags Recommendations */}
            <View style={styles.recommendationSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up-outline" size={16} color={colors.coffeePrimary} style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Temas en tendencia</Text>
              </View>
              <View style={styles.tagsWrapRow}>
                {recommendations.trendingHashtags.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.trendingTagChip}
                    onPress={() => handleSelectHashtag(item.tag)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.trendingTagText}>{item.tag}</Text>
                    <Text style={styles.trendingTagCount}>{item.count} posts</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 3. Suggested Users */}
            {recommendations.suggestedUsers.length > 0 && (
              <View style={styles.recommendationSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="people-outline" size={16} color={colors.coffeePrimary} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Personas de la comunidad</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.usersHorizontalRow}
                >
                  {recommendations.suggestedUsers.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.userCardSmall}
                      onPress={() => handleSelectUser(item)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: item.avatarUrl }} style={styles.userCardSmallAvatar} />
                      <Text numberOfLines={1} style={styles.userCardSmallName}>
                        @{item.username}
                      </Text>
                      <Text numberOfLines={1} style={styles.userCardSmallBio}>
                        {item.bio || 'Miembro de Entre Nosotros'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 4. Recommended / Popular Community Posts */}
            {recommendations.recommendedPosts.length > 0 && (
              <View style={styles.recommendationSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="sparkles-outline" size={16} color={colors.coffeePrimary} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Publicaciones destacadas</Text>
                </View>
                <View style={styles.postsList}>
                  {recommendations.recommendedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onCommentPress={onCommentPress}
                      onRequireAuth={onRequireAuth}
                      onOptionsPress={onOptionsPress}
                      onEditPress={onEditPress}
                      onDeletePress={onDeletePress}
                      onUserPress={onUserPress}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE6',
    zIndex: 10,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 10,
    padding: 2,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE8E1',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 2,
  },
  filtersScrollView: {
    marginTop: 10,
  },
  filtersRow: {
    gap: 8,
    paddingRight: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5EFEA',
  },
  filterChipActive: {
    backgroundColor: colors.coffeePrimary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.coffeeDark,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  scrollContent: {
    paddingTop: 14,
  },
  searchingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  searchingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  // Default View (Recents & Recommendations)
  defaultContainer: {
    paddingHorizontal: 16,
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A85C52',
  },
  recentChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F5',
    borderWidth: 1,
    borderColor: '#EFE8E1',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
  },
  recentChipTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.6,
  },
  recentChipText: {
    fontSize: 12.5,
    color: colors.coffeeDark,
    fontWeight: '500',
  },
  recentRemoveBtn: {
    padding: 3,
    marginLeft: 4,
  },
  recommendationSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionBadge: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffeePrimary,
    backgroundColor: '#F5EFEA',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tagsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingTagChip: {
    backgroundColor: '#FAF7F5',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trendingTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  trendingTagCount: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  usersHorizontalRow: {
    gap: 12,
    paddingRight: 10,
  },
  userCardSmall: {
    width: 120,
    backgroundColor: '#FAF7F5',
    borderWidth: 1,
    borderColor: '#EFE8E1',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  userCardSmallAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 8,
    backgroundColor: '#E5DFD9',
  },
  userCardSmallName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.coffeeDeep,
    textAlign: 'center',
    marginBottom: 2,
  },
  userCardSmallBio: {
    fontSize: 10.5,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // Results View
  resultsContainer: {},
  sectionBlock: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  usersList: {
    gap: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F5',
    borderWidth: 1,
    borderColor: '#EFE8E1',
    borderRadius: 14,
    padding: 10,
  },
  userCardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#E5DFD9',
  },
  userCardInfo: {
    flex: 1,
  },
  userCardName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  userCardBio: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  tagResultChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagResultChipHash: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3B79BA',
    marginRight: 2,
  },
  tagResultChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B5A8F',
  },
  tagResultCountBadge: {
    backgroundColor: 'rgba(59, 121, 186, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  tagResultCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2B5A8F',
  },
  postsList: {
    marginTop: 4,
    marginHorizontal: -16,
  },
  emptyResultsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
    gap: 8,
  },
  emptyResultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginTop: 6,
  },
  emptyResultsSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
});
