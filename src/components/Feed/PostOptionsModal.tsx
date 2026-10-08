import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Post } from '../../types/post';
import { reportPost } from '../../services/postsService';

interface PostOptionsModalProps {
  visible: boolean;
  post: Post | null;
  currentUserId?: string;
  onClose: () => void;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onReport?: (post: Post) => void;
}

export const PostOptionsModal: React.FC<PostOptionsModalProps> = ({
  visible,
  post,
  currentUserId,
  onClose,
  onEdit,
  onDelete,
  onReport,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportedDone, setReportedDone] = useState(false);

  if (!visible || !post) return null;

  const isAuthor = Boolean(currentUserId && currentUserId === post.authorId);

  const handleEditPress = () => {
    onClose();
    if (onEdit) onEdit(post);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    await onDelete(post);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleConfirmReport = async () => {
    setIsReporting(true);
    await reportPost(post.id, currentUserId);
    setIsReporting(false);
    setReportedDone(true);
    if (onReport) onReport(post);
    setTimeout(() => {
      setReportedDone(false);
      setShowReportConfirm(false);
      onClose();
    }, 1500);
  };

  const handleDismiss = () => {
    setShowDeleteConfirm(false);
    setShowReportConfirm(false);
    setReportedDone(false);
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
                <Ionicons name="trash" size={26} color="#DC2626" />
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
          ) : showReportConfirm ? (
            /* Confirm Report View (Discreet) */
            <View style={styles.confirmCard}>
              <View style={[styles.warningIconCircle, { backgroundColor: colors.surface }]}>
                <Ionicons
                  name={reportedDone ? "checkmark-circle" : "flag-outline"}
                  size={26}
                  color={reportedDone ? "#16A34A" : colors.primary}
                />
              </View>
              <Text style={styles.confirmTitle}>
                {reportedDone ? 'Reporte enviado' : '¿Reportar publicación?'}
              </Text>
              <Text style={styles.confirmDesc}>
                {reportedDone
                  ? 'Gracias por ayudarnos a cuidar la comunidad. Nuestro equipo revisará el contenido.'
                  : 'Si consideras que esta publicación incumple las normas de convivencia o contiene información dañina, puedes reportarla.'}
              </Text>

              {!reportedDone && (
                <View style={styles.confirmButtonsCol}>
                  <TouchableOpacity
                    style={styles.reportConfirmBtn}
                    onPress={handleConfirmReport}
                    disabled={isReporting}
                    activeOpacity={0.85}
                  >
                    {isReporting ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.reportConfirmBtnText}>Confirmar reporte</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.keepBtn}
                    onPress={() => setShowReportConfirm(false)}
                    disabled={isReporting}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keepBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* Main Options Menu */
            <View style={styles.optionsCard}>
              {/* Drag Handle Bar */}
              <View style={styles.dragHandle} />

              <Text style={styles.optionsHeading}>Opciones de publicación</Text>

              <View style={styles.optionsList}>
                {/* Author Options */}
                {isAuthor && onEdit && (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={handleEditPress}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.optionIconCircle, { backgroundColor: colors.surface }]}>
                      <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.optionTextCol}>
                      <Text style={styles.optionTitle}>Editar publicación</Text>
                      <Text style={styles.optionSubtitle}>Modifica el texto y los temas</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}

                {isAuthor && onDelete && (
                  <TouchableOpacity
                    style={[styles.optionItem, styles.optionItemDanger]}
                    onPress={() => setShowDeleteConfirm(true)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.optionIconCircle, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="trash-outline" size={20} color="#DC2626" />
                    </View>
                    <View style={styles.optionTextCol}>
                      <Text style={[styles.optionTitle, { color: '#DC2626' }]}>Eliminar publicación</Text>
                      <Text style={styles.optionSubtitle}>Borrar definitivamente</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#DC2626" style={{ opacity: 0.6 }} />
                  </TouchableOpacity>
                )}

                {/* Non-Author Discreet Report Option */}
                {!isAuthor && (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => setShowReportConfirm(true)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.optionIconCircle, { backgroundColor: colors.surface }]}>
                      <Ionicons name="flag-outline" size={19} color={colors.textSecondary} />
                    </View>
                    <View style={styles.optionTextCol}>
                      <Text style={styles.optionTitle}>Reportar publicación</Text>
                      <Text style={styles.optionSubtitle}>Reportar contenido inapropiado</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
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
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderMedium,
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
    backgroundColor: colors.surfaceSoft,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  optionItemDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
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
    color: colors.textSecondary,
    marginTop: 2,
  },
  cancelButton: {
    backgroundColor: colors.surfaceSoft,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.coffeeDark,
  },
  confirmCard: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  warningIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
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
    backgroundColor: '#DC2626',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  reportConfirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportConfirmBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  keepBtn: {
    backgroundColor: colors.surfaceSoft,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  keepBtnText: {
    color: colors.coffeeDark,
    fontSize: 13.5,
    fontWeight: '600',
  },
});
