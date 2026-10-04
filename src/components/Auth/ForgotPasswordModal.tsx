import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import {
  sendPasswordResetCode,
  verifyResetCode,
  completePasswordReset,
  EMAILJS_CONFIG,
} from '../../services/passwordResetService';

interface ForgotPasswordModalProps {
  visible: boolean;
  initialEmail?: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'email' | 'code' | 'newPassword' | 'success';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  initialEmail = '',
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userName, setUserName] = useState('');

  // Password criteria check
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleResetState = () => {
    setStep('email');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setIsLoading(false);
  };

  const handleModalClose = () => {
    handleResetState();
    onClose();
  };

  // Step 1: Send reset code
  const handleSendCode = async () => {
    if (!email.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    const result = await sendPasswordResetCode(email);
    setIsLoading(false);

    if (result.success) {
      if (result.username) setUserName(result.username);
      setStep('code');
    } else {
      setErrorMessage(result.error || 'No se pudo enviar el correo de recuperación.');
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      setErrorMessage('Por favor ingresa el código de 6 dígitos que enviamos a tu correo.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    const result = await verifyResetCode(email, code);
    setIsLoading(false);

    if (result.success) {
      setStep('newPassword');
    } else {
      setErrorMessage(result.error || 'Código incorrecto o expirado.');
    }
  };

  // Step 3: Complete reset
  const handleSaveNewPassword = async () => {
    if (!isPasswordValid) {
      setErrorMessage('La contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }
    if (!doPasswordsMatch) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const result = await completePasswordReset(email, code, newPassword);
    setIsLoading(false);

    if (result.success) {
      setStep('success');
    } else {
      setErrorMessage(result.error || 'No se pudo actualizar la contraseña.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleModalClose}>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={
                    step === 'email'
                      ? 'mail-outline'
                      : step === 'code'
                      ? 'key-outline'
                      : step === 'newPassword'
                      ? 'lock-closed-outline'
                      : 'checkmark-circle'
                  }
                  size={20}
                  color={colors.coffeePrimary}
                />
              </View>
              <Text style={styles.modalTitle}>
                {step === 'email' && 'Recuperar Contraseña'}
                {step === 'code' && 'Ingresar Código'}
                {step === 'newPassword' && 'Nueva Contraseña'}
                {step === 'success' && '¡Contraseña Lista!'}
              </Text>
            </View>

            <TouchableOpacity onPress={handleModalClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Error banner */}
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#B91C1C" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* STEP 1: Enter Email */}
            {step === 'email' && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepDescription}>
                  Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos un código de
                  seguridad para restablecer tu contraseña.
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons name="mail" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="tucorreo@ejemplo.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (errorMessage) setErrorMessage('');
                    }}
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                  onPress={handleSendCode}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>Enviar Código</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.white} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: Enter Code */}
            {step === 'code' && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepDescription}>
                  Hemos enviado un código de seguridad de 6 dígitos a{' '}
                  <Text style={{ fontWeight: '700', color: colors.coffeePrimary }}>{email}</Text>.
                  Por favor ingrésalo a continuación:
                </Text>

                <View style={styles.codeInputWrapper}>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="000000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={(t) => {
                      setCode(t);
                      if (errorMessage) setErrorMessage('');
                    }}
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                  onPress={handleVerifyCode}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>Verificar Código</Text>
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleSendCode}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendText}>¿No recibiste el código? Reenviar correo</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: Enter New Password */}
            {step === 'newPassword' && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepDescription}>
                  Crea una nueva contraseña segura para proteger tu cuenta.
                </Text>

                {/* Password field */}
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nueva contraseña"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={(t) => {
                      setNewPassword(t);
                      if (errorMessage) setErrorMessage('');
                    }}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Security Criteria Checklist */}
                <View style={styles.criteriaCard}>
                  <View style={styles.criteriaRow}>
                    <Ionicons
                      name={hasMinLength ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={hasMinLength ? '#15803D' : colors.textMuted}
                    />
                    <Text style={[styles.criteriaText, hasMinLength && styles.criteriaMet]}>
                      Mínimo 8 caracteres
                    </Text>
                  </View>
                  <View style={styles.criteriaRow}>
                    <Ionicons
                      name={hasUpperCase ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={hasUpperCase ? '#15803D' : colors.textMuted}
                    />
                    <Text style={[styles.criteriaText, hasUpperCase && styles.criteriaMet]}>
                      Al menos una mayúscula (A-Z)
                    </Text>
                  </View>
                  <View style={styles.criteriaRow}>
                    <Ionicons
                      name={hasNumber ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={hasNumber ? '#15803D' : colors.textMuted}
                    />
                    <Text style={[styles.criteriaText, hasNumber && styles.criteriaMet]}>
                      Al menos un número (0-9)
                    </Text>
                  </View>
                  <View style={styles.criteriaRow}>
                    <Ionicons
                      name={hasSpecialChar ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={hasSpecialChar ? '#15803D' : colors.textMuted}
                    />
                    <Text style={[styles.criteriaText, hasSpecialChar && styles.criteriaMet]}>
                      Un carácter especial (!@#$%)
                    </Text>
                  </View>
                </View>

                {/* Confirm password field */}
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirmar nueva contraseña"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {confirmPassword.length > 0 && (
                  <Text
                    style={[
                      styles.matchText,
                      { color: doPasswordsMatch ? '#15803D' : '#B91C1C' },
                    ]}
                  >
                    {doPasswordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                  </Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    (!isPasswordValid || !doPasswordsMatch || isLoading) && styles.btnDisabled,
                  ]}
                  onPress={handleSaveNewPassword}
                  disabled={!isPasswordValid || !doPasswordsMatch || isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>Guardar Contraseña</Text>
                      <Ionicons name="shield-checkmark" size={16} color={colors.white} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 4: Success Confirmation */}
            {step === 'success' && (
              <View style={[styles.stepContainer, { alignItems: 'center', paddingVertical: 10 }]}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={36} color={colors.white} />
                </View>

                <Text style={styles.successTitle}>¡Contraseña Actualizada!</Text>
                <Text style={styles.successDesc}>
                  Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu
                  nueva clave.
                </Text>

                <TouchableOpacity
                  style={[styles.primaryBtn, { width: '100%', marginTop: 20 }]}
                  onPress={() => {
                    handleResetState();
                    onSuccess();
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Iniciar Sesión Ahora</Text>
                  <Ionicons name="log-in-outline" size={18} color={colors.white} />
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FAF7F5',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    padding: 20,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
  },
  stepContainer: {
    gap: 12,
  },
  stepDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  eyeBtn: {
    padding: 6,
  },
  codeInputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  codeInput: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.coffeePrimary,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 10,
    color: colors.coffeeDark,
    paddingVertical: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coffeePrimary,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
    marginTop: 6,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.5,
    backgroundColor: colors.textMuted,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  resendText: {
    fontSize: 12,
    color: colors.coffeePrimary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  criteriaCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  criteriaText: {
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  criteriaMet: {
    color: '#15803D',
    fontWeight: '600',
  },
  matchText: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: -4,
    marginBottom: 4,
    paddingLeft: 4,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.coffeePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.coffeePrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.coffeeDark,
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
});
