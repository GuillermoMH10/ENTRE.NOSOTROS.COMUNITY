import React, { useState, useEffect, useRef } from 'react';
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
import {
  subscribeToTopicArticles,
  toggleTopicArticleReaction,
  toggleSaveTopicArticle,
} from '../../services/blogService';
import { ReactionType, REACTIONS_MAP } from '../../types/post';
import { ReactionPicker } from '../Feed/ReactionPicker';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

interface TopicItem {
  id: string;
  titulo: string;
  imagen: string;
  descripcion?: string;
}

interface TopicArticlesModalProps {
  visible: boolean;
  topic: TopicItem | null;
  onClose: () => void;
  onOpenPsychologistDetail?: (psicoId: string, fallbackData?: any) => void;
  onRequireAuth?: () => void;
  embedded?: boolean;
}

export const TopicArticlesModal: React.FC<TopicArticlesModalProps> = ({
  visible,
  topic,
  onClose,
  onOpenPsychologistDetail,
  onRequireAuth,
  embedded = false,
}) => {
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && windowWidth >= 1024;
  const isEmbeddedMode = embedded || isDesktop;

  const [articles, setArticles] = useState<TopicArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Reaction picker state
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [activeArticleForReaction, setActiveArticleForReaction] = useState<string | null>(null);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | undefined>(undefined);

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

  const currentUserId = user?.id || '';

  // Format relative date or clean date
  const formatTimeAgo = (timestamp?: number, isoDate?: string) => {
    const time = timestamp || (isoDate ? new Date(isoDate).getTime() : 0);
    if (!time) return 'Reciente';
    const diffMs = Date.now() - time;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Hace ${diffDays} d`;
    return new Date(time).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Handle single tap reaction on article
  const handleTapReaction = async (article: TopicArticle) => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    const currentReaction = currentUserId ? article.userReactions?.[currentUserId] : undefined;
    const targetReaction: ReactionType = currentReaction ? currentReaction : 'teAbrazo';
    await toggleTopicArticleReaction(article.id, user.id, targetReaction);
  };

  // Handle long press or open picker
  const handleOpenReactionPicker = (articleId: string, eventNative: any) => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    setActiveArticleForReaction(articleId);
    if (eventNative && eventNative.target) {
      setPickerPosition({
        x: Math.max(16, (eventNative.pageX || windowWidth / 2) - 140),
        y: Math.max(80, (eventNative.pageY || 300) - 70),
      });
    } else {
      setPickerPosition({ x: Math.max(16, windowWidth / 2 - 140), y: 320 });
    }
    setShowReactionPicker(true);
  };

  // Handle reaction picked
  const handleSelectReaction = async (reactionType: ReactionType) => {
    if (!user || !activeArticleForReaction) return;
    await toggleTopicArticleReaction(activeArticleForReaction, user.id, reactionType);
    setShowReactionPicker(false);
    setActiveArticleForReaction(null);
  };

  // Handle toggle save article
  const handleToggleSave = async (articleId: string) => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    await toggleSaveTopicArticle(articleId, user.id);
  };

  // Description for banner
  const topicDescription =
    topic.descripcion ||
    (topic.id === 'depresion'
      ? 'Tristeza profunda, anhedonia, pérdida de energía y herramientas de acompañamiento.'
      : 'Preocupación excesiva, rumiación, ataques de pánico y técnicas de regulación.');

  const modalBody = (
    <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopSafeArea]}>
      {/* Top Header Bar in crisp white & soft sky blue */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          activeOpacity={0.75}
          accessibilityLabel="Volver al blog"
        >
          <Ionicons name="arrow-back" size={22} color={colors.primaryDark} />
          <Text style={styles.backButtonText}>Volver al Blog</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeIconBtn}
          onPress={onClose}
          activeOpacity={0.75}
        >
          <Ionicons name="close" size={22} color={colors.primaryDark} />
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
        {/* PANORAMIC TOPIC BANNER: FOTO COMPLETA + TÍTULO ENCIMA + PEQUEÑA DESCRIPCIÓN DEBAJO (SIN KPIS) */}
        <View style={styles.bannerWrapper}>
          <ImageBackground
            source={{ uri: topic.imagen }}
            style={styles.bannerImage}
            imageStyle={styles.bannerImageStyle}
            resizeMode="cover"
          >
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerTitle}>{topic.titulo}</Text>
              <Text style={styles.bannerSubtitle}>{topicDescription}</Text>
            </View>
          </ImageBackground>
        </View>

        {/* FEED DE PUBLICACIONES (DISEÑO COMO LA APP PRINCIPAL) */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando publicaciones...</Text>
          </View>
        ) : articles.length > 0 ? (
          <View style={styles.articlesFeed}>
            {articles.map((item) => {
              const totalReactions =
                (item.reactions?.teAbrazo || 0) +
                (item.reactions?.teEscucho || 0) +
                (item.reactions?.noEstasSolo || 0) +
                (item.reactions?.fuerza || 0);

              const userReaction = currentUserId ? item.userReactions?.[currentUserId] : undefined;
              const isSaved = currentUserId ? item.savedBy?.includes(currentUserId) : false;
              const activeReactionConfig = userReaction ? REACTIONS_MAP[userReaction] : null;

              return (
                <View key={item.id} style={styles.postCard}>
                  {/* Post Header: Avatar del Psicólogo + Nombre + Especialidad + Fecha (Clickeable para ver su perfil) */}
                  <View style={styles.postHeader}>
                    <TouchableOpacity
                      style={styles.authorClickArea}
                      activeOpacity={0.75}
                      onPress={() => {
                        if (onOpenPsychologistDetail) {
                          onOpenPsychologistDetail(item.psicologoId, {
                            id: item.psicologoId,
                            nombre: item.psicologoNombre,
                            especialidad: item.psicologoEspecialidad,
                            imagen: item.psicologoAvatar,
                            cedula: item.psicologoCedula,
                          });
                        }
                      }}
                    >
                      {item.psicologoAvatar ? (
                        <Image
                          source={{ uri: item.psicologoAvatar }}
                          style={styles.authorAvatar}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.authorAvatarFallback}>
                          <Text style={styles.authorAvatarFallbackText}>
                            {(item.psicologoNombre || 'P').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}

                      <View style={styles.authorInfo}>
                        <View style={styles.authorNameRow}>
                          <Text style={styles.authorName} numberOfLines={1}>
                            {item.psicologoNombre}
                          </Text>
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                            <Text style={styles.verifiedBadgeText}>Psicólogo</Text>
                          </View>
                        </View>

                        <Text style={styles.authorSpecialty} numberOfLines={1}>
                          {item.psicologoEspecialidad}
                          {item.psicologoCedula ? ` · Cédula: ${item.psicologoCedula}` : ''}
                        </Text>
                        <Text style={styles.postTime}>
                          {formatTimeAgo(item.timestamp, item.createdAt)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Post Body: Título del Artículo */}
                  {item.titulo ? (
                    <Text style={styles.articleTitle}>{item.titulo}</Text>
                  ) : null}

                  {/* Resumen opcional */}
                  {item.resumen ? (
                    <View style={styles.summaryCallout}>
                      <Text style={styles.summaryText}>{item.resumen}</Text>
                    </View>
                  ) : null}

                  {/* Contenido redactado */}
                  <Text style={styles.contentParagraph}>{item.contenido}</Text>

                  {/* Recomendaciones y consejos del especialista (si las hay) */}
                  {item.recomendaciones ? (
                    <View style={styles.tipsBox}>
                      <View style={styles.tipsHeaderRow}>
                        <Ionicons name="bulb-outline" size={16} color={colors.primary} />
                        <Text style={styles.tipsHeaderTitle}>
                          Consejos y Herramientas del Especialista:
                        </Text>
                      </View>
                      <Text style={styles.tipsText}>{item.recomendaciones}</Text>
                    </View>
                  ) : null}

                  {/* Imagen si es que subió el especialista */}
                  {item.imagenUrl && item.imagenUrl !== topic.imagen ? (
                    <View style={styles.postMediaWrapper}>
                      <Image
                        source={{ uri: item.imagenUrl }}
                        style={styles.postMediaImage}
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}

                  {/* Reacciones Acumuladas Preview (igual a Principal) */}
                  {totalReactions > 0 && (
                    <View style={styles.counterRow}>
                      <View style={styles.reactionIconsOverlap}>
                        {item.reactions && item.reactions.teAbrazo > 0 && (
                          <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.teAbrazo.bgColor }]}>
                            <Image
                              source={REACTIONS_MAP.teAbrazo.image}
                              style={styles.miniReactionImg}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                        {item.reactions && item.reactions.teEscucho > 0 && (
                          <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.teEscucho.bgColor }]}>
                            <Image
                              source={REACTIONS_MAP.teEscucho.image}
                              style={styles.miniReactionImg}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                        {item.reactions && item.reactions.noEstasSolo > 0 && (
                          <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.noEstasSolo.bgColor }]}>
                            <Image
                              source={REACTIONS_MAP.noEstasSolo.image}
                              style={styles.miniReactionImg}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                        {item.reactions && item.reactions.fuerza > 0 && (
                          <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.fuerza.bgColor }]}>
                            <Image
                              source={REACTIONS_MAP.fuerza.image}
                              style={styles.miniReactionImg}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                      </View>
                      <Text style={styles.counterText}>{totalReactions}</Text>
                    </View>
                  )}

                  {/* Actions Footer: ÚNICAMENTE REACCIONAR Y GUARDAR (NO COMENTAR) */}
                  <View style={styles.actionsFooter}>
                    {/* Botón Reaccionar */}
                    <TouchableOpacity
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                      onPress={() => handleTapReaction(item)}
                      onLongPress={(e) => handleOpenReactionPicker(item.id, e.nativeEvent)}
                      delayLongPress={220}
                    >
                      {activeReactionConfig ? (
                        <Image
                          source={activeReactionConfig.image}
                          style={styles.actionReactionIcon}
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons
                          name="heart-outline"
                          size={19}
                          color={colors.primary}
                        />
                      )}
                      <Text
                        style={[
                          styles.actionBtnText,
                          activeReactionConfig && { color: activeReactionConfig.color, fontWeight: '800' },
                        ]}
                      >
                        {activeReactionConfig ? activeReactionConfig.label : 'Reaccionar'}
                      </Text>
                    </TouchableOpacity>

                    {/* Botón Guardar */}
                    <TouchableOpacity
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                      onPress={() => handleToggleSave(item.id)}
                    >
                      <Ionicons
                        name={isSaved ? 'bookmark' : 'bookmark-outline'}
                        size={19}
                        color={isSaved ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.actionBtnText,
                          isSaved && { color: colors.primary, fontWeight: '800' },
                        ]}
                      >
                        {isSaved ? 'Guardado' : 'Guardar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="book-outline" size={30} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              Próximamente publicaciones sobre {topic.titulo}
            </Text>
            <Text style={styles.emptySub}>
              Los especialistas clínicos están redactando artículos y recomendaciones
              profesionales para este tema.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Reaction Picker */}
      <ReactionPicker
        visible={showReactionPicker}
        position={pickerPosition}
        onSelectReaction={handleSelectReaction}
        onClose={() => {
          setShowReactionPicker(false);
          setActiveArticleForReaction(null);
        }}
      />
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
    backgroundColor: '#F0F5F8', // Azulito claro suave de Entre Nosotros
  },
  desktopSafeArea: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#F0F5F8',
  },
  embeddedContainer: {
    flex: 1,
    backgroundColor: '#F0F5F8',
  },
  topHeaderBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1EAEF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  closeIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1EAEF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 60,
  },
  desktopScrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  /* Banner: Foto completa con título encima y descripción debajo (sin KPIs) */
  bannerWrapper: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1EAEF',
    shadowColor: '#223E52',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
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
    padding: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    justifyContent: 'flex-end',
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 13.5,
    color: '#F0F5F8',
    lineHeight: 19,
    fontWeight: '500',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  articlesFeed: {
    gap: 14,
  },
  /* Tarjeta de Publicación: Idéntica al estilo de la app Principal */
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1EAEF',
    shadowColor: '#223E52',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorClickArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E1EAEF',
    borderWidth: 1.5,
    borderColor: '#E1EAEF',
  },
  authorAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E1EAEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarFallbackText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  authorInfo: {
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
    color: colors.primaryDark,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E1EAEF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  authorSpecialty: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  postTime: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  articleTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: colors.coffeeDeep,
    lineHeight: 22,
    marginBottom: 8,
  },
  summaryCallout: {
    backgroundColor: '#F0F5F8',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 12.5,
    color: colors.primaryDark,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  contentParagraph: {
    fontSize: 13.5,
    color: colors.textPrimary,
    lineHeight: 21,
    marginBottom: 12,
  },
  tipsBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 5,
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
  postMediaWrapper: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E1EAEF',
    marginBottom: 12,
  },
  postMediaImage: {
    width: '100%',
    height: 220,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F5F8',
  },
  reactionIconsOverlap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  miniReactionImg: {
    width: 12,
    height: 12,
  },
  counterText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '700',
    marginLeft: 4,
  },
  actionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E1EAEF',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionReactionIcon: {
    width: 20,
    height: 20,
  },
  actionBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 30,
    borderWidth: 1,
    borderColor: '#E1EAEF',
    alignItems: 'center',
    textAlign: 'center',
    gap: 10,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E1EAEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 380,
  },
});
