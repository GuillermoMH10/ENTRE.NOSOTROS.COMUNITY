import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  executeUniversalSearch,
  OFFICIAL_STREAK_AND_COMMUNITY_HASHTAGS,
} from '../../services/searchService';
import { Post } from '../../types/post';
import { PostMediaView } from './PostMediaView';
import { colors } from '../../theme/colors';

interface HashtagFeedModalProps {
  visible: boolean;
  initialHashtag: string | null;
  onClose: () => void;
  onUserPress?: (userId: string, username: string, avatarUrl: string) => void;
}

export const HashtagFeedModal: React.FC<HashtagFeedModalProps> = ({
  visible,
  initialHashtag,
  onClose,
  onUserPress,
}) => {
  const [activeTag, setActiveTag] = useState<string>(initialHashtag || '#MiRachaEntreNosotros');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible && initialHashtag) {
      const formatted = initialHashtag.startsWith('#') ? initialHashtag : `#${initialHashtag}`;
      setActiveTag(formatted);
      loadHashtagPosts(formatted);
    }
  }, [visible, initialHashtag]);

  const loadHashtagPosts = async (tagToLoad: string) => {
    setLoading(true);
    try {
      const res = await executeUniversalSearch(tagToLoad);
      setPosts(res.posts || []);
    } catch (e) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTag = (tag: string) => {
    setActiveTag(tag);
    loadHashtagPosts(tag);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.headerTitle}>{activeTag}</Text>
              <Text style={styles.headerSub}>
                Explora las publicaciones y avances de la comunidad con este hashtag
              </Text>
            </View>
          </View>

          {/* Horizontal Bar of Registered Hashtags to Navigate */}
          <View style={styles.tagsStripWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsStripContent}
            >
              {OFFICIAL_STREAK_AND_COMMUNITY_HASHTAGS.map((item) => {
                const isSelected = activeTag.toLowerCase() === item.tag.toLowerCase();
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                    onPress={() => handleSelectTag(item.tag)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
                      {item.tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Posts Feed for Active Hashtag */}
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#FF7A00" />
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.centerBox}>
              <Ionicons name="pricetag-outline" size={38} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Sin publicaciones recientes en {activeTag}</Text>
              <Text style={styles.emptySub}>
                Comparte tu avance en tu Ruta de 7 Días o crea una publicación usando {activeTag} para aparecer aquí.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.postsScroll}
              showsVerticalScrollIndicator={Platform.OS === 'web'}
            >
              {posts.map((p) => (
                <View key={p.id} style={styles.postCard}>
                  <TouchableOpacity
                    style={styles.authorRow}
                    activeOpacity={0.75}
                    onPress={() => {
                      if (onUserPress) {
                        onClose();
                        onUserPress(p.authorId, p.authorUsername, p.authorAvatarUrl);
                      }
                    }}
                  >
                    <Image
                      source={{ uri: p.authorAvatarUrl }}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.username}>@{p.authorUsername}</Text>
                      <Text style={styles.dateText}>
                        {new Date(p.timestamp).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {p.content ? <Text style={styles.postContent}>{p.content}</Text> : null}

                  <PostMediaView mediaUrls={p.imageUrls} onMediaPress={() => {}} />

                  {p.hashtags && p.hashtags.length > 0 && (
                    <View style={styles.postTagsRow}>
                      {p.hashtags.map((t, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => handleSelectTag(t.startsWith('#') ? t : `#${t}`)}
                          activeOpacity={0.7}
                          style={styles.inlineTagPill}
                        >
                          <Text style={styles.inlineTagText}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  tagsStripWrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  tagsStripContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagChipSelected: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tagChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  postsScroll: {
    padding: 14,
    gap: 12,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
  },
  username: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
  },
  postContent: {
    fontSize: 13.5,
    color: '#1E293B',
    lineHeight: 19.5,
    marginBottom: 10,
  },
  postTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  inlineTagPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inlineTagText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
});
