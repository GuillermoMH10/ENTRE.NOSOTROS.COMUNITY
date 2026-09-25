import React, { useEffect, useState, useRef } from 'react';
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
import { subscribeToPosts } from '../../services/postsService';
import { colors } from '../../theme/colors';

interface FeedListProps {
  onCommentPress: (post: Post) => void;
  onRequireAuth: () => void;
  onOptionsPress?: (post: Post) => void;
  onEditPress?: (post: Post) => void;
  onDeletePress?: (post: Post) => void;
  onScrollDirectionChange?: (direction: 'up' | 'down') => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

export const FeedList: React.FC<FeedListProps> = ({
  onCommentPress,
  onRequireAuth,
  onOptionsPress,
  onEditPress,
  onDeletePress,
  onScrollDirectionChange,
  contentPaddingTop = 56,
  contentPaddingBottom = 64,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastOffsetY = useRef(0);

  useEffect(() => {
    const unsubscribe = subscribeToPosts((livePosts) => {
      setPosts(livePosts);
      setIsLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

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

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.coffeePrimary} />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.cleanCanvas} />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onCommentPress={onCommentPress}
          onRequireAuth={onRequireAuth}
          onOptionsPress={onOptionsPress}
          onEditPress={onEditPress}
          onDeletePress={onDeletePress}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  cleanCanvas: {
    flex: 1,
  },
  listContent: {
    backgroundColor: colors.white,
  },
});
