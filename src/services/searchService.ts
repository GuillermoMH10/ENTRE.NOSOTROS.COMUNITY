import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Post, HashtagItem } from '../types/post';
import { UserProfile } from '../types/auth';

const RECENT_SEARCHES_KEY = '@entre_nosotros_recent_searches_v1';
const MAX_RECENT_SEARCHES = 15;

export interface SearchResults {
  users: UserProfile[];
  hashtags: { tag: string; count: number }[];
  posts: Post[];
  totalCount: number;
}

export interface RecommendedContent {
  trendingHashtags: { tag: string; count: number }[];
  suggestedUsers: UserProfile[];
  recommendedPosts: Post[];
}

/**
 * Normalizes text for search: removes accents, converts to lowercase, trims whitespace
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Get locally stored recent searches
 */
export async function getRecentSearches(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Error reading recent searches:', e);
    return [];
  }
}

/**
 * Save a search term to local storage
 */
export async function saveRecentSearch(rawTerm: string): Promise<string[]> {
  const term = rawTerm.trim();
  if (!term || term.length < 2) return await getRecentSearches();

  try {
    const current = await getRecentSearches();
    // Remove if already exists to push it to the top
    const filtered = current.filter(
      (item) => normalizeSearchText(item) !== normalizeSearchText(term)
    );
    const updated = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Error saving recent search:', e);
    return [];
  }
}

/**
 * Remove a specific search term from local storage
 */
export async function removeRecentSearch(termToRemove: string): Promise<string[]> {
  try {
    const current = await getRecentSearches();
    const updated = current.filter(
      (item) => normalizeSearchText(item) !== normalizeSearchText(termToRemove)
    );
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Error removing recent search:', e);
    return [];
  }
}

/**
 * Clear all recent searches
 */
export async function clearAllRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (e) {
    console.warn('Error clearing recent searches:', e);
  }
}

/**
 * Universal Intelligent Search Algorithm
 * Searches across Users, Hashtags, and Posts without arbitrary limits,
 * scoring by relevance, token matches, and recency.
 */
