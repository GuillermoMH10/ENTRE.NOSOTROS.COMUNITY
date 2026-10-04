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
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({
  visible,
  onClose,
  onPostCreated,
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.rootContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarSideLeft}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={colors.coffeeDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.topBarCenter}>
            <Text style={styles.barTitle}>Crear Publicación</Text>
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* User Info Bar with Slogan */}
          {user && (
            <View style={styles.userRow}>
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              <View style={styles.userTextCol}>
                <Text style={styles.username}>@{user.username}</Text>
                <Text style={styles.sloganText}>
                  Aquí puedes hablar, aquí puedes escuchar, aquí puedes encontrar ayuda
                </Text>
              </View>
            </View>
          )}

          {/* Main Description Input */}
          <TextInput
            style={styles.contentInput}
            placeholder="Desahógate, este es tu espacio..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={content}
            onChangeText={setContent}
            underlineColorAndroid="transparent"
            autoFocus
          />

          {/* 3 Ready-to-Use Photo Slots */}
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
                        >
                          <Ionicons name="close" size={14} color={colors.white} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.emptySlot}
                        onPress={() => handleSlotPress(slotIndex)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.slotIconCircle}>
                          <Ionicons name="image-outline" size={18} color={colors.coffeePrimary} />
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
                  <TouchableOpacity onPress={() => handleRemoveHashtag(tag)}>
                    <Ionicons name="close-circle" size={15} color="#4A7FB8" style={{ marginLeft: 4 }} />
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
            >
              <Ionicons name="add" size={20} color={colors.coffeePrimary} />
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
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.white,
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
  topBarSideLeft: {
    width: 85,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarSideRight: {
    width: 85,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7F3EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: colors.coffeeDeep,
    textAlign: 'center',
  },
  publishBtn: {
    backgroundColor: colors.coffeePrimary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: spacing.borderRadius.full,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnDisabled: {
    opacity: 0.4,
  },
  publishBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
  userTextCol: {
    flex: 1,
  },
  username: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginBottom: 2,
  },
  sloganText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 15,
    fontWeight: '500',
  },
  contentInput: {
    fontSize: 15.5,
    color: colors.textPrimary,
    lineHeight: 23,
    minHeight: 110,
    textAlignVertical: 'top',
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  photosSection: {
    marginTop: 10,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.coffeeDark,
    marginBottom: 8,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  slotWrapper: {
    flex: 1,
    aspectRatio: 1,
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
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  slotIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  slotLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.coffeeMedium,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 6,
    gap: 6,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF4FC',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 1,
    borderColor: '#D0E3F7',
  },
  tagChipText: {
    fontSize: 11.5,
    color: '#3B74B0',
    fontWeight: '600',
  },
  hashtagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  hashtagFieldWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  hashSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.coffeePrimary,
    marginRight: 4,
  },
  hashtagTextInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  addTagBtn: {
    width: 38,
    height: 38,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  suggestedSection: {
    marginTop: 6,
    marginBottom: 14,
  },
  suggestedTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  suggestedChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestedChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  suggestedChipText: {
    fontSize: 11.5,
    color: colors.coffeeDark,
    fontWeight: '500',
  },
});
