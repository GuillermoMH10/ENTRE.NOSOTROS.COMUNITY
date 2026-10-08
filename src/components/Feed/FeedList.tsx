import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Post } from '../../types/post';
import { PostCard } from './PostCard';
import { DailyQuoteCard } from './DailyQuoteCard';
import { MonthAwarenessPostCard } from './MonthAwarenessPostCard';
import { DailyMoodCard } from './DailyMoodCard';
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
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

type FeedListItem =
  | { type: 'post'; data: Post }
  | { type: 'quote'; offset: number; id: string }
  | { type: 'month-awareness'; id: string }
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
  contentPaddingTop = 56,
  contentPaddingBottom = 64,
}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastOffsetY = useRef(0);

  // Random positions for quote & month awareness
  const initialQuoteSlot = useRef(Math.floor(Math.random() * 4)).current; // 0..3
  const initialMonthSlot = useRef(Math.floor(Math.random() * 3) + 1).current; // 1..3

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

  // Combine regular user posts with quote publications, month awareness, and weekly mood tracker
  const feedItems = useMemo<FeedListItem[]>(() => {
    if (posts.length === 0) {
      return [
        { type: 'month-awareness', id: 'month-card-top' },
        { type: 'weekly-mood', id: 'weekly-mood-top' },
        { type: 'quote', offset: 0, id: 'quote-top-0' },
      ];
    }

    const items: FeedListItem[] = [];
    const firstPos = Math.min(posts.length, initialQuoteSlot); // 0..3
    const monthPos = Math.min(posts.length, initialMonthSlot === firstPos ? firstPos + 1 : initialMonthSlot);
    let quoteCount = 0;
    let monthInserted = false;
    let weeklyMoodInserted = false;

    for (let i = 0; i < posts.length; i++) {
      // Month awareness card
      if (i === monthPos && !monthInserted) {
        items.push({ type: 'month-awareness', id: 'month-awareness-card' });
        monthInserted = true;
      }

      // 1st quote at firstPos (0..3)
      if (i === firstPos && quoteCount < 3) {
        items.push({ type: 'quote', offset: quoteCount, id: `quote-slot-${quoteCount}` });
        quoteCount++;
      }
      // Weekly Mood card (~3 posts later)
      else if (i === firstPos + 3 && !weeklyMoodInserted) {
        items.push({ type: 'weekly-mood', id: 'weekly-mood-slot-0' });
        weeklyMoodInserted = true;
      }
      // 2nd quote ~5 posts later
      else if (i === firstPos + 6 && quoteCount < 3) {
        items.push({ type: 'quote', offset: quoteCount, id: `quote-slot-${quoteCount}` });
        quoteCount++;
      }
      // 2nd Weekly Mood card (~8 posts later)
      else if (i === firstPos + 9) {
        items.push({ type: 'weekly-mood', id: `weekly-mood-slot-${i}` });
      }
      // 3rd quote
      else if (i === firstPos + 12 && quoteCount < 3) {
        items.push({ type: 'quote', offset: quoteCount, id: `quote-slot-${quoteCount}` });
        quoteCount++;
      }

      items.push({ type: 'post', data: posts[i] });
    }

    // Ensure month card is placed if not yet inserted
    if (!monthInserted) {
      items.splice(1, 0, { type: 'month-awareness', id: 'month-awareness-card' });
    }

    // Ensure weekly mood card is placed if not yet inserted
    if (!weeklyMoodInserted) {
      items.splice(2, 0, { type: 'weekly-mood', id: 'weekly-mood-slot-main' });
    }

    // If there were very few posts and firstPos wasn't reached
    if (quoteCount === 0) {
      items.unshift({ type: 'quote', offset: 0, id: 'quote-slot-0' });
    }

    return items;
  }, [posts, initialQuoteSlot, initialMonthSlot]);

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
      ListHeaderComponent={<DailyMoodCard />}
      contentContainerStyle={[
        styles.listContent,
        { paddingTop: contentPaddingTop, paddingBottom: contentPaddingBottom },
      ]}
      showsVerticalScrollIndicator={false}
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
  },
});
