import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { Post } from '../../types/post';
import { PostCard } from './PostCard';
import { DailyQuoteCard } from './DailyQuoteCard';
import { MonthAwarenessPostCard } from './MonthAwarenessPostCard';
import { ChallengeFlyerPostCard } from './ChallengeFlyerPostCard';
import { ActiveStreakBannerCard } from './ActiveStreakBannerCard';
import { WeeklyMoodTracker } from '../Profile/WeeklyMoodTracker';
import { useAuth } from '../../context/AuthContext';
import { subscribeToPosts, subscribeToUserFollowing } from '../../services/postsService';
import { colors } from '../../theme/colors';

interface FeedListProps {
  onCommentPress: (post: Post) => void;
  onRequireAuth: () => void;
  onOptionsPress?: (post: Post) => void;
  onEditPress?: (post: Post) => void;
  onDeletePress?: (post: Post) => void;
  onUserPress?: (userId: string, username: string, avatarUrl: string) => void;
  onScrollDirectionChange?: (direction: 'up' | 'down') => void;
  onOpenMonthDetail?: (monthIndex: number) => void;
  onOpenStreakModal?: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

type FeedListItem =
  | { type: 'post'; data: Post }
  | { type: 'quote'; offset: number; id: string }
  | { type: 'month-awareness'; id: string }
  | { type: 'challenge-flyer'; id: string }
  | { type: 'weekly-mood'; id: string };

export const FeedList: React.FC<FeedListProps> = ({
  onCommentPress,
  onRequireAuth,
  onOptionsPress,
  onEditPress,
  onDeletePress,
  onUserPress,
  onScrollDirectionChange,
  onOpenMonthDetail,
  onOpenStreakModal,
  contentPaddingTop = 56,
  contentPaddingBottom = 64,
}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastOffsetY = useRef(0);

  // Random positions for quote, month awareness, challenge flyer & single weekly mood card while scrolling
  const initialQuoteSlot = useRef(Math.floor(Math.random() * 4)).current; // 0..3
  const initialMonthSlot = useRef(Math.floor(Math.random() * 3) + 1).current; // 1..3
  const initialChallengeFlyerSlot = useRef(Math.floor(Math.random() * 4) + 1).current; // 1..4
  const initialWeeklyMoodSlot = useRef(Math.floor(Math.random() * 5) + 2).current; // 2..6

  useEffect(() => {
    const unsubscribePosts = subscribeToPosts((livePosts) => {
      setPosts(livePosts);
      setIsLoading(false);
      setRefreshing(false);
    });

    const unsubscribeFollowing = user
      ? subscribeToUserFollowing(user.id, (ids) => {
          setFollowingIds(ids);
        })
      : () => {};

    return () => {
      unsubscribePosts();
      unsubscribeFollowing();
    };
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffsetY = event.nativeEvent.contentOffset.y;
    const delta = currentOffsetY - lastOffsetY.current;

    if (currentOffsetY <= 15) {
      onScrollDirectionChange?.('up');
    } else if (delta > 8 && currentOffsetY > 40) {
      onScrollDirectionChange?.('down');
    } else if (delta < -8) {
      onScrollDirectionChange?.('up');
    }

    lastOffsetY.current = currentOffsetY;
  };

  // Combine regular user posts with quote publications, month awareness, challenge flyer, and weekly mood tracker
  const feedItems = useMemo<FeedListItem[]>(() => {
    if (posts.length === 0) {
      return [
        { type: 'challenge-flyer', id: 'challenge-flyer-top' },
        { type: 'month-awareness', id: 'month-card-top' },
        { type: 'weekly-mood', id: 'weekly-mood-top' },
        { type: 'quote', offset: 0, id: 'quote-top-0' },
      ];
    }

    const items: FeedListItem[] = [];
    const firstPos = Math.min(posts.length, initialQuoteSlot); // 0..3
    const monthPos = Math.min(posts.length, initialMonthSlot === firstPos ? firstPos + 1 : initialMonthSlot);
    const flyerPos = Math.min(posts.length, initialChallengeFlyerSlot);
    const weeklyMoodPos = Math.min(posts.length, initialWeeklyMoodSlot);
    let quoteCount = 0;
    let monthInserted = false;
    let flyerInserted = false;
    let weeklyMoodInserted = false;

    for (let i = 0; i < posts.length; i++) {
      // Challenge Flyer card at random slot
      if (i === flyerPos && !flyerInserted) {
        items.push({ type: 'challenge-flyer', id: 'challenge-flyer-card' });
        flyerInserted = true;
      }

      // Month awareness card
      if (i === monthPos && !monthInserted) {
        items.push({ type: 'month-awareness', id: 'month-awareness-card' });
        monthInserted = true;
      }

      // Single Weekly Mood card at random slot while scrolling down
      if (i === weeklyMoodPos && !weeklyMoodInserted) {
        items.push({ type: 'weekly-mood', id: 'weekly-mood-slot-single' });
        weeklyMoodInserted = true;
      }

      // 1st quote at firstPos (0..3)
      if (i === firstPos && quoteCount < 3) {
        items.push({ type: 'quote', offset: quoteCount, id: `quote-slot-${quoteCount}` });
        quoteCount++;
      }
      // 2nd quote ~6 posts later
      else if (i === firstPos + 6 && quoteCount < 3) {
        items.push({ type: 'quote', offset: quoteCount, id: `quote-slot-${quoteCount}` });
        quoteCount++;
      }
      // 3rd quote
      else if (i === firstPos + 12 && quoteCount < 3) {
        items.push({ type: 'quote', offset: quoteCount, id: `quote-slot-${quoteCount}` });
        quoteCount++;
      }

      items.push({ type: 'post', data: posts[i] });
    }

    // Ensure challenge flyer is placed if not yet inserted
    if (!flyerInserted) {
      items.splice(Math.min(items.length, 1), 0, { type: 'challenge-flyer', id: 'challenge-flyer-card' });
    }

    // Ensure month card is placed if not yet inserted
    if (!monthInserted) {
      items.splice(Math.min(items.length, 2), 0, { type: 'month-awareness', id: 'month-awareness-card' });
    }

    // Ensure single weekly mood card is placed if not yet inserted
    if (!weeklyMoodInserted) {
      items.splice(Math.min(items.length, 3), 0, { type: 'weekly-mood', id: 'weekly-mood-slot-single' });
    }

    // If there were very few posts and firstPos wasn't reached
    if (quoteCount === 0) {
      items.unshift({ type: 'quote', offset: 0, id: 'quote-slot-0' });
    }

    return items;
  }, [posts, initialQuoteSlot, initialMonthSlot, initialChallengeFlyerSlot, initialWeeklyMoodSlot]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.coffeePrimary} />
      </View>
    );
  }

