import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Linking,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Psychologist } from '../../types/psychologist';
import { Post } from '../../types/post';
import { getPsychologistPosts } from '../../services/psychologistsService';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PsychologistDetailModalProps {
  visible: boolean;
  psychologist: Psychologist | null;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PsychologistDetailModal: React.FC<PsychologistDetailModalProps> = ({
  visible,
  psychologist,
  onClose,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    if (visible && psychologist) {
      setIsLoadingPosts(true);
      getPsychologistPosts(psychologist.nombre, psychologist.id)
        .then((fetchedPosts) => {
          setPosts(fetchedPosts);
          setIsLoadingPosts(false);
        })
        .catch(() => setIsLoadingPosts(false));
    }
  }, [visible, psychologist]);

  if (!visible || !psychologist) return null;

  const defaultCover =
    psychologist.fotoPortada ||
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80';

  const handleOpenWhatsApp = () => {
    const phone = psychologist.whatsapp || psychologist.telefono;
    if (!phone) {
      Alert.alert('Contacto', 'No hay número de WhatsApp registrado.');
      return;
    }
    const cleanNumber = phone.replace(/[^\d]/g, '');
    const message = encodeURIComponent(
      `Hola ${psychologist.nombre}, te contacto a través de la aplicación Entre Nosotros para solicitar informes de consulta.`
    );
    Linking.openURL(`https://wa.me/${cleanNumber}?text=${message}`).catch(() => {
      Alert.alert('WhatsApp', `Número: ${phone}`);
    });
  };

  const handleOpenEmail = () => {
    if (!psychologist.correo) {
      Alert.alert('Contacto', 'No hay correo registrado.');
      return;
    }
    const subject = encodeURIComponent('Consulta Psicológica - Entre Nosotros');
    const body = encodeURIComponent(
      `Hola ${psychologist.nombre},\n\nTe contacto desde la aplicación Entre Nosotros para solicitar información sobre tus servicios.\n\nGracias.`
    );
    Linking.openURL(`mailto:${psychologist.correo}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Correo', psychologist.correo);
    });
  };

  const handleOpenMap = () => {
    if (!psychologist.ubicacion) {
      Alert.alert('Ubicación', 'No hay ubicación registrada.');
      return;
    }
    const loc = psychologist.ubicacion.trim();
    if (loc.startsWith('http://') || loc.startsWith('https://') || loc.startsWith('maps:')) {
      Linking.openURL(loc).catch(() => {
        Alert.alert('Ubicación', loc);
      });
    } else {
      const mapsQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
      Linking.openURL(mapsQueryUrl).catch(() => {
        Alert.alert('Ubicación', loc);
      });
    }
  };

  const handleOpenWebsite = () => {
    if (!psychologist.sitioWeb) {
      Alert.alert('Sitio Web', 'Este especialista no tiene registrado un sitio web.');
      return;
    }
    let url = psychologist.sitioWeb.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Sitio Web', url);
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.rootContainer}>
        {/* Top Sticky Navigation Bar */}
        <SafeAreaView style={styles.navBarSafeArea}>
          <View style={styles.navBar}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.navBackBtn}
              activeOpacity={0.7}
              accessibilityLabel="Volver"
            >
              <Ionicons name="arrow-back" size={22} color={colors.coffeeDark} />
            </TouchableOpacity>

            <View style={styles.navTitleRow}>
              <Text style={styles.navTitleText} numberOfLines={1}>
                {psychologist.nombre}
              </Text>
              <Ionicons name="checkmark-circle" size={16} color="#2563EB" style={{ marginLeft: 4 }} />
            </View>

            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Cover Photo Banner */}
          <View style={styles.coverBanner}>
            <Image source={{ uri: defaultCover }} style={styles.coverImage} resizeMode="cover" />
            <View style={styles.coverOverlay} />
          </View>

          {/* 2. Avatar & Main Identity Card */}
          <View style={styles.profileHeaderCard}>
            {/* Overlapping Avatar */}
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: psychologist.imagen }} style={styles.avatarImage} resizeMode="cover" />
              <View style={styles.avatarVerifiedBadge}>
                <Ionicons name="checkmark" size={14} color={colors.white} />
              </View>
            </View>

            {/* Name with Verified Badge */}
            <View style={styles.nameHeaderRow}>
              <Text style={styles.profileNameText}>{psychologist.nombre}</Text>
              <Ionicons name="checkmark-circle" size={20} color="#2563EB" style={{ marginLeft: 6 }} />
            </View>

            {/* Specialty */}
            <Text style={styles.profileSpecialtyText}>{psychologist.especialidad}</Text>

            {/* Ciudad */}
            {psychologist.ciudad ? (
              <View style={styles.modalCityRow}>
                <Ionicons name="location-sharp" size={13} color={colors.coffeePrimary} style={{ marginRight: 4 }} />
                <Text style={styles.modalCityText}>{psychologist.ciudad}</Text>
              </View>
            ) : null}

            {/* Modalidad Badge */}
            <View style={styles.modalidadPill}>
              <Ionicons
                name={
                  psychologist.modalidad?.includes('línea') || psychologist.modalidad?.includes('Línea')
                    ? 'videocam'
                    : 'business'
                }
                size={13}
                color={colors.coffeePrimary}
              />
              <Text style={styles.modalidadPillText}>
                Modalidad: {psychologist.modalidad || 'Presencial y En línea'}
              </Text>
            </View>
          </View>

          {/* 3. 4 QUICK ACTION CONTACT ICONS IN A 4-COLUMN GRID */}
          <View style={styles.gridSection}>
            <Text style={styles.sectionLabel}>Canales de Contacto Directo</Text>
            <View style={styles.actionsGrid4}>
              {/* 1. Ubicación */}
              <TouchableOpacity
                style={styles.gridActionItem}
                activeOpacity={0.82}
                onPress={handleOpenMap}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: '#FFE4E6' }]}>
                  <Ionicons name="location" size={22} color="#E11D48" />
                </View>
                <Text style={styles.gridActionTitle}>Ubicación</Text>
                <Text style={styles.gridActionSub} numberOfLines={1}>
                  {psychologist.ciudad || 'Ver mapa'}
                </Text>
              </TouchableOpacity>

              {/* 2. WhatsApp */}
              <TouchableOpacity
                style={styles.gridActionItem}
                activeOpacity={0.82}
                onPress={handleOpenWhatsApp}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="logo-whatsapp" size={22} color="#16A34A" />
                </View>
                <Text style={styles.gridActionTitle}>WhatsApp</Text>
                <Text style={styles.gridActionSub} numberOfLines={1}>Mensaje</Text>
              </TouchableOpacity>

              {/* 3. Correo */}
              <TouchableOpacity
                style={styles.gridActionItem}
                activeOpacity={0.82}
                onPress={handleOpenEmail}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="mail" size={22} color="#DC2626" />
                </View>
                <Text style={styles.gridActionTitle}>Correo</Text>
                <Text style={styles.gridActionSub} numberOfLines={1}>Escribir</Text>
              </TouchableOpacity>

              {/* 4. Sitio Web */}
              <TouchableOpacity
                style={styles.gridActionItem}
                activeOpacity={0.82}
                onPress={handleOpenWebsite}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="globe-outline" size={22} color="#2563EB" />
                </View>
                <Text style={styles.gridActionTitle}>Sitio Web</Text>
                <Text style={styles.gridActionSub} numberOfLines={1}>Visitar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Sobre el Especialista (Descripción Amplia y Diseñada) */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconCircle}>
                <Ionicons name="person-outline" size={18} color={colors.coffeePrimary} />
              </View>
              <Text style={styles.cardHeaderTitle}>Sobre el Especialista</Text>
            </View>

            <View style={styles.quoteBox}>
              <Ionicons name="chatbox-ellipses-outline" size={20} color={colors.coffeePrimary} style={{ marginBottom: 6 }} />
              <Text style={styles.descriptionText}>
                {psychologist.descripcion ||
                  'Especialista comprometido con brindar un espacio seguro, confidencial y empático para el cuidado de tu salud mental.'}
              </Text>
            </View>
          </View>

          {/* 5. Temas y Especialidades que Trata */}
          {psychologist.temas && psychologist.temas.length > 0 ? (
            <View style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconCircle}>
                  <Ionicons name="sparkles-outline" size={18} color={colors.coffeePrimary} />
                </View>
                <Text style={styles.cardHeaderTitle}>Temas y Áreas de Atención</Text>
              </View>

              <View style={styles.allTopicsGrid}>
                {psychologist.temas.map((tema, idx) => (
                  <View key={idx} style={styles.fullTopicPill}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={colors.coffeePrimary} />
                    <Text style={styles.fullTopicPillText}>{tema}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* 6. PUBLICACIONES DEL PSICÓLOGO */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconCircle}>
                <Ionicons name="newspaper-outline" size={18} color={colors.coffeePrimary} />
              </View>
              <Text style={styles.cardHeaderTitle}>Publicaciones y Consejos</Text>
            </View>

            {isLoadingPosts ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.coffeePrimary} />
              </View>
            ) : posts.length > 0 ? (
              <View style={styles.postsList}>
                {posts.map((post) => (
                  <View key={post.id} style={styles.psychologistPostCard}>
                    <View style={styles.postAuthorRow}>
                      <Image
                        source={{ uri: psychologist.imagen }}
                        style={styles.postAuthorAvatar}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.postAuthorName}>{psychologist.nombre}</Text>
                          <Ionicons name="checkmark-circle" size={14} color="#2563EB" style={{ marginLeft: 4 }} />
                        </View>
                        <Text style={styles.postAuthorSub}>Especialista Verificado</Text>
                      </View>
                    </View>

                    <Text style={styles.postContentText}>{post.content}</Text>

                    {post.hashtags && post.hashtags.length > 0 ? (
                      <View style={styles.postHashtagsRow}>
                        {post.hashtags.map((tag, hIdx) => (
                          <Text key={hIdx} style={styles.postHashtagText}>
                            {tag}
                          </Text>
                        ))}
                      </View>
                    ) : null}

                    {/* Post Interactions summary */}
                    <View style={styles.postFooterRow}>
                      <View style={styles.postStat}>
                        <Ionicons name="heart" size={14} color="#E11D48" />
                        <Text style={styles.postStatText}>
                          {(post.reactions?.teAbrazo || 0) +
                            (post.reactions?.teEscucho || 0) +
                            (post.reactions?.noEstasSolo || 0) +
                            (post.reactions?.fuerza || 0)}
                        </Text>
                      </View>
                      <View style={styles.postStat}>
                        <Ionicons name="chatbubble-outline" size={14} color={colors.coffeePrimary} />
                        <Text style={styles.postStatText}>{post.commentsCount || 0}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyPostsBox}>
                <Ionicons name="document-text-outline" size={32} color={colors.coffeePrimary} />
                <Text style={styles.emptyPostsTitle}>Espacio de Publicaciones</Text>
                <Text style={styles.emptyPostsDesc}>
                  {psychologist.nombre} compartirá reflexiones, artículos y consejos de bienestar emocional en este espacio.
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  navBarSafeArea: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  navBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  navBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH - 120,
  },
  navTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  /* 1. Cover Photo */
  coverBanner: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: colors.surface,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  /* 2. Profile Header Card */
  profileHeaderCard: {
    backgroundColor: colors.white,
    marginTop: -45,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: -55,
    marginBottom: 10,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3.5,
    borderColor: colors.white,
    backgroundColor: colors.surface,
  },
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.white,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  profileNameText: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
  },
  profileSpecialtyText: {
    fontSize: 13.5,
    color: colors.coffeePrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  modalCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalCityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalidadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EAE3',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5D5C8',
    gap: 6,
  },
  modalidadPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  /* 3. 4-Column Grid */
  gridSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.coffeeDark,
    marginBottom: 10,
    paddingLeft: 4,
    letterSpacing: 0.2,
  },
  actionsGrid4: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  gridActionItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridActionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.coffeeDark,
    textAlign: 'center',
    marginBottom: 1,
  },
  gridActionSub: {
    fontSize: 9.5,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  /* 4. Section Card */
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 18,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  quoteBox: {
    backgroundColor: '#FAF7F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAE3DF',
    borderLeftWidth: 4,
    borderLeftColor: colors.coffeePrimary,
  },
  descriptionText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.textPrimary,
    fontStyle: 'normal',
  },
  /* 5. Topics Grid */
  allTopicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fullTopicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EAE3',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5D5C8',
    gap: 5,
  },
  fullTopicPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  /* 6. Posts List */
  postsList: {
    gap: 12,
  },
  psychologistPostCard: {
    backgroundColor: '#FAF7F5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAE3DF',
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  postAuthorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.coffeePrimary,
    backgroundColor: colors.surface,
  },
  postAuthorName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  postAuthorSub: {
    fontSize: 10.5,
    color: colors.coffeePrimary,
    fontWeight: '600',
  },
  postContentText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  postHashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  postHashtagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A7FB8',
  },
  postFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EAE3DF',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  emptyPostsBox: {
    backgroundColor: '#FAF7F5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE3DF',
    borderStyle: 'dashed',
    gap: 6,
  },
  emptyPostsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.coffeeDark,
    marginTop: 2,
  },
  emptyPostsDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 12,
  },
});
