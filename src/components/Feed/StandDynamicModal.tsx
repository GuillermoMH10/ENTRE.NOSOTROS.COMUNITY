import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  StandActivity,
  getRandomStandActivity,
  getRandomAnimaAdvice,
} from '../../data/standDynamicActivities';
import {
  submitStandDynamicPost,
  getStoredGuestName,
} from '../../services/standDynamicService';
import { AnimaMascot } from '../Anima/AnimaMascot';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

interface StandDynamicModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToRegister?: () => void;
}

export const StandDynamicModal: React.FC<StandDynamicModalProps> = ({
  visible,
  onClose,
  onNavigateToRegister,
}) => {
  const { user } = useAuth();

  // Activity State
  const [activity, setActivity] = useState<StandActivity>(getRandomStandActivity);
  const [guestName, setGuestName] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Flow State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessStep, setIsSuccessStep] = useState<boolean>(false);
  const [animaAdvice, setAnimaAdvice] = useState<string>('');

  // Initial load: pick a fresh activity and restore previous guest name or logged user name
  useEffect(() => {
    if (visible) {
      setIsSuccessStep(false);
      setContent('');
      setImageUri(null);
      setActivity(getRandomStandActivity());
      setAnimaAdvice(getRandomAnimaAdvice());

      if (user?.username) {
        setGuestName(user.username);
      } else {
        getStoredGuestName().then((name) => {
          if (name) setGuestName(name);
        });
      }
    }
  }, [visible, user]);

  // Roll new activity
  const handleRollNewActivity = () => {
    setActivity(getRandomStandActivity());
  };

  // Pick image from library
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se necesita acceso a la galería para subir una foto.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.35,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const finalUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setImageUri(finalUri);
      }
    } catch (err) {
      console.warn('Error al seleccionar imagen:', err);
    }
  };

  // Take photo from camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se necesita acceso a la cámara para tomar una foto.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.35,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const finalUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setImageUri(finalUri);
      }
    } catch (err) {
      console.warn('Error al tomar foto:', err);
    }
  };

  // Submit Post
  const handleSubmit = async () => {
    const finalName = guestName.trim();
    if (!finalName) {
      Alert.alert('Nombre requerido', 'Por favor dinos tu nombre o apodo para publicar.');
      return;
    }

    if (!content.trim() && !imageUri) {
      Alert.alert(
        'Comparte algo',
        'Por favor escribe unas palabras o sube una foto correspondiente a la actividad.'
      );
      return;
    }

    setIsSubmitting(true);
    const result = await submitStandDynamicPost({
      guestName: finalName,
      activity,
      content,
      mediaSource: imageUri,
      userId: user?.id,
      userUsername: user?.username,
      userAvatarUrl: user?.avatarUrl,
    });
    setIsSubmitting(false);

    if (result.success) {
      setIsSuccessStep(true);
    } else {
      Alert.alert('Error', result.error || 'No se pudo publicar. Inténtalo de nuevo.');
    }
  };

  const handleRegisterPress = () => {
    onClose();
    if (onNavigateToRegister) {
      onNavigateToRegister();
    }
  };

  // Category badge color mapping
  const getCategoryColor = (cat: StandActivity['category']) => {
    switch (cat) {
      case 'Consejo':
        return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
      case 'Foto':
        return { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8' };
      case 'Gratitud':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'Autocuidado':
        return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
      case 'Esperanza':
        return { bg: '#F3E8FF', text: '#6B21A8', border: '#E9D5FF' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
    }
  };

  const catColors = getCategoryColor(activity.category);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>🎪 Dinámica del Stand</Text>
              <View style={styles.headerPill}>
                <Text style={styles.headerPillText}>#ConoceEntreNosotros</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {!isSuccessStep ? (
              <>
                {/* Random Activity Card */}
                <View style={styles.activityBox}>
                  <View style={styles.activityTopRow}>
                    <View
                      style={[
                        styles.categoryPill,
                        { backgroundColor: catColors.bg, borderColor: catColors.border },
                      ]}
                    >
                      <Text style={[styles.categoryText, { color: catColors.text }]}>
                        {activity.category}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={handleRollNewActivity}
                      style={styles.spinBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="dice-outline" size={16} color="#D97706" />
                      <Text style={styles.spinBtnText}>Girar otra (#100)</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.activityTitle}>
                    {activity.id}. {activity.title}
                  </Text>
                  <Text style={styles.activityPrompt}>{activity.prompt}</Text>
                </View>

                {/* Name / Alias Input */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Tu nombre o apodo:</Text>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Ej. Sofía, Alex o Anónimo Valiente..."
                    placeholderTextColor="#9CA3AF"
                    value={guestName}
                    onChangeText={setGuestName}
                    maxLength={35}
                    editable={!isSubmitting}
                  />
                  <Text style={styles.fieldHint}>
                    {user
                      ? `Conectado como @${user.username}`
                      : 'Sin registro previo: solo tu nombre para saludarte en el muro.'}
                  </Text>
                </View>

                {/* Message Input */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Tu respuesta o mensaje:</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder={activity.placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={content}
                    onChangeText={setContent}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={600}
                    editable={!isSubmitting}
                  />
                </View>

                {/* Photo / Camera Section */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Foto (Opcional):</Text>
                  {imageUri ? (
                    <View style={styles.imagePreviewWrapper}>
                      <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                      <TouchableOpacity
                        onPress={() => setImageUri(null)}
                        style={styles.removeImageBtn}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.removeImageText}>Quitar foto</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.photoButtonsRow}>
                      <TouchableOpacity
                        style={styles.photoPickerBtn}
                        onPress={handleTakePhoto}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="camera-outline" size={20} color={colors.coffeePrimary} />
                        <Text style={styles.photoPickerText}>Tomar foto</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.photoPickerBtn}
                        onPress={handlePickImage}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="image-outline" size={20} color={colors.coffeePrimary} />
                        <Text style={styles.photoPickerText}>Subir de galería</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.submitBtnText}>Publicar en el Muro en Vivo</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.disclaimerText}>
                  ✨ Se publicará al instante en el feed comunitario y se guardará en tu dispositivo.
                </Text>
              </>
            ) : (
              /* Success / Celebration step with ANIMA */
              <View style={styles.successContainer}>
                {/* ANIMA Mascot & Speech */}
                <View style={styles.animaRow}>
                  <AnimaMascot size="lg" animated={true} />
                </View>

                <View style={styles.speechBubble}>
                  <Text style={styles.speechTitle}>¡Gracias por apoyar y participar! 💙</Text>
                  <Text style={styles.speechBody}>{animaAdvice}</Text>
                </View>

                <View style={styles.badgeSuccessPill}>
                  <Ionicons name="checkmark-circle" size={18} color="#15803D" style={{ marginRight: 6 }} />
                  <Text style={styles.badgeSuccessText}>
                    Tu publicación ya está activa en el feed y guardada localmente
                  </Text>
                </View>

                {/* Registration invitation if not logged in */}
                {!user ? (
                  <View style={styles.claimAccountBox}>
                    <Text style={styles.claimTitle}>¿Quieres que esta publicación sea tuya?</Text>
                    <Text style={styles.claimDesc}>
                      Si creas tu cuenta gratuita ahora, tu publicación se convertirá automáticamente
                      en tuya con tu insignia de bienvenida.
                    </Text>

                    <TouchableOpacity
                      style={styles.registerBtn}
                      onPress={handleRegisterPress}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.registerBtnText}>Crear cuenta y vincular publicación</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
                  <Text style={styles.doneBtnText}>Ver en el Feed</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginRight: 8,
  },
  headerPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  headerPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    padding: 20,
  },
  activityBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  activityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  spinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  spinBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  activityPrompt: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  fieldSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  nameInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  fieldHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginLeft: 2,
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    minHeight: 85,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoPickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5F0',
    borderWidth: 1,
    borderColor: '#EBDCD0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  photoPickerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.coffeePrimary,
    marginLeft: 6,
  },
  imagePreviewWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  submitBtn: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#B45309',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 3px 10px rgba(180, 83, 9, 0.25)',
        cursor: 'pointer',
      },
    }),
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  disclaimerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 10,
  },
  /* Celebration / Success Step */
  successContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  animaRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  speechBubble: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 18,
    padding: 18,
    width: '100%',
    marginBottom: 16,
  },
  speechTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 6,
    textAlign: 'center',
  },
  speechBody: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
    textAlign: 'center',
  },
  badgeSuccessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 18,
  },
  badgeSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  claimAccountBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  claimTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
    textAlign: 'center',
  },
  claimDesc: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 12,
  },
  registerBtn: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  doneBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
});
