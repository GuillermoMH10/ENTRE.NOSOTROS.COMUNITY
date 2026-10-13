import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { createPost, fetchHashtags } from '../services/postsService';
import { HashtagItem } from '../types/post';

interface CreatePostScreenProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  embedded?: boolean;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({
  visible,
  onClose,
  onPostCreated,
  embedded = false,
}) => {
  const { user } = useAuth();

  const [content, setContent] = useState('');
  const [photoSlots, setPhotoSlots] = useState<(string | null)[]>([null, null, null]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtagsList, setHashtagsList] = useState<string[]>([]);
  const [popularHashtags, setPopularHashtags] = useState<HashtagItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing hashtags from Firestore
  useEffect(() => {
    if (visible) {
      fetchHashtags().then((tags) => setPopularHashtags(tags));
    }
  }, [visible]);

  // Pick image for a specific slot (0, 1 or 2)
  const handleSlotPress = async (slotIndex: number) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se requiere permiso para acceder a tu galería de fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.35, // High visual fidelity, low payload size
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const finalUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        setPhotoSlots((prev) => {
          const next = [...prev];
          next[slotIndex] = finalUri;
          return next;
        });
      }
    } catch (err) {
      console.warn('Error al seleccionar imagen:', err);
    }
  };

  // Remove item from specific slot
  const handleRemoveSlotImage = (slotIndex: number) => {
    setPhotoSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  // Add hashtag
  const handleAddHashtag = (tagToAdd?: string) => {
    const raw = (tagToAdd || hashtagInput).trim();
    if (!raw) return;

    let cleanTag = raw.startsWith('#') ? raw : `#${raw}`;
    cleanTag = cleanTag.replace(/\s+/g, '');

    if (cleanTag.length > 1 && !hashtagsList.includes(cleanTag)) {
      setHashtagsList((prev) => [...prev, cleanTag]);
    }
    setHashtagInput('');
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtagsList((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Submit Post
  const handlePublish = async () => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para publicar.');
      return;
    }

    const attachedMedia = photoSlots.filter((uri): uri is string => uri !== null);

    if (!content.trim() && attachedMedia.length === 0) {
      Alert.alert('Publicación vacía', 'Por favor escribe algo o agrega una foto.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPost(
        user.id,
        user.username,
        user.avatarUrl,
        content,
        attachedMedia,
        hashtagsList
      );

      setIsSubmitting(false);

      if (result.success) {
        setContent('');
        setPhotoSlots([null, null, null]);
        setHashtagsList([]);
        setHashtagInput('');
        onPostCreated();
        onClose();
      } else {
        Alert.alert('Aviso', result.error || 'No se pudo publicar. Intenta nuevamente.');
      }
    } catch (error: any) {
      setIsSubmitting(false);
      Alert.alert('Error', error.message || 'Ocurrió un error al procesar tu publicación.');
    }
  };

  const hasContentOrMedia =
    content.trim().length > 0 || photoSlots.some((uri) => uri !== null);

  if (!visible) return null;

  const contentEl = (
    <KeyboardAvoidingView
      style={[styles.rootContainer, embedded && styles.rootContainerEmbedded]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header Bar */}
      <View style={[styles.topBar, embedded && styles.topBarEmbedded]}>
        <View style={styles.topBarSideLeft}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7} accessibilityLabel="Cerrar">
            <Ionicons name="close" size={20} color={colors.coffeeDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.topBarCenter}>
          <Text style={styles.barTitle}>Crear Publicación</Text>
          <Text style={styles.barSubtitle}>Tu espacio seguro</Text>
        </View>

        <View style={styles.topBarSideRight}>
          <TouchableOpacity
            style={[
              styles.publishBtn,
              !hasContentOrMedia || isSubmitting ? styles.publishBtnDisabled : null,
            ]}
            onPress={handlePublish}
            disabled={!hasContentOrMedia || isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.publishBtnText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, embedded && styles.scrollContentEmbedded]}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Info Bar with Slogan */}
        {user && (
          <View style={[styles.userRow, embedded && styles.userRowCompact]}>
            <Image source={{ uri: user.avatarUrl }} style={[styles.avatar, embedded && styles.avatarCompact]} />
            <View style={styles.userTextCol}>
              <View style={styles.userBadgeRow}>
                <Text style={styles.username}>@{user.username}</Text>
                <View style={styles.communityPill}>
                  <Ionicons name="shield-checkmark" size={11} color="#059669" />
                  <Text style={styles.communityPillText}>Comunidad</Text>
                </View>
              </View>
              <Text style={styles.sloganText} numberOfLines={1}>
                Aquí puedes hablar, escuchar y encontrar apoyo
              </Text>
            </View>
          </View>
        )}

        {/* Main Description Input inside sleek compact box */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.contentInput, embedded && styles.contentInputEmbedded]}
            placeholder="¿Qué estás sintiendo hoy? Desahógate, este es tu espacio..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={content}
            onChangeText={setContent}
            underlineColorAndroid="transparent"
            autoFocus
          />
        </View>

        {/* 3 Ready-to-Use Compact Photo Slots */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionHeading}>Fotos (hasta 3):</Text>
          <View style={styles.slotsRow}>
            {[0, 1, 2].map((slotIndex) => {
              const mediaUri = photoSlots[slotIndex];

              return (
                <View key={slotIndex} style={styles.slotWrapper}>
                  {mediaUri ? (
                    <View style={styles.slotImageContainer}>
                      <Image source={{ uri: mediaUri }} style={styles.slotImage} />
                      <TouchableOpacity
                        style={styles.removeSlotBtn}
                        onPress={() => handleRemoveSlotImage(slotIndex)}
                        activeOpacity={0.8}
                        accessibilityLabel="Eliminar foto"
                      >
                        <Ionicons name="close" size={12} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.emptySlot}
                      onPress={() => handleSlotPress(slotIndex)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Agregar foto ${slotIndex + 1}`}
                    >
                      <View style={styles.slotIconCircle}>
                        <Ionicons name="camera-outline" size={16} color={colors.coffeePrimary} />
                      </View>
                      <Text style={styles.slotLabel}>Foto {slotIndex + 1}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Selected Hashtags Chips */}
        {hashtagsList.length > 0 && (
          <View style={styles.hashtagsContainer}>
            {hashtagsList.map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveHashtag(tag)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name="close-circle" size={14} color="#4A7FB8" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Hashtag Input Field */}
        <View style={styles.hashtagInputRow}>
          <View style={styles.hashtagFieldWrapper}>
            <Text style={styles.hashSymbol}>#</Text>
            <TextInput
              style={styles.hashtagTextInput}
              placeholder="agrega_un_tema"
              placeholderTextColor={colors.textMuted}
              value={hashtagInput}
              onChangeText={setHashtagInput}
              onSubmitEditing={() => handleAddHashtag()}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={styles.addTagBtn}
            onPress={() => handleAddHashtag()}
            activeOpacity={0.7}
            accessibilityLabel="Agregar tema"
          >
            <Ionicons name="add" size={18} color={colors.coffeePrimary} />
          </TouchableOpacity>
        </View>

        {/* Suggested / Popular Hashtags */}
        {popularHashtags.length > 0 && (
          <View style={styles.suggestedSection}>
            <Text style={styles.suggestedTitle}>Temas sugeridos:</Text>
            <View style={styles.suggestedChipsRow}>
              {popularHashtags.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestedChip}
                  onPress={() => handleAddHashtag(item.tag)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestedChipText}>{item.tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Compact Safe Space Reminder */}
        <View style={styles.safeNoticeRow}>
          <Ionicons name="heart" size={13} color="#3B82F6" style={{ marginRight: 6 }} />
          <Text style={styles.safeNoticeText}>
            Espacio de escucha mutua y respeto. Cuídate y cuida a los demás 🌿
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (embedded) {
    return contentEl;
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {contentEl}
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  rootContainerEmbedded: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 12,
    marginVertical: 10,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 38 : 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE6',
    backgroundColor: colors.white,
  },
  topBarEmbedded: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FAF9F7',
    borderBottomColor: '#E5E7EB',
  },
  topBarSideLeft: {
    width: 65,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarSideRight: {
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.coffeeDeep,
    textAlign: 'center',
  },
  barSubtitle: {
    fontSize: 10.5,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  publishBtn: {
    backgroundColor: colors.coffeePrimary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.full,
    minWidth: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnDisabled: {
    opacity: 0.4,
  },
  publishBtnText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  scrollContentEmbedded: {
    padding: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userRowCompact: {
    marginBottom: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  avatarCompact: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  userTextCol: {
    flex: 1,
  },
  userBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  communityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
    gap: 3,
  },
  communityPillText: {
    fontSize: 9.5,
    color: '#059669',
    fontWeight: '700',
  },
  sloganText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    marginBottom: 8,
  },
  contentInput: {
    fontSize: 14.5,
    color: colors.textPrimary,
    lineHeight: 21,
    minHeight: 85,
    maxHeight: 180,
    textAlignVertical: 'top',
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  contentInputEmbedded: {
    minHeight: 75,
    maxHeight: 140,
    fontSize: 14,
  },
  photosSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.coffeeDark,
    marginBottom: 6,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  slotWrapper: {
    width: 74,
    height: 74,
    borderRadius: 12,
    overflow: 'hidden',
  },
  slotImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  slotImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  removeSlotBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(15,23,42,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  slotIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
    gap: 6,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tagChipText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  hashtagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  hashtagFieldWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 34,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hashSymbol: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.coffeePrimary,
    marginRight: 4,
  },
  hashtagTextInput: {
    flex: 1,
    fontSize: 12.5,
    color: colors.textPrimary,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  addTagBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  suggestedSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  suggestedTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  suggestedChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  suggestedChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestedChipText: {
    fontSize: 11,
    color: colors.coffeeDark,
    fontWeight: '500',
  },
  safeNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  safeNoticeText: {
    fontSize: 10.5,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 14,
  },
});
