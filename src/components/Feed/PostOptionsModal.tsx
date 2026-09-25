import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Post } from '../../types/post';

interface PostOptionsModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

export const PostOptionsModal: React.FC<PostOptionsModalProps> = ({
  visible,
  post,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!visible || !post) return null;

  const handleEditPress = () => {
    onClose();
    onEdit(post);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await onDelete(post);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDismiss = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.sheetContainer}>
          {showDeleteConfirm ? (
            /* Confirm Delete View */
            <View style={styles.confirmCard}>
              <View style={styles.warningIconCircle}>
                <Ionicons name="trash" size={26} color="#D32F2F" />
              </View>
              <Text style={styles.confirmTitle}>¿Eliminar publicación?</Text>
              <Text style={styles.confirmDesc}>
                Esta publicación se eliminará de forma permanente de tu perfil y del espacio de la comunidad.
              </Text>

              <View style={styles.confirmButtonsCol}>
                <TouchableOpacity
                  style={styles.deleteConfirmBtn}
                  onPress={handleConfirmDelete}
                  disabled={isDeleting}
                  activeOpacity={0.85}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.deleteConfirmBtnText}>Sí, eliminar</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.keepBtn}
                  onPress={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  activeOpacity={0.7}
                >
                  <Text style={styles.keepBtnText}>Conservar publicación</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Main Options Menu */
            <View style={styles.optionsCard}>
              {/* Drag Handle Bar */}
              <View style={styles.dragHandle} />

              <Text style={styles.optionsHeading}>Opciones de publicación</Text>

              <View style={styles.optionsList}>
                {/* 1. Edit Option */}
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={handleEditPress}
                  activeOpacity={0.75}
                >
                  <View style={[styles.optionIconCircle, { backgroundColor: '#F4EFEB' }]}>
                    <Ionicons name="create-outline" size={20} color={colors.coffeePrimary} />
                  </View>
                  <View style={styles.optionTextCol}>
                    <Text style={styles.optionTitle}>Editar publicación</Text>
                    <Text style={styles.optionSubtitle}>Modifica el texto y los temas</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* 2. Delete Option */}
                <TouchableOpacity
                  style={[styles.optionItem, styles.optionItemDanger]}
                  onPress={() => setShowDeleteConfirm(true)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.optionIconCircle, { backgroundColor: '#FDF0ED' }]}>
                    <Ionicons name="trash-outline" size={20} color="#D32F2F" />
                  </View>
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, { color: '#D32F2F' }]}>Eliminar publicación</Text>
                    <Text style={styles.optionSubtitle}>Borrar definitivamente</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#D32F2F" style={{ opacity: 0.6 }} />
                </TouchableOpacity>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0D8D0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  optionsCard: {
    width: '100%',
  },
  optionsHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F5',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0EBE6',
  },
  optionItemDanger: {
    backgroundColor: '#FFF8F7',
    borderColor: '#FCEBE8',
  },
  optionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  optionSubtitle: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  cancelButton: {
    backgroundColor: '#F5EFEA',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  // Delete Confirm Styles
  confirmCard: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  warningIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDECEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.coffeeDeep,
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  confirmButtonsCol: {
    width: '100%',
    gap: 10,
  },
  deleteConfirmBtn: {
    backgroundColor: '#D32F2F',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  deleteConfirmBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  keepBtn: {
    backgroundColor: '#F5EFEA',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBtnText: {
    color: colors.coffeeDark,
    fontSize: 13.5,
    fontWeight: '600',
  },
});