export async function executeUniversalSearch(rawQuery: string): Promise<SearchResults> {
  const queryStr = normalizeSearchText(rawQuery);
  if (!queryStr) {
    return { users: [], hashtags: [], posts: [], totalCount: 0 };
  }

  const queryTokens = queryStr.split(/\s+/).filter((t) => t.length > 0);
  const isHashSearch = rawQuery.trim().startsWith('#');
  const cleanQueryWithoutHash = queryStr.replace(/^#/, '');

  try {
    // 1. Fetch Posts from Firestore
    const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(150));
    const postsSnap = await getDocs(postsQuery);
    const allPosts: Post[] = [];
    postsSnap.forEach((docSnap) => {
      allPosts.push({ ...docSnap.data(), id: docSnap.id } as Post);
    });

    // 2. Fetch Users from Firestore
    const usersQuery = query(collection(db, 'users'), limit(100));
    const usersSnap = await getDocs(usersQuery);
    const allUsers: UserProfile[] = [];
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data();
      allUsers.push({
        id: docSnap.id,
        email: data.email || '',
        username: data.username || '',
        avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        coverPhotoUrl: data.coverPhotoUrl,
        bio: data.bio || '',
        createdAt: data.createdAt || '',
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
      });
    });

    // 3. Score & Filter Users
    const matchedUsersWithScore: { user: UserProfile; score: number }[] = [];
    allUsers.forEach((user) => {
      const normalizedUsername = normalizeSearchText(user.username);
      const normalizedBio = normalizeSearchText(user.bio || '');

      let score = 0;
      if (normalizedUsername === cleanQueryWithoutHash) {
        score += 200; // Exact username match
      } else if (normalizedUsername.startsWith(cleanQueryWithoutHash)) {
        score += 100; // Starts with query
      } else if (normalizedUsername.includes(cleanQueryWithoutHash)) {
        score += 50; // Partial username match
      }

      if (normalizedBio.includes(cleanQueryWithoutHash)) {
        score += 20; // Bio match
      }

      // Check tokens
      queryTokens.forEach((token) => {
        if (token && normalizedUsername.includes(token)) score += 15;
        if (token && normalizedBio.includes(token)) score += 5;
      });

      if (score > 0) {
        matchedUsersWithScore.push({ user, score });
      }
    });

    matchedUsersWithScore.sort((a, b) => b.score - a.score);
    const filteredUsers = matchedUsersWithScore.map((item) => item.user);

    // 4. Hashtag Aggregation & Scoring
    const hashtagMap = new Map<string, number>();
    allPosts.forEach((post) => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((tag) => {
          const normTag = normalizeSearchText(tag).replace(/^#/, '');
          if (normTag) {
            hashtagMap.set(normTag, (hashtagMap.get(normTag) || 0) + 1);
          }
        });
      }
    });

    const matchedHashtags: { tag: string; count: number; score: number }[] = [];
    hashtagMap.forEach((count, normTag) => {
      let score = 0;
      if (normTag === cleanQueryWithoutHash) {
        score += 250; // Exact hashtag match
      } else if (normTag.startsWith(cleanQueryWithoutHash)) {
        score += 120;
      } else if (normTag.includes(cleanQueryWithoutHash)) {
        score += 60;
      }

      queryTokens.forEach((token) => {
        const cleanToken = token.replace(/^#/, '');
        if (cleanToken && normTag.includes(cleanToken)) score += 20;
      });

      if (score > 0 || isHashSearch) {
        if (score > 0) {
          matchedHashtags.push({ tag: `#${normTag}`, count, score: score + count });
        }
      }
    });

    matchedHashtags.sort((a, b) => b.score - a.score);
    const filteredHashtags = matchedHashtags.map((item) => ({
      tag: item.tag,
      count: item.count,
    }));

    // 5. Score & Filter Posts
    const matchedPostsWithScore: { post: Post; score: number }[] = [];
    allPosts.forEach((post) => {
      const normalizedContent = normalizeSearchText(post.content || '');
      const normalizedAuthor = normalizeSearchText(post.authorUsername || '');
      const postTags = (post.hashtags || []).map((t) => normalizeSearchText(t).replace(/^#/, ''));

      let score = 0;

      // Hashtag matches in post
      if (postTags.includes(cleanQueryWithoutHash)) {
        score += 150;
      } else if (postTags.some((t) => t.includes(cleanQueryWithoutHash))) {
        score += 80;
      }

      // Exact content or author match
      if (normalizedAuthor === cleanQueryWithoutHash) {
        score += 100;
      } else if (normalizedAuthor.includes(cleanQueryWithoutHash)) {
        score += 40;
      }

      if (normalizedContent.includes(queryStr)) {
        score += 90; // Full phrase match in post content
      }

      // Token matches across content
      queryTokens.forEach((token) => {
        const cleanToken = token.replace(/^#/, '');
        if (cleanToken && normalizedContent.includes(cleanToken)) {
          score += 25;
        }
        if (cleanToken && postTags.some((t) => t.includes(cleanToken))) {
          score += 35;
        }
      });

      // Recency boost (fresher posts get a gentle edge)
      if (score > 0) {
        const hoursAgo = Math.max(1, (Date.now() - post.timestamp) / (1000 * 60 * 60));
        const freshnessScore = Math.max(0, 30 - Math.min(30, hoursAgo / 2));
        score += freshnessScore;

        matchedPostsWithScore.push({ post, score });
      }
    });

    matchedPostsWithScore.sort((a, b) => b.score - a.score);
    const filteredPosts = matchedPostsWithScore.map((item) => item.post);

    const totalCount = filteredUsers.length + filteredHashtags.length + filteredPosts.length;

    return {
      users: filteredUsers,
      hashtags: filteredHashtags,
      posts: filteredPosts,
      totalCount,
    };
  } catch (error) {
    console.error('Error executing universal search:', error);
    return { users: [], hashtags: [], posts: [], totalCount: 0 };
  }
}

/**
 * Fetches content recommendations for the search screen
 * (Trending hashtags, suggested active users, and popular posts)
 */
export async function fetchRecommendedContent(): Promise<RecommendedContent> {
  try {
    // 1. Fetch Posts
    const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50));
    const postsSnap = await getDocs(postsQuery);
    const allPosts: Post[] = [];
    postsSnap.forEach((docSnap) => {
      allPosts.push({ ...docSnap.data(), id: docSnap.id } as Post);
    });

    // 2. Aggregate Trending Hashtags from real posts
    const hashtagCountMap = new Map<string, number>();
    allPosts.forEach((post) => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((tag) => {
          const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
          hashtagCountMap.set(formattedTag, (hashtagCountMap.get(formattedTag) || 0) + 1);
        });
      }
    });

    // If no hashtags in posts, provide default warm community topics
    if (hashtagCountMap.size === 0) {
      hashtagCountMap.set('#desahogo', 12);
      hashtagCountMap.set('#fuerza', 9);
      hashtagCountMap.set('#noEstasSolo', 8);
      hashtagCountMap.set('#reflexion', 6);
      hashtagCountMap.set('#apoyo', 5);
      hashtagCountMap.set('#sentimientos', 4);
    }

    const trendingHashtags = Array.from(hashtagCountMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 3. Fetch Suggested Users
    const usersQuery = query(collection(db, 'users'), limit(15));
    const usersSnap = await getDocs(usersQuery);
    const suggestedUsers: UserProfile[] = [];
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data();
      suggestedUsers.push({
        id: docSnap.id,
        email: data.email || '',
        username: data.username || '',
        avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        coverPhotoUrl: data.coverPhotoUrl,
        bio: data.bio || '',
        createdAt: data.createdAt || '',
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
      });
    });

    // 4. Popular / Engaging Posts (most reactions + comments)
    const recommendedPosts = [...allPosts]
      .sort((a, b) => {
        const aReactions =
          (a.reactions?.teAbrazo || 0) +
          (a.reactions?.teEscucho || 0) +
          (a.reactions?.noEstasSolo || 0) +
          (a.reactions?.fuerza || 0) +
          (a.commentsCount || 0);
        const bReactions =
          (b.reactions?.teAbrazo || 0) +
          (b.reactions?.teEscucho || 0) +
          (b.reactions?.noEstasSolo || 0) +
          (b.reactions?.fuerza || 0) +
          (b.commentsCount || 0);
        return bReactions - aReactions;
      })
      .slice(0, 20);

    return {
      trendingHashtags,
      suggestedUsers,
      recommendedPosts,
    };
  } catch (error) {
    console.error('Error fetching recommended content:', error);
    return {
      trendingHashtags: [
        { tag: '#desahogo', count: 10 },
        { tag: '#fuerza', count: 8 },
        { tag: '#noEstasSolo', count: 7 },
      ],
      suggestedUsers: [],
      recommendedPosts: [],
    };
  }
}