  return (
    <FlatList
      data={feedItems}
      keyExtractor={(item) => (item.type === 'post' ? item.data.id : item.id)}
      renderItem={({ item }) => {
        if (item.type === 'challenge-flyer') {
          return (
            <ChallengeFlyerPostCard
              onOpenStreakModal={onOpenStreakModal}
              onRequireAuth={onRequireAuth}
            />
          );
        }
        if (item.type === 'month-awareness') {
          return (
            <MonthAwarenessPostCard
              onOpenMonthDetail={onOpenMonthDetail}
            />
          );
        }
        if (item.type === 'weekly-mood') {
          return <WeeklyMoodTracker userId={user?.id} isFeedCard />;
        }
        if (item.type === 'quote') {
          return <DailyQuoteCard quoteOffset={item.offset} />;
        }
        return (
          <PostCard
            post={item.data}
            isFollowing={followingIds.includes(item.data.authorId)}
            onCommentPress={onCommentPress}
            onRequireAuth={onRequireAuth}
            onOptionsPress={onOptionsPress}
            onEditPress={onEditPress}
            onDeletePress={onDeletePress}
            onUserPress={onUserPress}
          />
        );
      }}
      ListHeaderComponent={
        <View>
          <ActiveStreakBannerCard onOpenStreakModal={onOpenStreakModal} />
        </View>
      }
      contentContainerStyle={[
        styles.listContent,
        { paddingTop: contentPaddingTop, paddingBottom: contentPaddingBottom },
      ]}
      showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.coffeePrimary}
          colors={[colors.coffeePrimary]}
          progressViewOffset={contentPaddingTop}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  listContent: {
    backgroundColor: colors.white,
    width: '100%',
  },
});
