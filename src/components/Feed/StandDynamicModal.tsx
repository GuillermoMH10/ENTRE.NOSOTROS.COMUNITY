import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Easing,
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
  const [activity, setActivity] = useState<StandActivity | null>(null);
  const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Form State
  const [guestName, setGuestName] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Flow State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessStep, setIsSuccessStep] = useState<boolean>(false);
  const [animaAdvice, setAnimaAdvice] = useState<string>('');

  // Spin animation values
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Initial load
  useEffect(() => {
    if (visible) {
      setIsSuccessStep(false);
      setContent('');
      setImageUri(null);
      setActivity(null);
      setHasSpun(false);
      setIsSpinning(false);
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

  // Execute Spin animation and select random activity
  const handleSpinActivity = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    spinValue.setValue(0);
    scaleValue.setValue(1);

    Animated.parallel([
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.08,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setActivity(getRandomStandActivity());
      setHasSpun(true);
      setIsSpinning(false);
    });
  };

  const spinInterpolation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  // Pick image from library
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se necesita acceso a la galería para seleccionar una foto.');
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

  // Take photo with camera
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
    if (!activity) {
      Alert.alert('Actividad requerida', 'Por favor gira para obtener tu dinámica primero.');
      return;
    }

    const finalName = guestName.trim();
    if (!finalName) {
      Alert.alert('Nombre requerido', 'Por favor escribe tu nombre o apodo para continuar.');
      return;
    }

    if (!content.trim() && !imageUri) {
      Alert.alert(
        'Mensaje requerido',
        'Por favor escribe unas palabras o adjunta una foto para publicar.'
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
      Alert.alert('Error', result.error || 'No fue posible publicar. Intenta nuevamente.');
    }
  };

  const handleRegisterPress = () => {
    onClose();
    if (onNavigateToRegister) {
      onNavigateToRegister();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Conoce Entre Nosotros</Text>
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
            nestedScrollEnabled={true}
            contentContainerStyle={[styles.scrollBody, { flexGrow: 1, paddingBottom: 40 }]}
            keyboardShouldPersistTaps="handled"
          >
            {/* ANIMA Mascot at the very top */}
            <View style={styles.topMascotContainer}>
              <AnimaMascot size="lg" animated={true} />
            </View>

            {!isSuccessStep ? (
              <>
                {/* Spin Action / Activity Reveal Section */}
                {!hasSpun ? (
                  <View style={styles.spinPromptBox}>
                    <Text style={styles.spinPromptTitle}>
                      Descubre tu dinámica
                    </Text>
                    <Text style={styles.spinPromptSub}>
                      Toca el botón para recibir un reto de fotografía o un tema para compartir un consejo.
                    </Text>

                    <TouchableOpacity
                      style={styles.spinPrimaryBtn}
                      onPress={handleSpinActivity}
                      disabled={isSpinning}
                      activeOpacity={0.8}
                    >
                      <Animated.View
                        style={{
                          transform: [
                            { rotate: spinInterpolation },
                            { scale: scaleValue },
                          ],
                          marginRight: 8,
                        }}
                      >
                        <Ionicons name="sync" size={20} color={colors.white} />
                      </Animated.View>
                      <Text style={styles.spinPrimaryBtnText}>
                        {isSpinning ? 'Seleccionando...' : 'Girar dinámica'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.activityBox}>
                    <View style={styles.activityHeaderRow}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {activity?.category === 'Foto' ? 'Dinámica de Foto' : 'Dinámica de Consejo'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={handleSpinActivity}
                        style={styles.reSpinBtn}
                        disabled={isSpinning}
                        activeOpacity={0.7}
                      >
                        <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
                          <Ionicons name="refresh" size={14} color={colors.coffeePrimary} />
                        </Animated.View>
                        <Text style={styles.reSpinBtnText}>Girar de nuevo</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.activityTitle}>{activity?.title}</Text>
                    <Text style={styles.activityPrompt}>{activity?.prompt}</Text>
                  </View>
                )}

                {/* Form fields (Only visible once spun) */}
                {hasSpun && (
                  <>
                    {/* Name / Alias Input */}
                    <View style={styles.fieldSection}>
                      <Text style={styles.fieldLabel}>Nombre o apodo</Text>
                      <TextInput
                        style={styles.nameInput}
                        placeholder="Escribe tu nombre..."
                        placeholderTextColor={colors.textMuted}
                        value={guestName}
                        onChangeText={setGuestName}
                        maxLength={35}
                        editable={!isSubmitting}
                      />
                    </View>

                    {/* Message / Advice Input */}
                    <View style={styles.fieldSection}>
                      <Text style={styles.fieldLabel}>Mensaje o consejo</Text>
                      <TextInput
                        style={styles.textArea}
                        placeholder={activity?.placeholder || 'Escribe tus palabras aquí...'}
                        placeholderTextColor={colors.textMuted}
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
                      <Text style={styles.fieldLabel}>Foto</Text>
                      {imageUri ? (
                        <View style={styles.imagePreviewWrapper}>
                          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                          <TouchableOpacity
                            onPress={() => setImageUri(null)}
                            style={styles.removeImageBtn}
                          >
                            <Ionicons name="trash-outline" size={16} color={colors.white} />
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
                            <Ionicons name="camera-outline" size={18} color={colors.coffeePrimary} />
                            <Text style={styles.photoPickerText}>Tomar foto</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.photoPickerBtn}
                            onPress={handlePickImage}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="image-outline" size={18} color={colors.coffeePrimary} />
                            <Text style={styles.photoPickerText}>Galería</Text>
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
                        <ActivityIndicator color={colors.white} size="small" />
                      ) : (
                        <Text style={styles.submitBtnText}>Publicar</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              /* Success / Celebration View */
              <View style={styles.successContainer}>
                <View style={styles.speechBubble}>
                  <Text style={styles.speechTitle}>Gracias por participar</Text>
                  <Text style={styles.speechBody}>{animaAdvice}</Text>
                </View>

                <View style={styles.badgeSuccessPill}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={colors.coffeePrimary} style={{ marginRight: 6 }} />
                  <Text style={styles.badgeSuccessText}>
                    Tu publicación ya se encuentra activa en la comunidad
                  </Text>
                </View>

                {!user ? (
                  <View style={styles.claimAccountBox}>
                    <Text style={styles.claimTitle}>¿Deseas conservar tu autoría?</Text>
                    <Text style={styles.claimDesc}>
                      Al crear una cuenta, esta publicación se asociará formalmente a tu perfil.
                    </Text>

                    <TouchableOpacity
                      style={styles.registerBtn}
                      onPress={handleRegisterPress}
                      activeOpacity={0.85}
                    >
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
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
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  topMascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  spinPromptBox: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginVertical: 10,
  },
  spinPromptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginBottom: 6,
    textAlign: 'center',
  },
  spinPromptSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  spinPrimaryBtn: {
    backgroundColor: colors.coffeePrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  spinPrimaryBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  activityBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    marginBottom: 16,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.coffeeDark,
    textTransform: 'uppercase',
  },
  reSpinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  reSpinBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.coffeePrimary,
    marginLeft: 5,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginBottom: 6,
  },
  activityPrompt: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  fieldSection: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.coffeeDeep,
    marginBottom: 6,
  },
  nameInput: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textArea: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
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
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: 12,
    paddingVertical: 11,
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
    borderColor: colors.borderLight,
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
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  submitBtn: {
    backgroundColor: colors.coffeePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        cursor: 'pointer',
      },
    }),
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  /* Celebration / Success Step */
  successContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  speechBubble: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  speechTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginBottom: 6,
    textAlign: 'center',
  },
  speechBody: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  badgeSuccessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeSuccessText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.coffeeDark,
  },
  claimAccountBox: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  claimTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.coffeeDeep,
    marginBottom: 4,
    textAlign: 'center',
  },
  claimDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 12,
  },
  registerBtn: {
    backgroundColor: colors.coffeePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
  },
  registerBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  doneBtn: {
    paddingVertical: 11,
    paddingHorizontal: 26,
    borderRadius: 10,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  doneBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
