import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Post } from '../../types/post';
import { updatePostContent } from '../../services/postsService';

interface EditPostModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onPostUpdated?: () => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  visible,
  post,
  onClose,
  onPostUpdated,
}) => {
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && post) {
      setContent(post.content || '');
      setHashtags(post.hashtags || []);
      setNewTagInput('');
    }
  }, [visible, post]);

  if (!visible || !post) return null;

  const handleAddTag = () => {
    const raw = newTagInput.trim();
    if (!raw) return;
    const tag = raw.startsWith('#') ? raw : `#${raw}`;
    const cleanTag = tag.replace(/\s+/g, '');
    if (cleanTag.length > 1 && !hashtags.includes(cleanTag)) {
      setHashtags((prev) => [...prev, cleanTag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!post) return;
    setIsSaving(true);
    const result = await updatePostContent(post.id, content, hashtags);
    setIsSaving(false);

    if (result.success) {
      onPostUpdated?.();
      onClose();
    } else {
      Alert.alert('Error', result.error || 'No se pudo guardar los cambios.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Editar Publicación</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.coffeeDark} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Content Input */}
            <Text style={styles.inputLabel}>Contenido:</Text>
            <TextInput
              style={styles.contentInput}
              multiline
              value={content}
              onChangeText={setContent}
              placeholder="¿Qué deseas actualizar?"
              placeholderTextColor={colors.textMuted}
            />

            {/* Hashtags Chips */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Hashtags (#):</Text>
            {hashtags.length > 0 && (
              <View style={styles.tagsContainer}>
                {hashtags.map((tag, idx) => (
                  <View key={idx} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                      <Ionicons name="close-circle" size={15} color="#3B79BA" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Tag Input */}
            <View style={styles.tagInputRow}>
              <Text style={styles.hashPrefix}>#</Text>
              <TextInput
                style={styles.tagInputField}
                placeholder="agrega_un_tema"
                placeholderTextColor={colors.textMuted}
                value={newTagInput}
                onChangeText={setNewTagInput}
                onSubmitEditing={handleAddTag}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag} activeOpacity={0.7}>
                <Ionicons name="add" size={20} color={colors.coffeePrimary} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16.5,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  closeBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E8E1D9',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#FAF7F5',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#3B79BA',
    fontWeight: '600',
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E1D9',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: '#FAF7F5',
  },
  hashPrefix: {
    fontSize: 14,
    color: '#3B79BA',
    fontWeight: '700',
    marginRight: 4,
  },
  tagInputField: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  addTagBtn: {
    padding: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE6',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 13.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.coffeePrimary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 85,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13.5,
    color: colors.white,
    fontWeight: '700',
  },
});
