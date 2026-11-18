import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  useWindowDimensions,
  ImageBackground,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopicArticle } from '../../types/blog';
import { subscribeToTopicArticles } from '../../services/blogService';
import { colors } from '../../theme/colors';

interface TopicItem {
  id: string;
  titulo: string;
  imagen: string;
}

interface TopicArticlesModalProps {
  visible: boolean;
  topic: TopicItem | null;
  onClose: () => void;
  embedded?: boolean;
}

export const TopicArticlesModal: React.FC<TopicArticlesModalProps> = ({
  visible,
  topic,
  onClose,
  embedded = false,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && windowWidth >= 1024;
  const isEmbeddedMode = embedded || isDesktop;

  const [articles, setArticles] = useState<TopicArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!visible || !topic) {
      setArticles([]);
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToTopicArticles(topic.id, (data) => {
      setArticles(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [visible, topic]);

  if (!visible || !topic) return null;

  const modalBody = (
    <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopSafeArea]}>
      {/* Top Fixed Header with Back / Close Button */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          activeOpacity={0.75}
          accessibilityLabel="Volver al blog"
        >
          <Ionicons name="arrow-back" size={22} color={colors.coffeeDeep} />
          <Text style={styles.backButtonText}>Volver al Blog</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeIconBtn}
          onPress={onClose}
          activeOpacity={0.75}
        >
          <Ionicons name="close" size={24} color={colors.coffeeDeep} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.desktopScrollContent,
        ]}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        {/* Panoramic Topic Banner */}
        <View style={styles.bannerWrapper}>
          <ImageBackground
            source={{ uri: topic.imagen }}
            style={styles.bannerImage}
            imageStyle={styles.bannerImageStyle}
            resizeMode="cover"
          >
            <View style={styles.bannerOverlay}>
              <View style={styles.topicBadge}>
                <Ionicons name="medical" size={13} color="#FFFFFF" />
                <Text style={styles.topicBadgeText}>Tema Clínico Oficial</Text>
              </View>

              <Text style={styles.bannerTitle}>{topic.titulo}</Text>
              <Text style={styles.bannerSubtitle}>
                Artículos, herramientas de acompañamiento y reflexiones
                redactadas por psicólogos profesionales colegiados.
              </Text>

              <View style={styles.bannerStatsRow}>
                <View style={styles.statsPill}>
                  <Ionicons name="newspaper-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.statsPillText}>
                    {articles.length} {articles.length === 1 ? 'artículo publicado' : 'artículos publicados'}
                  </Text>
                </View>

                <View style={[styles.statsPill, { backgroundColor: 'rgba(255, 255, 255, 0.22)' }]}>
                  <Ionicons name="eye-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.statsPillText}>Lectura Libre</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Content Section Header */}
        <View style={styles.sectionHeaderBox}>
          <View>
            <Text style={styles.sectionTitle}>
              Publicaciones de Especialistas
            </Text>
            <Text style={styles.sectionSub}>
              Información validada por profesionales de la salud emocional
            </Text>
          </View>
        </View>

        {/* Articles List / Loading / Empty */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.coffeePrimary} />
            <Text style={styles.loadingText}>Cargando artículos de especialistas...</Text>
          </View>
        ) : articles.length > 0 ? (
          <View style={styles.articlesFeed}>
            {articles.map((item) => (
              <View key={item.id} style={styles.articleCard}>
                {/* Author Info Header */}
                <View style={styles.authorHeader}>
                  {item.psicologoAvatar ? (
                    <Image
                      source={{ uri: item.psicologoAvatar }}
                      style={styles.authorAvatar}
                    />
                  ) : (
                    <View style={styles.authorAvatarFallback}>
                      <Text style={styles.authorAvatarFallbackText}>
                        {(item.psicologoNombre || 'P').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.authorDetails}>
                    <View style={styles.authorNameRow}>
                      <Text style={styles.authorName} numberOfLines={1}>
                        {item.psicologoNombre}
                      </Text>
                      <View style={styles.verifiedTag}>
                        <Ionicons name="checkmark-circle" size={14} color="#059669" />
                        <Text style={styles.verifiedTagText}>Psicólogo</Text>
                      </View>
                    </View>

                    <Text style={styles.authorSpec} numberOfLines={1}>
                      {item.psicologoEspecialidad}
                    </Text>

                    {item.psicologoCedula ? (
                      <Text style={styles.authorCedula}>
                        Cédula: {item.psicologoCedula}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Article Title */}
                <Text style={styles.articleTitle}>{item.titulo}</Text>

                {/* Article Summary */}
                {item.resumen ? (
                  <View style={styles.summaryBox}>
                    <Ionicons name="information-circle-outline" size={17} color="#8C684B" />
                    <Text style={styles.summaryText}>{item.resumen}</Text>
                  </View>
                ) : null}

                {/* Article Main Body */}
                <Text style={styles.articleBody}>{item.contenido}</Text>

                {/* Recommendations / Tips Box (if provided) */}
                {item.recomendaciones ? (
                  <View style={styles.tipsBox}>
                    <View style={styles.tipsHeaderRow}>
                      <Ionicons name="bulb-outline" size={17} color="#15803D" />
                      <Text style={styles.tipsHeaderTitle}>
                        Consejos y Herramientas del Especialista:
                      </Text>
                    </View>
                    <Text style={styles.tipsText}>{item.recomendaciones}</Text>
                  </View>
                ) : null}

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.readOnlyBadge}>
                    <Ionicons name="shield-checkmark-outline" size={13} color="#6F5038" />
                    <Text style={styles.readOnlyText}>Contenido Clínico Verificado</Text>
                  </View>

                  <Text style={styles.cardDate}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Reciente'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="book-outline" size={32} color={colors.coffeePrimary} />
            </View>
            <Text style={styles.emptyTitle}>
              Próximamente Artículos sobre {topic.titulo}
            </Text>
            <Text style={styles.emptySub}>
              Nuestros psicólogos clínicos están preparando artículos, guías y
              consejos prácticos para esta sección. Vuelve pronto para consultar
              información profesional.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  if (isEmbeddedMode) {
    return <View style={styles.embeddedContainer}>{modalBody}</View>;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {modalBody}
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  desktopSafeArea: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  embeddedContainer: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  topHeaderBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5D5C8',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  closeIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3EAE3',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  desktopScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  bannerWrapper: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#2E2423',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    minHeight: 180,
  },
  bannerImageStyle: {
    borderRadius: 22,
  },
  bannerOverlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(28, 25, 23, 0.62)',
    justifyContent: 'flex-end',
  },
  topicBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  topicBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#F3EAE3',
    lineHeight: 18,
    marginBottom: 14,
  },
  bannerStatsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statsPillText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  sectionHeaderBox: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.coffeeDeep,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 12.5,
    color: '#8C684B',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#8C684B',
    fontWeight: '600',
  },
  articlesFeed: {
    gap: 16,
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5D5C8',
    shadowColor: '#2E2423',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EAE3',
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3EAE3',
  },
  authorAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5D5C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarFallbackText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.coffeeDeep,
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.coffeeDeep,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  authorSpec: {
    fontSize: 11.5,
    color: '#8C684B',
    fontWeight: '600',
  },
  authorCedula: {
    fontSize: 10.5,
    color: '#9A8B82',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 1,
  },
  articleTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.coffeeDeep,
    lineHeight: 22,
    marginBottom: 10,
  },
  summaryBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FAF7F5',
    borderLeftWidth: 3,
    borderLeftColor: '#C6A487',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryText: {
    flex: 1,
    fontSize: 12.5,
    color: '#6F5038',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  articleBody: {
    fontSize: 13.5,
    color: '#2E2423',
    lineHeight: 21,
    marginBottom: 14,
  },
  tipsBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 6,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipsHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  tipsText: {
    fontSize: 12.5,
    color: '#166534',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3EAE3',
  },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3EAE3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  readOnlyText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6F5038',
  },
  cardDate: {
    fontSize: 11,
    color: '#9A8B82',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E5D5C8',
    alignItems: 'center',
    textAlign: 'center',
    gap: 10,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3EAE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coffeeDeep,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12.5,
    color: '#8C684B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 380,
  },
});
