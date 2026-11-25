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
import {
  subscribeToTopicArticles,
  toggleTopicArticleReaction,
  toggleSaveTopicArticle,
} from '../../services/blogService';
import { ReactionType, REACTIONS_MAP } from '../../types/post';
import { ReactionPicker } from '../Feed/ReactionPicker';
import { BottomTabBar, TabId } from '../Navigation/BottomTabBar';
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
  onTabPress?: (tabId: TabId) => void;
  onOpenStreakModal?: () => void;
}

export const TopicArticlesModal: React.FC<TopicArticlesModalProps> = ({
  visible,
  topic,
  onClose,
  onOpenPsychologistDetail,
  onRequireAuth,
  embedded = false,
  onTabPress,
  onOpenStreakModal,
}) => {
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && windowWidth >= 1024;
  const isEmbeddedMode = embedded || isDesktop;

  const [articles, setArticles] = useState<TopicArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedArticle, setSelectedArticle] = useState<TopicArticle | null>(null);

  // Reaction picker state
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [activeArticleForReaction, setActiveArticleForReaction] = useState<string | null>(null);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  useEffect(() => {
    if (!visible || !topic) {
      setArticles([]);
      setIsLoading(true);
      setSelectedArticle(null);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToTopicArticles(topic.id, (data) => {
      setArticles(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [visible, topic]);

  // Keep selectedArticle synchronized when articles array updates in real-time
  useEffect(() => {
    if (selectedArticle) {
      const updated = articles.find((a) => a.id === selectedArticle.id);
      if (updated) {
        setSelectedArticle(updated);
      }
    }
  }, [articles]);

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
      ? 'Tristeza profunda, anhedonia, pérdida de energía y herramientas de acompañamiento profesional.'
      : 'Preocupación excesiva, rumiación, ataques de pánico y técnicas clínicas de regulación emocional.');

  // Responsive widths for cuadritos grid
  const contentWidth = isDesktop ? Math.min(windowWidth - 36, 684) : windowWidth - 28;
  const isTwoColumns = contentWidth >= 360;
  const cardWidth = isTwoColumns ? Math.floor((contentWidth - 12) / 2) : contentWidth;

  const modalBody = (
    <SafeAreaView style={[styles.safeArea, isDesktop && styles.desktopSafeArea]}>
      {/* Top Header Bar in crisp white & soft sky blue */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (selectedArticle) {
              setSelectedArticle(null);
            } else {
              onClose();
            }
          }}
          activeOpacity={0.75}
          accessibilityLabel={selectedArticle ? 'Volver a artículos' : 'Volver al blog'}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primaryDark} />
          <Text style={styles.backButtonText}>
            {selectedArticle ? `Artículos de ${topic.titulo}` : 'Volver al Blog'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeIconBtn}
          onPress={onClose}
          activeOpacity={0.75}
          accessibilityLabel="Cerrar"
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
        {/* ================================================================ */}
        {/* VISTA 1: DETALLE DE LECTURA DEL ARTÍCULO COMPLETO                */}
        {/* ================================================================ */}
        {selectedArticle ? (
          <View style={styles.readerContainer}>
            {/* Sub-barra de regreso a la lista de cuadritos */}
            <TouchableOpacity
              style={styles.backToGridBtn}
              onPress={() => setSelectedArticle(null)}
              activeOpacity={0.75}
            >
              <Ionicons name="chevron-back" size={18} color={colors.primary} />
              <Text style={styles.backToGridText}>Ver todos los artículos de {topic.titulo}</Text>
            </TouchableOpacity>

            <View style={styles.fullArticleCard}>
              {/* Encabezado del Especialista */}
              <View style={styles.readerAuthorRow}>
                <TouchableOpacity
                  style={styles.authorClickArea}
                  activeOpacity={0.75}
                  onPress={() => {
                    if (onOpenPsychologistDetail) {
                      onOpenPsychologistDetail(selectedArticle.psicologoId, {
                        id: selectedArticle.psicologoId,
                        nombre: selectedArticle.psicologoNombre,
                        especialidad: selectedArticle.psicologoEspecialidad,
                        imagen: selectedArticle.psicologoAvatar,
                        cedula: selectedArticle.psicologoCedula,
                      });
                    }
                  }}
                >
                  {selectedArticle.psicologoAvatar ? (
                    <Image
                      source={{ uri: selectedArticle.psicologoAvatar }}
                      style={styles.readerAuthorAvatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.readerAuthorAvatarFallback}>
                      <Text style={styles.readerAuthorAvatarFallbackText}>
                        {(selectedArticle.psicologoNombre || 'P').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.readerAuthorInfo}>
                    <View style={styles.authorNameRow}>
                      <Text style={styles.readerAuthorName} numberOfLines={1}>
                        {selectedArticle.psicologoNombre}
                      </Text>
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                        <Text style={styles.verifiedBadgeText}>Especialista</Text>
                      </View>
                    </View>

                    <Text style={styles.authorSpecialty} numberOfLines={1}>
                      {selectedArticle.psicologoEspecialidad}
                      {selectedArticle.psicologoCedula ? ` · Cédula: ${selectedArticle.psicologoCedula}` : ''}
                    </Text>
                    <Text style={styles.postTime}>
                      {formatTimeAgo(selectedArticle.timestamp, selectedArticle.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Título Grande del Artículo */}
              {selectedArticle.titulo ? (
                <Text style={styles.fullArticleTitle}>{selectedArticle.titulo}</Text>
              ) : null}

              {/* Imagen destacada subida por el especialista */}
              {(selectedArticle.imagenUrl || topic.imagen) ? (
                <View style={styles.fullArticleMediaWrapper}>
                  <Image
                    source={{ uri: selectedArticle.imagenUrl || topic.imagen }}
                    style={styles.fullArticleMediaImage}
                    resizeMode="cover"
                  />
                </View>
              ) : null}

              {/* Resumen opcional */}
              {selectedArticle.resumen ? (
                <View style={styles.summaryCallout}>
                  <Text style={styles.summaryText}>{selectedArticle.resumen}</Text>
                </View>
              ) : null}

              {/* Contenido redactado */}
              <Text style={styles.fullContentParagraph}>{selectedArticle.contenido}</Text>

              {/* Consejos y herramientas prácticas */}
              {selectedArticle.recomendaciones ? (
                <View style={styles.tipsBox}>
                  <View style={styles.tipsHeaderRow}>
                    <Ionicons name="bulb-outline" size={17} color="#15803D" />
                    <Text style={styles.tipsHeaderTitle}>
                      Herramientas y Recomendaciones Clínicas:
                    </Text>
                  </View>
                  <Text style={styles.tipsText}>{selectedArticle.recomendaciones}</Text>
                </View>
              ) : null}

              {/* Contador de reacciones acumuladas */}
              {(() => {
                const totalReactions =
                  (selectedArticle.reactions?.teAbrazo || 0) +
                  (selectedArticle.reactions?.teEscucho || 0) +
                  (selectedArticle.reactions?.noEstasSolo || 0) +
                  (selectedArticle.reactions?.fuerza || 0);

                if (totalReactions <= 0) return null;

                return (
                  <View style={styles.counterRow}>
                    <View style={styles.reactionIconsOverlap}>
                      {selectedArticle.reactions && selectedArticle.reactions.teAbrazo > 0 && (
                        <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.teAbrazo.bgColor }]}>
                          <Image
                            source={REACTIONS_MAP.teAbrazo.image}
                            style={styles.miniReactionImg}
                            resizeMode="contain"
                          />
                        </View>
                      )}
                      {selectedArticle.reactions && selectedArticle.reactions.teEscucho > 0 && (
                        <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.teEscucho.bgColor }]}>
                          <Image
                            source={REACTIONS_MAP.teEscucho.image}
                            style={styles.miniReactionImg}
                            resizeMode="contain"
                          />
                        </View>
                      )}
                      {selectedArticle.reactions && selectedArticle.reactions.noEstasSolo > 0 && (
                        <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.noEstasSolo.bgColor }]}>
                          <Image
                            source={REACTIONS_MAP.noEstasSolo.image}
                            style={styles.miniReactionImg}
                            resizeMode="contain"
                          />
                        </View>
                      )}
                      {selectedArticle.reactions && selectedArticle.reactions.fuerza > 0 && (
                        <View style={[styles.miniCircle, { backgroundColor: REACTIONS_MAP.fuerza.bgColor }]}>
                          <Image
                            source={REACTIONS_MAP.fuerza.image}
                            style={styles.miniReactionImg}
                            resizeMode="contain"
                          />
                        </View>
                      )}
                    </View>
                    <Text style={styles.counterText}>{totalReactions} apoyos</Text>
                  </View>
                );
              })()}

              {/* Acciones: ÚNICAMENTE REACCIONAR Y GUARDAR (NO COMENTAR) */}
              {(() => {
                const userReaction = currentUserId ? selectedArticle.userReactions?.[currentUserId] : undefined;
                const isSaved = currentUserId ? selectedArticle.savedBy?.includes(currentUserId) : false;
                const activeReactionConfig = userReaction ? REACTIONS_MAP[userReaction] : null;

                return (
                  <View style={styles.actionsFooter}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                      onPress={() => handleTapReaction(selectedArticle)}
                      onLongPress={(e) => handleOpenReactionPicker(selectedArticle.id, e.nativeEvent)}
                      delayLongPress={220}
                    >
                      {activeReactionConfig ? (
                        <Image
                          source={activeReactionConfig.image}
                          style={styles.actionReactionIcon}
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons name="heart-outline" size={20} color={colors.primary} />
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

                    <TouchableOpacity
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                      onPress={() => handleToggleSave(selectedArticle.id)}
                    >
                      <Ionicons
                        name={isSaved ? 'bookmark' : 'bookmark-outline'}
                        size={20}
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
                );
              })()}
            </View>

            {/* Botón inferior de regreso */}
            <TouchableOpacity
              style={styles.bottomReturnBtn}
              onPress={() => setSelectedArticle(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={16} color={colors.primaryDark} />
              <Text style={styles.bottomReturnBtnText}>
                Volver a la lista de artículos de {topic.titulo}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ================================================================ */
          /* VISTA 2: BANNER GRANDE COMPLETO + GRID DE CUADRITOS ATRACTIVOS   */
          /* ================================================================ */
          <>
            {/* BANNER PANORÁMICO TAMAÑO COMPLETO */}
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

            {/* Cabecera de la sección de artículos */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithIcon}>
                <Ionicons name="grid-outline" size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>Artículos de Especialistas</Text>
              </View>
              {articles.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{articles.length}</Text>
                </View>
              )}
            </View>

            {/* ESTADO DE CARGA */}
            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Cargando artículos...</Text>
              </View>
            ) : articles.length > 0 ? (
              /* GRID DE CUADRITOS VISUALMENTE ATRACTIVOS */
              <View style={styles.gridContainer}>
                {articles.map((item) => {
                  const cardPhoto = item.imagenUrl || topic.imagen;
                  const totalReactions =
                    (item.reactions?.teAbrazo || 0) +
                    (item.reactions?.teEscucho || 0) +
                    (item.reactions?.noEstasSolo || 0) +
                    (item.reactions?.fuerza || 0);

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.cuadritoCard, { width: cardWidth }]}
                      activeOpacity={0.88}
                      onPress={() => setSelectedArticle(item)}
                    >
                      {/* Imagen superior del cuadrito */}
                      <View style={styles.cuadritoImageWrapper}>
                        <Image
                          source={{ uri: cardPhoto }}
                          style={styles.cuadritoImage}
                          resizeMode="cover"
                        />
                        <View style={styles.cuadritoImageOverlay}>
                          {totalReactions > 0 ? (
                            <View style={styles.cuadritoReactionPill}>
                              <Ionicons name="heart" size={11} color="#E11D48" />
                              <Text style={styles.cuadritoReactionCount}>{totalReactions}</Text>
                            </View>
                          ) : null}
                          <View style={styles.cuadritoTimePill}>
                            <Text style={styles.cuadritoTimePillText}>
                              {formatTimeAgo(item.timestamp, item.createdAt)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Contenido interior del cuadrito */}
                      <View style={styles.cuadritoBody}>
                        {/* Autor psicólogo */}
                        <TouchableOpacity
                          style={styles.cuadritoAuthorRow}
                          activeOpacity={0.75}
                          onPress={(e) => {
                            e.stopPropagation();
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
                              style={styles.cuadritoAvatar}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.cuadritoAvatarFallback}>
                              <Text style={styles.cuadritoAvatarFallbackText}>
                                {(item.psicologoNombre || 'P').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}
                          <View style={styles.cuadritoAuthorTexts}>
                            <View style={styles.cuadritoAuthorNameRow}>
                              <Text style={styles.cuadritoAuthorName} numberOfLines={1}>
                                {item.psicologoNombre}
                              </Text>
                              <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                            </View>
                            <Text style={styles.cuadritoAuthorSpec} numberOfLines={1}>
                              {item.psicologoEspecialidad}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {/* Título del artículo */}
                        <Text style={styles.cuadritoTitle} numberOfLines={2}>
                          {item.titulo || 'Artículo Clínico'}
                        </Text>

                        {/* Pequeño resumen si existe */}
                        {item.resumen ? (
                          <Text style={styles.cuadritoSnippet} numberOfLines={2}>
                            {item.resumen}
                          </Text>
                        ) : null}

                        {/* Footer del cuadrito con botón de lectura */}
                        <View style={styles.cuadritoFooter}>
                          <View style={styles.cuadritoReadAction}>
                            <Text style={styles.cuadritoReadText}>Leer artículo</Text>
                            <Ionicons name="arrow-forward" size={13} color={colors.primary} />
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="book-outline" size={32} color={colors.primary} />
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
          </>
        )}
      </ScrollView>

      {/* Barra de navegación inferior siempre visible */}
      <BottomTabBar
        activeTab="blog"
        onTabPress={(tabId) => {
          if (tabId === 'blog') {
            if (selectedArticle) {
              setSelectedArticle(null);
            } else {
              onClose();
            }
          } else {
            onClose();
            if (onTabPress) onTabPress(tabId);
          }
        }}
        onOpenStreakModal={() => {
          onClose();
          if (onOpenStreakModal) onOpenStreakModal();
        }}
      />

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
      onRequestClose={() => {
        if (selectedArticle) {
          setSelectedArticle(null);
        } else {
          onClose();
        }
      }}
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
    maxWidth: 760,
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
    paddingBottom: 95,
  },
  desktopScrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    paddingBottom: 95,
  },

  /* ======================================================================== */
  /* BANNER PANORÁMICO TAMAÑO COMPLETO CON FOTO Y TEXTO                       */
  /* ======================================================================== */
  bannerWrapper: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1EAEF',
    shadowColor: '#223E52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  bannerImage: {
    width: '100%',
    minHeight: 280, // Tamaño grande completo
    height: 290,
  },
  bannerImageStyle: {
    borderRadius: 24,
  },
  bannerOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },

  /* Cabecera de la sección */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  countBadge: {
    backgroundColor: '#E1EAEF',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },

  /* ======================================================================== */
  /* GRID DE CUADRITOS ATRACTIVOS                                             */
  /* ======================================================================== */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  cuadritoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E1EAEF',
    overflow: 'hidden',
    shadowColor: '#223E52',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 2,
  },
  cuadritoImageWrapper: {
    width: '100%',
    height: 135,
    backgroundColor: '#E1EAEF',
    position: 'relative',
  },
  cuadritoImage: {
    width: '100%',
    height: '100%',
  },
  cuadritoImageOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cuadritoReactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cuadritoReactionCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E11D48',
  },
  cuadritoTimePill: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
  },
  cuadritoTimePillText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cuadritoBody: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  cuadritoAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  cuadritoAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E1EAEF',
  },
  cuadritoAvatarFallback: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E1EAEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuadritoAvatarFallbackText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  cuadritoAuthorTexts: {
    flex: 1,
  },
  cuadritoAuthorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cuadritoAuthorName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.primaryDark,
    flexShrink: 1,
  },
  cuadritoAuthorSpec: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cuadritoTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.coffeeDeep,
    lineHeight: 18,
    minHeight: 36,
  },
  cuadritoSnippet: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  cuadritoFooter: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F5F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cuadritoReadAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cuadritoReadText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.primary,
  },

  /* ======================================================================== */
  /* VISTA DEL LECTOR DE ARTÍCULO COMPLETO                                    */
  /* ======================================================================== */
  readerContainer: {
    width: '100%',
  },
  backToGridBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E1EAEF',
  },
  backToGridText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  fullArticleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E1EAEF',
    shadowColor: '#223E52',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  readerAuthorRow: {
    marginBottom: 16,
  },
  authorClickArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  readerAuthorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E1EAEF',
    borderWidth: 1.5,
    borderColor: '#E1EAEF',
  },
  readerAuthorAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E1EAEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readerAuthorAvatarFallbackText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  readerAuthorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readerAuthorName: {
    fontSize: 15,
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
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  authorSpecialty: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  postTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  fullArticleTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.coffeeDeep,
    lineHeight: 28,
    marginBottom: 14,
  },
  fullArticleMediaWrapper: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E1EAEF',
    marginBottom: 16,
  },
  fullArticleMediaImage: {
    width: '100%',
    height: '100%',
  },
  summaryCallout: {
    backgroundColor: '#F0F5F8',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  summaryText: {
    fontSize: 13,
    color: colors.primaryDark,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  fullContentParagraph: {
    fontSize: 14.5,
    color: colors.textPrimary,
    lineHeight: 23,
    marginBottom: 16,
  },
  tipsBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipsHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  tipsText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 19,
  },
  bottomReturnBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1EAEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bottomReturnBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
  },

  /* Acciones y contadores compartidos */
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F5F8',
  },
  reactionIconsOverlap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  miniReactionImg: {
    width: 13,
    height: 13,
  },
  counterText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    marginLeft: 4,
  },
  actionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E1EAEF',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionReactionIcon: {
    width: 22,
    height: 22,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  /* Empty state */
  loadingBox: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 36,
    borderWidth: 1,
    borderColor: '#E1EAEF',
    alignItems: 'center',
    textAlign: 'center',
    gap: 12,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E1EAEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 380,
  },
});
